/**
 * OpenAI-compatible HTTP proxy → Cognition Connect-RPC.
 *
 * Binds at 127.0.0.1:42100 (or fallback port). Accepts standard
 * /v1/chat/completions and /v1/models requests, translates to
 * WindSurf's cloud-direct GetChatMessage wire format.
 */
import * as crypto from "crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { streamChatEvents, CloudChatError, type ChatHistoryItem, type ToolDef } from "./chat";
import { resolveModelOrPassthrough, getDefaultModel, getCanonicalModels } from "./models";
import { loadCredentials } from "./oauth";

const WINDSURF_PROXY_HOST = "127.0.0.1";
const WINDSURF_PROXY_PORT = 42100;

// Per-process secret — same-process callers use this as Bearer token.
export const PROXY_SECRET: string = crypto.randomBytes(32).toString("hex");

// In-memory credentials cache — set from extension on startup/after login
export let proxyCredentials: { apiKey: string; apiServerUrl: string } | null = null;
export function setProxyCredentials(creds: { apiKey: string; apiServerUrl: string } | null): void {
  proxyCredentials = creds;
}

// ----------------------------------------------------------------------------
// Proxy handler (Node http server)
// ----------------------------------------------------------------------------

interface ChatCompletionRequest {
  model?: string;
  messages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
    tool_call_id?: string;
    tool_calls?: Array<{ id?: string; type?: string; function?: { name?: string; arguments?: string } }>;
  }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  tools?: Array<{ type?: string; function?: { name?: string; description?: string; parameters?: Record<string, unknown> } }>;
  providerOptions?: Record<string, unknown>;
}

function mapMessageToHistoryItem(m: ChatCompletionRequest["messages"][number]): ChatHistoryItem {
  const item: ChatHistoryItem = { role: m.role as ChatHistoryItem["role"], content: m.content as ChatHistoryItem["content"] };
  if (m.role === "tool" && typeof m.tool_call_id === "string" && m.tool_call_id.length > 0) {
    item.tool_call_id = m.tool_call_id;
  }
  if (m.role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
    item.tool_calls = m.tool_calls
      .map(tc => ({ id: typeof tc.id === "string" ? tc.id : "", name: typeof tc.function?.name === "string" ? tc.function.name : "", arguments: typeof tc.function?.arguments === "string" ? tc.function.arguments : "" }))
      .filter(tc => tc.id !== "" && tc.name !== "");
  }
  return item;
}

function extractVariantFromProviderOptions(providerOptions: Record<string, unknown> | undefined): string | undefined {
  if (!providerOptions) return undefined;
  const windsurfRaw = providerOptions["windsurf"];
  const windsurf = windsurfRaw && typeof windsurfRaw === "object" ? (windsurfRaw as Record<string, unknown>) : undefined;
  const pickString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
  return pickString(windsurf?.["variant"]) ?? pickString(windsurf?.["variantID"]) ?? pickString(windsurf?.["variantId"]) ?? pickString(providerOptions["variant"]) ?? pickString(providerOptions["variantID"]) ?? pickString(providerOptions["variantId"]);
}

function openAIError(status: number, message: string, details?: string): object {
  return { status, body: JSON.stringify({ error: { message: details ? `${message}\n${details}` : message, type: "windsurf_error", param: null, code: null } }), contentType: "application/json" };
}

async function authorizeRequest(req: IncomingMessage): Promise<{ status: number; body: string; contentType: string } | null> {
  const authHeader = (req.headers.authorization ?? "") as string;
  if (!authHeader.startsWith("Bearer ")) {
    return { status: 401, body: JSON.stringify({ error: { message: "Unauthorized: missing or malformed Authorization header.", type: "windsurf_error" } }), contentType: "application/json" };
  }
  const presented = authHeader.slice("Bearer ".length);
  const presentedBuf = Buffer.from(presented, "utf8");

  // Accept per-process secret
  const secretBuf = Buffer.from(PROXY_SECRET, "utf8");
  if (presentedBuf.length === secretBuf.length && crypto.timingSafeEqual(presentedBuf, secretBuf)) return null;

  // Accept in-memory credentials (synced from Pi's OAuth store)
  if (proxyCredentials?.apiKey) {
    const credBuf = Buffer.from(proxyCredentials.apiKey, "utf8");
    if (presentedBuf.length === credBuf.length && crypto.timingSafeEqual(presentedBuf, credBuf)) return null;
  }
  // Accept persisted apiKey from disk (set by standalone CLI)
  try {
    const creds = loadCredentials();
    if (creds?.apiKey && creds.apiKey !== proxyCredentials?.apiKey) {
      const credBuf = Buffer.from(creds.apiKey, "utf8");
      if (presentedBuf.length === credBuf.length && crypto.timingSafeEqual(presentedBuf, credBuf)) return null;
    }
  } catch {}

  return { status: 401, body: JSON.stringify({ error: { message: "Unauthorized: Invalid Bearer token.", type: "windsurf_error" } }), contentType: "application/json" };
}

function getBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", c => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url ?? "/", `http://${WINDSURF_PROXY_HOST}`);

    // /health — unauthenticated
    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    // Auth gate for everything else
    const authErr = await authorizeRequest(req);
    if (authErr) {
      res.writeHead(authErr.status, { "Content-Type": authErr.contentType });
      res.end(authErr.body);
      return;
    }

    // /v1/models
    if (url.pathname === "/v1/models" || url.pathname === "/models") {
      const modelIds = getCanonicalModels();
      const data = modelIds.map(id => ({ id, object: "model", created: Math.floor(Date.now() / 1000), owned_by: "windsurf" }));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ object: "list", data }));
      return;
    }

    // /v1/chat/completions
    if (url.pathname === "/v1/chat/completions" || url.pathname === "/chat/completions") {
      if (req.method !== "POST") {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Method not allowed; use POST.", type: "windsurf_error" } }));
        return;
      }

      const rawBody = await getBody(req);
      let requestBody: ChatCompletionRequest;
      try { requestBody = JSON.parse(rawBody); }
      catch { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: "Malformed JSON." } })); return; }

      if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "messages must be an array." } }));
        return;
      }

      const diskCreds = loadCredentials();
      const creds = diskCreds ?? proxyCredentials;
      if (!creds) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Not authenticated. Run /login windsurf first." } }));
        return;
      }

      const requestedModel = requestBody.model || getDefaultModel();
      const variantOverride = extractVariantFromProviderOptions(requestBody.providerOptions);
      const resolved = resolveModelOrPassthrough(requestedModel + (variantOverride ? `:${variantOverride}` : ""));

      const tools: ToolDef[] = (requestBody.tools ?? []).map(t => ({
        name: t.function?.name ?? "unknown",
        description: t.function?.description ?? "",
        parameters: t.function?.parameters ?? {},
      }));

      const multimodalMessages: ChatHistoryItem[] = requestBody.messages.map(m => mapMessageToHistoryItem(m));
      const requestedMaxTokens = typeof requestBody.max_tokens === "number" && requestBody.max_tokens > 0 ? requestBody.max_tokens : 128_000;
      const isStreaming = requestBody.stream !== false;

      if (isStreaming) {
        // SSE streaming response
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        });

        const responseId = `chatcmpl-${crypto.randomUUID()}`;
        const abort = new AbortController();
        req.on("close", () => { if (!res.writableEnded) abort.abort(); });

        try {
          let firstChunkSent = false;
          let toolCallIndex = -1;
          const toolIdToIndex = new Map<string, number>();
          let lastToolCallId: string | undefined;
          let finishReason: "stop" | "tool_calls" | "length" | "content_filter" | null = null;
          let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | null = null;

          for await (const ev of streamChatEvents({
            apiKey: creds.apiKey,
            apiServerUrl: creds.apiServerUrl,
            modelUid: resolved.modelUid,
            messages: multimodalMessages,
            tools: tools.length > 0 ? tools : undefined,
            signal: abort.signal,
            completionOpts: { maxOutputTokens: requestedMaxTokens },
          })) {
            const role = firstChunkSent ? undefined : "assistant";

            if (ev.kind === "text") {
              const chunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [{ index: 0, delta: role ? { role, content: ev.text } : { content: ev.text }, finish_reason: null }] };
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              firstChunkSent = true;
            } else if (ev.kind === "reasoning") {
              const chunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [{ index: 0, delta: role ? { role, reasoning: ev.text } : { reasoning: ev.text }, finish_reason: null }] };
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              firstChunkSent = true;
            } else if (ev.kind === "tool_call_start") {
              toolCallIndex += 1;
              toolIdToIndex.set(ev.id, toolCallIndex);
              lastToolCallId = ev.id;
              const baseDelta = { tool_calls: [{ index: toolCallIndex, id: ev.id, type: "function", function: { name: ev.name, arguments: "" } }] };
              const delta = firstChunkSent ? baseDelta : { role: "assistant", ...baseDelta };
              const chunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [{ index: 0, delta, finish_reason: null }] };
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              firstChunkSent = true;
            } else if (ev.kind === "tool_call_args") {
              if (lastToolCallId === undefined || toolCallIndex < 0) continue;
              const routeKey = ev.id ?? lastToolCallId;
              const idx = toolIdToIndex.get(routeKey) ?? toolCallIndex;
              const chunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [{ index: 0, delta: { tool_calls: [{ index: idx, function: { arguments: ev.argsDelta } }] }, finish_reason: null }] };
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            } else if (ev.kind === "finish") {
              finishReason = ev.reason;
            } else if (ev.kind === "usage") {
              usage = { promptTokens: ev.promptTokens, completionTokens: ev.completionTokens, totalTokens: ev.totalTokens };
            }
          }

          const finalReason = finishReason ?? (toolCallIndex >= 0 ? "tool_calls" : "stop");
          const finishChunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [{ index: 0, delta: {}, finish_reason: finalReason }] };
          res.write(`data: ${JSON.stringify(finishChunk)}\n\n`);

          if (usage) {
            const usageChunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [], usage: { prompt_tokens: usage.promptTokens ?? 0, completion_tokens: usage.completionTokens ?? 0, total_tokens: usage.totalTokens ?? 0 } };
            res.write(`data: ${JSON.stringify(usageChunk)}\n\n`);
          }
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          try {
            res.write(`data: ${JSON.stringify({ error: { message: errorMessage } })}\n\n`);
            const fChunk = { id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: requestedModel, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] };
            res.write(`data: ${JSON.stringify(fChunk)}\n\n`);
            res.write("data: [DONE]\n\n");
            res.end();
          } catch { /* socket dead */ }
        }
      } else {
        // Non-streaming response
        let collected = "";
        let finishReason: "stop" | "tool_calls" | "length" | "content_filter" = "stop";
        let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | null = null;
        type CollectedToolCall = { id: string; name: string; args: string };
        const collectedToolCalls: CollectedToolCall[] = [];
        let currentToolCall: CollectedToolCall | null = null;

        const abort = new AbortController();
        for await (const ev of streamChatEvents({
          apiKey: creds.apiKey,
          apiServerUrl: creds.apiServerUrl,
          modelUid: resolved.modelUid,
          messages: multimodalMessages,
          tools: tools.length > 0 ? tools : undefined,
          completionOpts: { maxOutputTokens: requestedMaxTokens },
          signal: abort.signal,
        })) {
          if (ev.kind === "text") collected += ev.text;
          else if (ev.kind === "tool_call_start") { currentToolCall = { id: ev.id, name: ev.name, args: "" }; collectedToolCalls.push(currentToolCall); }
          else if (ev.kind === "tool_call_args") { if (currentToolCall) currentToolCall.args += ev.argsDelta; }
          else if (ev.kind === "finish") finishReason = ev.reason;
          else if (ev.kind === "usage") usage = { promptTokens: ev.promptTokens, completionTokens: ev.completionTokens, totalTokens: ev.totalTokens };
        }
        if (collectedToolCalls.length > 0 && finishReason === "stop") finishReason = "tool_calls";

        const assistantMessage = collectedToolCalls.length > 0
          ? { role: "assistant" as const, content: collected, tool_calls: collectedToolCalls.map(tc => ({ id: tc.id, type: "function" as const, function: { name: tc.name, arguments: tc.args } })) }
          : { role: "assistant" as const, content: collected };

        const resp = {
          id: `chatcmpl-${crypto.randomUUID()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: requestedModel,
          choices: [{ index: 0, message: assistantMessage, finish_reason: finishReason }],
          ...(usage ? { usage: { prompt_tokens: usage.promptTokens ?? 0, completion_tokens: usage.completionTokens ?? 0, total_tokens: usage.totalTokens ?? 0 } } : {}),
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(resp));
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: `Unsupported path: ${url.pathname}` } }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message } }));
    } catch {}
  }
}

// ----------------------------------------------------------------------------
// Server startup
// ----------------------------------------------------------------------------

let serverInstance: ReturnType<typeof createServer> | null = null;

export function startProxy(port: number = WINDSURF_PROXY_PORT): Promise<number> {
  if (serverInstance) return Promise.resolve((serverInstance.address() as { port: number }).port);

  return new Promise((resolve, reject) => {
    const srv = createServer(handleRequest);
    srv.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        // Try fallback port
        srv.listen(0, WINDSURF_PROXY_HOST, () => {
          const addr = srv.address() as { port: number };
          serverInstance = srv;
          resolve(addr.port);
        });
        return;
      }
      reject(err);
    });
    srv.listen(port, WINDSURF_PROXY_HOST, () => {
      serverInstance = srv;
      const addr = srv.address() as { port: number };
      resolve(addr.port);
    });
  });
}

export function stopProxy(): void {
  if (serverInstance) {
    try { serverInstance.close(); } catch {}
    serverInstance = null;
  }
}

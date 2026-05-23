/**
 * Windsurf Provider for Pi
 *
 * Enables Windsurf/Cognition models via cloud-direct API.
 * Fetches live model catalog on startup — only models your plan enables are shown.
 *
 * Usage: /login windsurf → /model windsurf/<id>
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { OAuthCredentials, OAuthLoginCallbacks } from "@earendil-works/pi-ai";
import { startProxy, stopProxy, PROXY_SECRET, setProxyCredentials } from "./proxy";
import { loadCredentials, saveCredentials, deleteCredentials, DEFAULT_REGION, runLoginLoopback, registerUser, type PersistedCredentials } from "./oauth";
import { clearCachedUserJwt } from "./auth";
import { clearSessionIds } from "./chat";
import { getCachedCatalog, clearCachedCatalog } from "./catalog";
import { lookupModelId } from "./models";

let _pi: ExtensionAPI | null = null;
let _baseUrl = "";

// Static fallback — used when catalog unavailable (e.g., before login)
const STATIC_MODELS = [
  { id: "claude-opus-4.7:medium", name: "Claude Opus 4.7 Medium", reasoning: true, input: ["text", "image"] as ("text"|"image")[], cost: { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 }, contextWindow: 1000000, maxTokens: 128000 },
  { id: "claude-opus-4.7:high", name: "Claude Opus 4.7 High", reasoning: true, input: ["text", "image"] as ("text"|"image")[], cost: { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 }, contextWindow: 1000000, maxTokens: 128000 },
  { id: "gpt-5.5:medium", name: "GPT-5.5 Medium", reasoning: true, input: ["text", "image"] as ("text"|"image")[], cost: { input: 2.5, output: 10, cacheRead: 0, cacheWrite: 0 }, contextWindow: 1050000, maxTokens: 128000 },
  { id: "gemini-3.5-flash:medium", name: "Gemini 3.5 Flash Medium", reasoning: true, input: ["text", "image"] as ("text"|"image")[], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 1048576, maxTokens: 65536 },
  { id: "kimi-k2.6", name: "Kimi K2.6", reasoning: true, input: ["text", "image"] as ("text"|"image")[], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 262144, maxTokens: 262144 },
  { id: "swe-1.6:base", name: "SWE-1.6", reasoning: true, input: ["text", "image"] as ("text"|"image")[], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 1000000, maxTokens: 128000 },
  { id: "deepseek-v4", name: "DeepSeek V4", reasoning: true, input: ["text"] as ("text"|"image")[], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 1000000, maxTokens: 384000 },
];

function modelConfig(m: typeof STATIC_MODELS[number]) {
  return { id: m.id, name: m.name, reasoning: m.reasoning, input: m.input, cost: m.cost, contextWindow: m.contextWindow, maxTokens: m.maxTokens };
}

// Fetch live catalog and re-register provider with enabled models
async function refreshModels(): Promise<number> {
  const creds = loadCredentials();
  if (!creds || !_pi) return 0;

  try {
    const catalog = await getCachedCatalog(creds.apiKey, creds.apiServerUrl);
    if (!catalog) return 0;

    const enabled = Array.from(catalog.byUid.values()).filter(e => !e.disabled);
    const models = enabled.map(entry => {
      const niceId = lookupModelId(entry.modelUid);
      const isVision = !entry.modelUid.includes("deepseek") && !entry.modelUid.includes("r1");
      const isReasoning = !entry.modelUid.includes("gpt-oss") && !entry.modelUid.includes("llama") && !entry.modelUid.includes("mistral");
      return {
        id: entry.modelUid,
        name: niceId ?? entry.label ?? entry.modelUid,
        reasoning: isReasoning,
        input: (isVision ? ["text", "image"] : ["text"]) as ("text"|"image")[],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 1048576,
        maxTokens: 128000,
      };
    });

    _pi.registerProvider("windsurf", {
      baseUrl: _baseUrl,
      apiKey: PROXY_SECRET,
      api: "openai-completions",
      authHeader: true,
      models,
    });
    return enabled.length;
  } catch {
    return 0;
  }
}

// OAuth
async function loginWindsurf(callbacks: OAuthLoginCallbacks): Promise<OAuthCredentials> {
  let token: string;
  try {
    token = await runLoginLoopback(DEFAULT_REGION, (url) => callbacks.onAuth({ url }));
  } catch {
    const pasted = await callbacks.onPrompt({
      message: `Open this URL, sign in, paste callback URL or token:\n\n  ${DEFAULT_REGION.website}/windsurf/signin\n\nPaste:`,
    });
    const trimmed = pasted.trim();
    try {
      const u = new URL(trimmed);
      token = u.searchParams.get("firebase_id_token") ?? u.searchParams.get("access_token") ?? u.searchParams.get("token") ?? trimmed;
    } catch { token = trimmed; }
  }
  if (!token) throw new Error("No token received.");

  const result = await registerUser(token, DEFAULT_REGION);
  saveCredentials({ ...result, issuedAt: new Date().toISOString(), oauthClientId: DEFAULT_REGION.oauthClientId });
  setProxyCredentials({ apiKey: result.apiKey, apiServerUrl: result.apiServerUrl });
  clearCachedUserJwt();
  clearSessionIds();
  clearCachedCatalog();

  // Refresh models post-login
  refreshModels().catch(() => {});

  return { refresh: result.apiKey, access: result.apiKey, expires: Date.now() + 365 * 24 * 60 * 60 * 1000 };
}

async function refreshWindsurfToken(c: OAuthCredentials): Promise<OAuthCredentials> { return c; }

// Extension entry
export default async function (pi: ExtensionAPI) {
  _pi = pi;

  const proxyPort = await startProxy();
  const baseUrl = `http://127.0.0.1:${proxyPort}/v1`;
  _baseUrl = baseUrl;
  // Restore credentials
  let hasCreds = false;
  try {
    const stored = loadCredentials();
    if (stored) { setProxyCredentials({ apiKey: stored.apiKey, apiServerUrl: stored.apiServerUrl }); hasCreds = true; }
  } catch {}

  // Register provider + restore credentials
  pi.registerProvider("windsurf", {
    name: "Cognition (Windsurf)",
    baseUrl, apiKey: PROXY_SECRET, api: "openai-completions", authHeader: true,
    models: STATIC_MODELS.map(modelConfig),
    oauth: {
      name: "Windsurf (Cognition)",
      login: loginWindsurf,
      refreshToken: refreshWindsurfToken,
      getApiKey: (creds: OAuthCredentials) => creds.access,
    },
  });

  // Startup message
  if (hasCreds) {
    console.error(`[windsurf] connected`);
  } else {
    console.error(`[windsurf] /login windsurf to connect`);
  }

  // Replace static list with live catalog (non-blocking, runs after startup)
  if (hasCreds) {
    refreshModels().catch(() => {});
  }

  // Commands
  pi.registerCommand("windsurf-status", {
    description: "Show Windsurf auth status",
    handler: async (_args, ctx) => {
      const c = loadCredentials();
      ctx.ui.notify(c ? `Windsurf: authenticated (${c.apiServerUrl})` : "Windsurf: not signed in. /login windsurf", c ? "info" : "warning");
    },
  });

  pi.registerCommand("windsurf-logout", {
    description: "Sign out of Windsurf",
    handler: async (_args, ctx) => {
      const ok = deleteCredentials();
      setProxyCredentials(null);
      clearCachedUserJwt(); clearSessionIds(); clearCachedCatalog();
      // Revert to static models
      pi.registerProvider("windsurf", { models: STATIC_MODELS.map(modelConfig) });
      ctx.ui.notify(ok ? "Windsurf: signed out." : "Already signed out.", "info");
    },
  });

  pi.registerCommand("windsurf-refresh", {
    description: "Refresh models from Cognition catalog",
    handler: async (_args, ctx) => {
      const count = await refreshModels();
      ctx.ui.notify(count > 0 ? `${count} models available` : "Refresh failed. Run /login windsurf.", count > 0 ? "info" : "warning");
    },
  });

  pi.on("session_shutdown", async () => { _pi = null; stopProxy(); });
}

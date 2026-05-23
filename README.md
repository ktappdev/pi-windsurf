# pi-windsurf

Use Windsurf/Cognition models in [Pi](https://github.com/earendil-works/pi) — Claude, GPT, Gemini, Kimi, DeepSeek, SWE, and more. All via your existing Windsurf subscription. No separate API keys.

## How it works

Runs a local proxy at `127.0.0.1:42100` that speaks standard OpenAI Chat Completions API. Translates requests to Windsurf's proprietary Connect-RPC wire format. Pi talks to the proxy via `api: "openai-completions"` — no custom streaming code needed.

**No Windsurf IDE needed.** Cloud-direct mode talks straight to Cognition's servers over HTTPS. No Windsurf installation, no background processes.

```
Pi → proxy (localhost:42100) → Cognition Cloud
```

## Install

**Option A — Git install (recommended):**

```bash
pi install git:github.com/ktappdev/pi-windsurf
```

**Option B — Manual:**

```bash
git clone https://github.com/ktappdev/pi-windsurf.git ~/.pi/agent/extensions/windsurf
```

**Option C — Local dev:**

```bash
git clone https://github.com/ktappdev/pi-windsurf.git ~/developer/pi-windsurf
pi -e ~/developer/pi-windsurf/index.ts
```

## Setup

### 1. Sign in

```
/login windsurf
```

Browser opens to windsurf.com. Sign in with your Windsurf account. Token captured automatically.

### 2. Pick a model

```
/model windsurf/<model-id>
```

Models shown are whatever your Windsurf plan enables. The extension fetches the live catalog from Cognition at startup — new models appear automatically.

### 3. Chat

Use Pi as normal. Your Windsurf subscription covers API costs.

## Commands

| Command | Does |
|---------|------|
| `/login windsurf` | Sign in (browser-based OAuth) |
| `/windsurf-status` | Show auth state |
| `/windsurf-logout` | Sign out |
| `/windsurf-refresh` | Refresh model list from Cognition |

## How models update

On startup (and after `/login`), the extension calls Cognition's `GetCascadeModelConfigs` endpoint — same one the Windsurf IDE uses. Only models enabled for your plan appear. When Windsurf adds new models, restart Pi or run `/windsurf-refresh`.

## What models?

Depends on your Windsurf plan. Typically includes:

- **Claude** — Opus 4.7/4.6, Sonnet 4.6/4.5, Haiku 4.5
- **GPT** — 5.5, 5.4, 5.3-Codex, 5.2-Codex
- **Gemini** — 3.5 Flash, 3.1 Pro
- **Kimi** — K2.6
- **DeepSeek** — V4
- **SWE** — 1.6, 1.5
- And more — BYOK models, enterprise deployments, experimental releases

## Files

```
index.ts       Pi extension entry (provider + OAuth)
proxy.ts       HTTP server (OpenAI → gRPC)
chat.ts        Connect-RPC streaming (proto encode/decode)
catalog.ts     Live model catalog (GetCascadeModelConfigs)
models.ts      Variant catalog + model resolution
auth.ts        JWT minting
metadata.ts    Proto metadata builder
wire.ts        Proto wire format helpers
oauth.ts       Login loopback + RegisterUser
```

## Requirements

- Pi (any recent version)
- Node.js ≥ 18 or Bun
- Windsurf account (free or paid)

No npm dependencies. Uses only Node built-ins and Pi's own types.

## Credits

Built on reverse-engineering work from [opencode-windsurf-auth](https://github.com/rsvedant/opencode-windsurf-auth) by @rsvedant. The proxy architecture, proto wire format, and OAuth flow are adapted from that project.

## License

MIT

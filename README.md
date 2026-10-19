# pi-windsurf

Use Windsurf/Cognition models in [Pi](https://github.com/earendil-works/pi) — Claude, GPT, Gemini, Kimi, DeepSeek, SWE, and more. All via your existing Windsurf subscription. No separate API keys.

## How it works

Runs a local proxy at `127.0.0.1:42100` that speaks standard OpenAI Chat Completions API. Translates requests to Windsurf's proprietary Connect-RPC wire format. Pi talks to the proxy via `api: "openai-completions"` — no custom streaming code needed.

**No Windsurf IDE needed.** Cloud-direct mode talks straight to Cognition's servers over HTTPS. No Windsurf installation, no background processes. The local proxy adds negligible overhead — ~15MB memory, sub-millisecond latency.

```
Pi → proxy (localhost:42100) → Cognition Cloud
```

## Install

**Option A — npm (recommended):**

```bash
pi install npm:pi-windsurf
```

**Option B — Git:**

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

Choose how to sign in:

- **Open browser here** — sign in with your Windsurf account; the token is captured automatically.
- **Sign in on another computer (headless / SSH)** — open the link on your own
  computer, then paste the callback URL into Pi on the server.

Pi asks each time you run `/login windsurf`; no environment variable is needed.

#### Headless server / SSH

Start Pi normally, run `/login windsurf`, and choose **Sign in on another computer
(headless / SSH)**. Open the displayed link in a browser on your own
computer and sign in. The browser redirects to `127.0.0.1:42101/auth` and may show
a connection error; this is expected. Copy the **full final URL** from the address
bar, including everything after `#` or `?`, and paste it into Pi's prompt on the
server. A raw sign-in token is also accepted.

Headless mode does not open a browser or start a callback listener. No monitor,
SSH port forwarding, or exposed server port is needed. Treat the callback URL
like a password and paste it only into your own login prompt. Callback URLs must
come from the current sign-in attempt.

Once signed in, credentials are saved for subsequent sessions. Pi keeps its own
provider login state alongside the extension's credentials in
`~/.pi/agent/windsurf/credentials.json`; copying only that extension
file does not complete Pi's `/login` process. Run `/login windsurf` on the server
to complete both.

Existing credentials at `~/.config/opencode-windsurf-auth/credentials.json` are
automatically migrated when the new file is missing. The original stays in place
until `/windsurf-logout`, which removes credentials from both locations. The new
folder is private (`0700`) and credential files are written privately (`0600`).

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

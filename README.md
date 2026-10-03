# Decision service

A private decision service skeleton. It answers "what should be decided for this input?" through two entry points that share one core:

- a small local HTTP process (`src/http-server.js`)
- an MCP server over stdio (`src/mcp-server.js`)

This is a skeleton. No business rules exist yet, so every request is answered `undecided`.

## How it runs

- **Its own process.** This service runs standalone. It is not embedded in, imported by, or deployed inside another application. Other systems talk to it over HTTP on loopback or through MCP.
- **The key lives only in the environment.** `DECISION_API_BASE_URL` and `DECISION_API_KEY` are read from environment variables. They are never written to config files, committed, logged, or returned in responses. `.env.example` holds placeholders only.
- **No inbound public webhooks.** Receiving public webhooks is out of scope. The HTTP process binds to `127.0.0.1` by default and exposes only `GET /health` and `POST /decide`.
- **Boots with nothing.** With no env vars set, the service starts and answers without calling any external API.

## Quick start

```bash
npm install
npm start                # HTTP on 127.0.0.1:8787
curl localhost:8787/health
curl -X POST localhost:8787/decide -d '{"example": true}'
npm test
```

## Configuration

Copy `config/decision.example.json` to `config/decision.json` (git-ignored) and point `DECISION_CONFIG_PATH` at it. The example is intentionally empty:

```json
{ "routes": [], "thresholds": {}, "rules": [] }
```

Add your own routes, thresholds, and rules in your private copy. The repository ships none.

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `DECISION_API_BASE_URL` | Base URL of the decision provider (placeholder in the example). |
| `DECISION_API_KEY` | Provider key. Set it only in the environment. |
| `HOST`, `PORT` | HTTP bind address. Defaults `127.0.0.1` and `8787`. |
| `DECISION_CONFIG_PATH` | Path to your private config. Optional. |

## MCP

The MCP server speaks stdio and exposes two tools: `decide` and `status`.

Register it in any MCP client by pointing at the entry point:

```json
{
  "mcpServers": {
    "decision-service": {
      "command": "node",
      "args": ["/absolute/path/to/this/repo/src/mcp-server.js"],
      "env": { "DECISION_CONFIG_PATH": "/absolute/path/to/decision.json" }
    }
  }
}
```

Or run `npm install -g .` from this directory to put `decision-mcp` and `decision-service` on your PATH.

## Layout

```
src/decide.js        core decision entry point (no rules yet)
src/config.js        loads the config; missing file means empty config
src/provider.js      reads the two provider env vars; exposes only a configured flag
src/http-server.js   local HTTP process
src/mcp-server.js    MCP stdio server
config/              empty example config
```

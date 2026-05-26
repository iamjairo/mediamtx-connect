# Phase 2 — MediaMTX MCP Server Plan

Goal: ship a Model Context Protocol server that lets LLM agents (Claude
Desktop, Claude Code, Cursor, any MCP client) read and operate a MediaMTX
instance through natural language. Companion to Phase 1
(`docs/PHASE-1-DASHBOARD-REMASTER.md`).

This is **a plan, not a spec**. Concrete code lands in subsequent PRs.

Prerequisite: a public MediaMTX MCP server does not exist as of May 2026,
so this is greenfield.

## Why now

- Same 38-endpoint surface as Phase 1, same auth model, same generated
  client. Phase 2 is mostly adapter code on top of Phase 1's
  `lib/MediaMTX/client.ts`.
- The new MCP spec (2026-07-28 RC) is stateless at the protocol layer,
  which makes deploying a remote server behind a load balancer trivial —
  no sticky sessions or session store needed.
- A working MCP server makes Claude Code natively useful as an "ops
  console" for MediaMTX without a browser.

## Repo layout

Two reasonable options. **Recommended: npm workspace inside this repo** so
the MCP server can `import` the generated client directly and ship in
lockstep with the dashboard.

```
mediamtx-connect/                     # existing repo root
├── package.json                      # mark as workspace root
├── apps/
│   └── dashboard/                    # MOVE existing app here
└── packages/
    ├── mediamtx-client/              # extract from src/lib/MediaMTX/
    │   ├── generated.ts
    │   ├── swagger.json
    │   ├── client.ts                 # factory from Phase 1
    │   └── package.json
    └── mediamtx-mcp/                 # NEW — this phase
        ├── src/
        │   ├── index.ts              # stdio entry point
        │   ├── server.ts             # MCP server setup
        │   ├── tools/                # one file per endpoint group
        │   │   ├── paths.ts
        │   │   ├── pathConfig.ts
        │   │   ├── sessions.ts
        │   │   ├── hlsMuxers.ts
        │   │   └── config.ts
        │   ├── resources/            # browsable read-only surfaces
        │   ├── prompts/              # reusable prompt templates
        │   ├── http.ts               # HTTP transport (Phase 2.5)
        │   └── auth.ts               # env-based credentials
        ├── README.md
        ├── package.json              # @iamjairo/mediamtx-mcp
        └── tsconfig.json
```

Alternative: a separate repo. Cleaner ownership story but doubles the
release toil and forces a published npm package just to share types.
Recommend workspace until the MCP server has a reason to diverge.

## Tools (one MCP tool per endpoint)

Naming convention: `mediamtx_<group>_<verb>` so tool calls are
self-documenting in transcripts.

### Read tools (no confirmation needed)

| MCP tool | Endpoint |
|---|---|
| `mediamtx_config_global_get` | `configGlobalGet` |
| `mediamtx_config_pathdefaults_get` | `configPathDefaultsGet` |
| `mediamtx_config_paths_list` | `configPathsList` |
| `mediamtx_config_paths_get` | `configPathsGet` |
| `mediamtx_paths_list` | `pathsList` |
| `mediamtx_paths_get` | `pathsGet` |
| `mediamtx_hlsmuxers_list` | `hlsmuxersList` |
| `mediamtx_hlsmuxers_get` | `hlsmuxersGet` |
| `mediamtx_rtsp_conns_list` | `rtspconnsList` |
| `mediamtx_rtsp_conns_get` | `rtspconnsGet` |
| `mediamtx_rtsp_sessions_list` | `rtspsessionsList` |
| `mediamtx_rtsp_sessions_get` | `rtspsessionsGet` |
| `mediamtx_rtsps_conns_list` | `rtspsconnsList` |
| `mediamtx_rtsps_conns_get` | `rtspsconnsGet` |
| `mediamtx_rtsps_sessions_list` | `rtspssessionsList` |
| `mediamtx_rtsps_sessions_get` | `rtspssessionsGet` |
| `mediamtx_rtmp_conns_list` | `rtmpconnsList` |
| `mediamtx_rtmp_conns_get` | `rtmpconnsGet` |
| `mediamtx_rtmps_conns_list` | `rtmpsconnsList` |
| `mediamtx_rtmps_conns_get` | `rtmpsconnsGet` |
| `mediamtx_srt_conns_list` | `srtconnsList` |
| `mediamtx_srt_conns_get` | `srtconnsGet` |
| `mediamtx_webrtc_sessions_list` | `webrtcsessionsList` |
| `mediamtx_webrtc_sessions_get` | `webrtcsessionsGet` |

### Write tools (destructive — annotate accordingly)

Per MCP spec, set `annotations.destructiveHint: true` and
`annotations.idempotentHint: false` where relevant. Clients (Claude
Desktop, Claude Code) will prompt the user before invocation.

| MCP tool | Endpoint | Destructive |
|---|---|:-:|
| `mediamtx_config_global_set` | `configGlobalSet` | ✓ |
| `mediamtx_config_pathdefaults_patch` | `configPathDefaultsPatch` | ✓ |
| `mediamtx_config_paths_add` | `configPathsAdd` | ✓ |
| `mediamtx_config_paths_patch` | `configPathsPatch` | ✓ |
| `mediamtx_config_paths_replace` | `configPathsReplace` | ✓ |
| `mediamtx_config_paths_delete` | `configPathsDelete` | ✓ |
| `mediamtx_rtsp_sessions_kick` | `rtspsessionsKick` | ✓ |
| `mediamtx_rtsps_sessions_kick` | `rtspssessionsKick` | ✓ |
| `mediamtx_rtmp_conns_kick` | `rtmpconnsKick` | ✓ |
| `mediamtx_rtmps_conns_kick` | `rtmpsconnsKick` | ✓ |
| `mediamtx_srt_conns_kick` | `srtconnsKick` | ✓ |
| `mediamtx_webrtc_sessions_kick` | `webrtcsessionsKick` | ✓ |

Input schemas come straight from the swagger definitions
(`PathConf`, `GlobalConf`, etc.) via a small `swaggerToJsonSchema()`
helper, so the MCP tool contract stays in sync with MediaMTX upgrades.

### Resources (browsable read-only state)

Resources let clients pull state without invoking a tool — useful for
Claude Desktop's "attach" UI.

| URI | Backing endpoint |
|---|---|
| `mediamtx://config/global` | `configGlobalGet` |
| `mediamtx://config/pathdefaults` | `configPathDefaultsGet` |
| `mediamtx://config/paths` | `configPathsList` |
| `mediamtx://paths` | `pathsList` |
| `mediamtx://paths/{name}` | `pathsGet` |
| `mediamtx://sessions/{protocol}` | `{protocol}sessionsList` / `{protocol}connsList` |
| `mediamtx://hlsmuxers` | `hlsmuxersList` |

### Prompts (reusable templates)

| Prompt | Purpose |
|---|---|
| `audit-paths` | Walk all paths, flag any not currently ready or with stale `lastRequest`. |
| `kick-stale-sessions` | List sessions older than N hours and offer to kick. |
| `summarize-stream-health` | Aggregate live paths + sessions + muxers into a one-paragraph status. |
| `compare-config` | Diff current global config against a baseline `mediamtx.yml`. |
| `new-path-from-rtsp` | Walk user through creating a path that proxies an external RTSP source. |

## Auth & config

Env vars (per MCP server convention):

```
MEDIAMTX_URL              # required, e.g. http://localhost:9997
MEDIAMTX_API_USERNAME     # optional
MEDIAMTX_API_PASSWORD     # optional
MEDIAMTX_TLS_VERIFY       # default true
```

Read once at server start; refuse to start if `MEDIAMTX_URL` is missing.
For Claude Desktop, ships with an example `claude_desktop_config.json`
snippet in the README.

## Transports

- **stdio** (Phase 2.1): default. Works with Claude Desktop, Claude Code,
  Cursor. No network exposure.
- **Streamable HTTP** (Phase 2.2): for remote / shared deployments. The
  2026-07-28 spec makes this stateless, so a single Docker container
  behind any load balancer is enough — no Redis, no sticky sessions.
- **WebSocket**: skip. The new spec deprecates it.

## Distribution

- Publish as `@iamjairo/mediamtx-mcp` on npm so users can
  `npx @iamjairo/mediamtx-mcp` from `claude_desktop_config.json` without
  a global install.
- Docker image `ghcr.io/iamjairo/mediamtx-mcp` for the HTTP transport.
- README includes ready-to-paste configs for Claude Desktop, Claude Code
  (`~/.claude/settings.json`), Cursor, and Continue.

## Milestones (suggested PR sequence)

| # | PR | Deliverable |
|---:|---|---|
| 0 | Workspace refactor — move dashboard to `apps/dashboard`, extract `packages/mediamtx-client` | repo restructured, no behaviour change |
| 1 | `packages/mediamtx-mcp` skeleton — SDK setup, stdio transport, `mediamtx_paths_list` only, README | proof-of-life MCP server |
| 2 | All read tools (24) + auth env wiring | usable for read-only ops |
| 3 | All write tools (12) with destructiveHint, input schemas from swagger | full API parity |
| 4 | Resources (browsable state) | Claude Desktop attach UI works |
| 5 | Prompts (5 templates) | one-click common workflows |
| 6 | HTTP transport + Docker image | remote deployments |
| 7 | npm publish + Claude Desktop / Claude Code config recipes in README | public release |

## Open questions for the maintainer

1. **Workspace vs separate repo.** Recommendation: workspace. Confirm
   before PR #0 since it touches every path in the repo.
2. **Package scope / publisher.** `@iamjairo/mediamtx-mcp`, or sit under
   a neutral name (`mediamtx-mcp`) to make community adoption easier? An
   unscoped name needs npm to not be squatted.
3. **Kick safety on Read tools.** The MCP spec's `destructiveHint` is
   advisory — clients can still auto-approve. Want a hard env-flag
   (`MEDIAMTX_MCP_ALLOW_KICK=true`) to opt into kick/delete tools at
   server start, so a misbehaving client can't drop sessions on a
   prod box?
4. **Resource update notifications.** The spec supports `notifications/
   resources/updated` for push. MediaMTX has no event stream, so this
   would have to be a poll. Worth doing for `mediamtx://sessions/*` (so
   Claude Desktop refreshes mid-conversation), or skip and let the
   client re-fetch?
5. **Telemetry.** Opt-in anonymous tool-usage counts (which tools get
   called, error rates) to inform future API priorities? Default off,
   `MEDIAMTX_MCP_TELEMETRY=true` to enable.

## Definition of done

- All 38 v3 endpoints exposed as MCP tools or resources.
- Server runs as `npx @iamjairo/mediamtx-mcp` over stdio.
- Server runs as a Docker container over Streamable HTTP.
- Documented Claude Desktop and Claude Code recipes that work
  end-to-end against a fresh MediaMTX install.
- Tool input schemas regenerate from `swagger.json` cleanly.
- Smoke test in CI: spin up MediaMTX in a service container, invoke
  every read tool, assert non-error response.

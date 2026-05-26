# @iamjairo/mediamtx-mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for
[MediaMTX](https://github.com/bluenviron/mediamtx). Exposes every endpoint of
the MediaMTX v3 control API as MCP tools, resources, and prompts so LLM
agents (Claude Desktop, Claude Code, Cursor, Continue, …) can operate a
MediaMTX instance in natural language.

## What it ships

- **24 read tools** — full coverage of every `*List` and `*Get` endpoint
  for paths, sessions, connections, HLS muxers, global config and path
  defaults.
- **12 write tools** — every `*Add`/`*Patch`/`*Replace`/`*Delete`/`*Kick`
  endpoint, all annotated `destructiveHint: true` and gated behind
  `MEDIAMTX_MCP_ALLOW_KICK=true` so they cannot fire by accident.
- **11 resources** under the `mediamtx://` scheme for browsable state in
  attach-style UIs.
- **5 prompts** for common operational workflows.

## Install

```sh
npx @iamjairo/mediamtx-mcp
```

(or `npm install -g @iamjairo/mediamtx-mcp` for a permanent binary.)

## Configure

The server reads connection details from environment variables:

| Variable | Required | Default | Description |
|---|:-:|---|---|
| `MEDIAMTX_URL` | ✓ | — | Base URL of the MediaMTX API. Example: `http://localhost:9997` |
| `MEDIAMTX_API_USERNAME` | | — | Basic-auth username, if the API is protected. |
| `MEDIAMTX_API_PASSWORD` | | — | Basic-auth password. |
| `MEDIAMTX_MCP_ALLOW_KICK` | | `false` | Set to `true` to enable destructive tools (`*_kick`, `*_add`, `*_patch`, `*_replace`, `*_delete`, `*_global_set`). |
| `MEDIAMTX_TLS_VERIFY` | | `true` | Set to `false` to skip TLS verification (self-signed certs). |

## Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mediamtx": {
      "command": "npx",
      "args": ["@iamjairo/mediamtx-mcp"],
      "env": {
        "MEDIAMTX_URL": "http://localhost:9997",
        "MEDIAMTX_MCP_ALLOW_KICK": "true"
      }
    }
  }
}
```

## Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "mediamtx": {
      "command": "npx",
      "args": ["@iamjairo/mediamtx-mcp"],
      "env": {
        "MEDIAMTX_URL": "http://localhost:9997"
      }
    }
  }
}
```

## Tools

### Read tools (always enabled)

- `mediamtx_config_global_get`
- `mediamtx_config_pathdefaults_get`
- `mediamtx_config_paths_list`
- `mediamtx_config_paths_get`
- `mediamtx_paths_list`
- `mediamtx_paths_get`
- `mediamtx_hls_muxers_list`
- `mediamtx_hls_muxers_get`
- `mediamtx_rtsp_conns_list`, `mediamtx_rtsp_conns_get`
- `mediamtx_rtsp_sessions_list`, `mediamtx_rtsp_sessions_get`
- `mediamtx_rtsps_conns_list`, `mediamtx_rtsps_conns_get`
- `mediamtx_rtsps_sessions_list`, `mediamtx_rtsps_sessions_get`
- `mediamtx_rtmp_conns_list`, `mediamtx_rtmp_conns_get`
- `mediamtx_rtmps_conns_list`, `mediamtx_rtmps_conns_get`
- `mediamtx_srt_conns_list`, `mediamtx_srt_conns_get`
- `mediamtx_webrtc_sessions_list`, `mediamtx_webrtc_sessions_get`

### Write tools (require `MEDIAMTX_MCP_ALLOW_KICK=true`)

- `mediamtx_config_global_set`
- `mediamtx_config_pathdefaults_patch`
- `mediamtx_config_paths_add`
- `mediamtx_config_paths_patch`
- `mediamtx_config_paths_replace`
- `mediamtx_config_paths_delete`
- `mediamtx_rtsp_sessions_kick`
- `mediamtx_rtsps_sessions_kick`
- `mediamtx_rtmp_conns_kick`
- `mediamtx_rtmps_conns_kick`
- `mediamtx_srt_conns_kick`
- `mediamtx_webrtc_sessions_kick`

## Resources

- `mediamtx://config/global`
- `mediamtx://config/pathdefaults`
- `mediamtx://config/paths`
- `mediamtx://paths`
- `mediamtx://hls/muxers`
- `mediamtx://sessions/rtsp`
- `mediamtx://sessions/rtsps`
- `mediamtx://sessions/rtmp`
- `mediamtx://sessions/rtmps`
- `mediamtx://sessions/srt`
- `mediamtx://sessions/webrtc`

## Prompts

- `audit-paths` — walks configured + runtime paths, flags anomalies.
- `kick-stale-sessions` — proposes sessions older than N hours to kick.
- `summarize-stream-health` — one-paragraph status across all protocols.
- `new-path-from-rtsp` — guides creating a path proxying an RTSP source.
- `compare-config` — diffs current config against a baseline.

## Development

```sh
npm install
npm run dev          # tsx watch
npm run build        # compile to dist/
npm run typecheck
```

## Docker

```sh
docker run --rm -i \
  -e MEDIAMTX_URL=http://host.docker.internal:9997 \
  ghcr.io/iamjairo/mediamtx-mcp:latest
```

## License

MIT

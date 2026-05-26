# Combined deployment

Single `docker compose` deployment that wires together the three independent
artifacts in this repo:

| Service      | Source                          | Exposed on              |
|--------------|---------------------------------|--------------------------|
| `mediamtx`   | `bluenviron/mediamtx` (upstream) | RTSP/RTMP/HLS/WebRTC/SRT/API ports (see compose file) |
| `dashboard`  | `packages/dashboard-vite/`      | http://localhost:8080    |
| `mcp-server` | `mcp-server/`                   | stdio (on-demand via `docker run`) |

## Run

```sh
cd deploy
docker compose up -d
```

Open the dashboard at <http://localhost:8080>. It will look for MediaMTX at
`http://localhost:9997` (the address your browser can reach the API on).

## Configure the dashboard's MediaMTX URL

Edit `deploy/docker-compose.yml` and set `dashboard.environment.MEDIAMTX_URL`.
The dashboard image reads this at container start, writes
`/runtime-config.js` in the served bundle, and the SPA picks it up at boot —
no rebuild needed.

```yaml
dashboard:
  environment:
    MEDIAMTX_URL: https://media.example.com:9997
    MEDIAMTX_API_USERNAME: admin
    MEDIAMTX_API_PASSWORD: ${MMTX_PASSWORD}
    ALLOW_DESTRUCTIVE: 'true'
    POLL_INTERVAL_MS: '5000'
```

## CORS

MediaMTX's v3 API does not emit `Access-Control-Allow-Origin` by default.
For the dashboard's browser-side calls to succeed when MediaMTX is on a
different origin, either:

- Put a reverse proxy in front of MediaMTX that adds the CORS header, or
- Run the dashboard at the same origin as MediaMTX (e.g. proxy `/api/v3/...`
  to MediaMTX via the same nginx).

The provided `mediamtx.yml` doesn't configure CORS — add per your needs.

## MCP server

The MCP server is stdio-only by default. To use it from Claude Desktop or
Claude Code, run on demand:

```sh
docker run --rm -i \
  -e MEDIAMTX_URL=http://host.docker.internal:9997 \
  ghcr.io/iamjairo/mediamtx-mcp:latest
```

Once the MCP server gains an HTTP / Streamable HTTP transport, switch the
`mcp-server` service in the compose file from `profiles: [mcp]` to always-on,
expose its port, and point your remote MCP client at it.

## Standalone artifacts

Each of these can also be deployed independently:

- **Dashboard only** — `docker run -p 8080:80 -e MEDIAMTX_URL=… ghcr.io/iamjairo/mediamtx-dashboard:latest`
- **MCP server only** — see `mcp-server/README.md`
- **Embedded into a host React+Vite app** — see `packages/dashboard-vite/README.md`
- **Native desktop app** — see `apps/desktop/README.md`

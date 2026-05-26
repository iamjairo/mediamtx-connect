# MANUAL.md

How to operate MediaMTX Connect across its deployment forms. Companion
to `BUILD.md` (what's built) and `HANDOFF.md` (status).

---

## 1. Composed deployment (recommended for daily use)

Three independent containers wired together by `deploy/docker-compose.yml`.

### First-time setup

```sh
cd deploy
docker compose up -d
```

This pulls:

- `bluenviron/mediamtx:1.11.3` (upstream, no fork)
- `ghcr.io/iamjairo/mediamtx-dashboard:latest` (or builds locally)
- `ghcr.io/iamjairo/mediamtx-mcp:latest` (built only — runs on demand)

Recordings are persisted to a named docker volume (`mediamtx-recordings`).

### Daily operations

| Task | Command |
|---|---|
| Open the dashboard | <http://localhost:8080> |
| Watch live streams | Sidebar → Streams |
| Add a new path | Sidebar → Paths → "New path" |
| Kick a stuck session | Sidebar → Sessions → protocol tab → row "Kick" |
| Edit global config | Sidebar → Settings → "Global config" JSON editor |
| Stop everything | `cd deploy && docker compose down` |
| Tail container logs | `docker compose -f deploy/docker-compose.yml logs -f` |
| Restart MediaMTX only | `docker compose -f deploy/docker-compose.yml restart mediamtx` |

### Configuring the dashboard's MediaMTX URL

The dashboard image reads env vars at container start and writes them
into a runtime JS file the SPA reads at boot — **no image rebuild
required**. Edit `deploy/docker-compose.yml`:

```yaml
dashboard:
  environment:
    MEDIAMTX_URL: http://localhost:9997      # what the browser hits
    MEDIAMTX_API_USERNAME: admin             # optional
    MEDIAMTX_API_PASSWORD: ${MMTX_PASSWORD}  # use a .env file
    ALLOW_DESTRUCTIVE: 'true'                # show kick / delete buttons
    POLL_INTERVAL_MS: '5000'                 # live-data refresh
```

Then `docker compose up -d dashboard` to restart only the dashboard.

### CORS

If the dashboard is on a different origin than MediaMTX, the browser
will block API calls. Options:

1. **Same origin** — put nginx in front of both, proxy `/api/` to
   MediaMTX. Simplest.
2. **CORS header** — front MediaMTX with a reverse proxy that adds
   `Access-Control-Allow-Origin: <dashboard-origin>`.

`deploy/mediamtx.yml` does not configure CORS — add per your setup.

---

## 2. Desktop dashboard app

`apps/desktop/` — full window with the dashboard UI, settings persisted
locally.

### Install

Once the Phase 4 release workflow ships, install via the bundle for
your platform from the GitHub Release page. Pre-release, build locally:

```sh
cd apps/desktop
npm install
npm run tauri build
```

Installers land in `src-tauri/target/release/bundle/`.

### First launch

1. Connection wizard appears: enter MediaMTX URL (and optional
   credentials).
2. App smoke-tests the URL by calling `/v3/config/global/get`.
3. On success, the dashboard window opens. Settings are persisted.

### Settings file location

| OS | Path |
|---|---|
| Linux | `~/.config/com.iamjairo.mediamtx-connect/settings.json` |
| macOS | `~/Library/Application Support/com.iamjairo.mediamtx-connect/settings.json` |
| Windows | `%APPDATA%\com.iamjairo.mediamtx-connect\settings.json` |

Delete this file to re-run the wizard.

---

## 3. MCP server

Lets Claude Desktop / Code / Cursor drive a MediaMTX instance via
natural language.

### Run on demand (stdio)

```sh
cd mcp-server
npm install && npm run build
MEDIAMTX_URL=http://localhost:9997 npm start
```

Or via Docker:

```sh
docker run --rm -i \
  -e MEDIAMTX_URL=http://host.docker.internal:9997 \
  ghcr.io/iamjairo/mediamtx-mcp:latest
```

### Wire into Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

### Environment variables

| Var | Required | Default | Meaning |
|---|:-:|---|---|
| `MEDIAMTX_URL` | yes | — | Base URL of the MediaMTX HTTP API |
| `MEDIAMTX_API_USERNAME` | | — | Basic-auth username |
| `MEDIAMTX_API_PASSWORD` | | — | Basic-auth password |
| `MEDIAMTX_MCP_ALLOW_KICK` | | `false` | Enable destructive tools (kick, delete, replace, patch) |
| `MEDIAMTX_TLS_VERIFY` | | `true` | Set `false` for self-signed certs |
| `MEDIAMTX_MCP_TRANSPORT` | | `stdio` | `stdio` (Claude Desktop) or `http` (Phase 4) |
| `MEDIAMTX_MCP_HTTP_PORT` | | `8181` | Only used when transport=http |

### MCP tray app (Phase 4)

Once shipped, the tray app gives you start/stop/configure for the MCP
server without editing JSON. Install the bundle, open the tray icon,
configure once.

---

## 4. MCP usage from Claude

After wiring the MCP server into your Claude client, you can ask
natural-language questions like:

| Question | What it triggers |
|---|---|
| "Show me all active streams" | `mediamtx_paths_list` |
| "Kick the RTSP session from 10.0.0.5" | `mediamtx_rtsp_sessions_list` → `mediamtx_rtsp_sessions_kick` |
| "Create a new path called 'front_door' that proxies rtsp://camera/stream" | `mediamtx_config_paths_add` |
| "Disable recording on all paths" | iterates `mediamtx_config_paths_patch` |
| "What's MediaMTX's log level?" | `mediamtx_config_global_get` |
| "Run the audit-paths prompt" | invokes the `audit-paths` prompt template |

Destructive operations prompt for confirmation in Claude Desktop's UI
because they're annotated `destructiveHint: true`. They additionally
no-op unless `MEDIAMTX_MCP_ALLOW_KICK=true`.

---

## 5. Embedding into the IoT Dashboard host

The `@iamjairo/mediamtx-dashboard` package is designed for this. From
the host:

```sh
npm install file:../mediamtx-connect/packages/dashboard-vite
```

```tsx
import { MediaMtxDashboard } from '@iamjairo/mediamtx-dashboard'
import '@iamjairo/mediamtx-dashboard/style.css'

<Route
  path="/mediamtx/*"
  element={
    <MediaMtxDashboard
      baseUrl="http://localhost:9997"
      pollIntervalMs={5000}
      allowDestructive
      hostName="MediaMTX"
    />
  }
/>
```

Hosts that want to build their own shell can import
`MediaMtxProvider` + the per-endpoint hooks directly:

```tsx
import { MediaMtxProvider, usePaths } from '@iamjairo/mediamtx-dashboard'

function MyCustomWidget() {
  const { data } = usePaths()
  return <div>{data?.items?.length ?? 0} streams</div>
}

<MediaMtxProvider baseUrl="http://localhost:9997">
  <MyCustomWidget />
</MediaMtxProvider>
```

---

## 6. Common troubleshooting

### "Cannot reach MediaMTX" everywhere

Check:

1. Is the MediaMTX container actually up? `docker compose ps`
2. Is the API enabled in `mediamtx.yml`? Look for `api: yes` and
   `apiAddress: :9997`.
3. Is CORS blocking the browser? Open browser dev tools → Network tab,
   look for CORS errors on `/v3/...` calls.
4. Is the dashboard pointing at the right URL? In the container, the
   value is in `/usr/share/nginx/html/runtime-config.js`.

### Dashboard renders but Sessions tabs are empty

Expected — Sessions only populate when a client is actually publishing
or reading. Start a fake stream:

```sh
ffmpeg -re -i sample.mp4 -c copy -f rtsp rtsp://localhost:8554/test
```

Then watch `/sessions/rtsp`.

### "Write tools are disabled" from the MCP server

Set `MEDIAMTX_MCP_ALLOW_KICK=true` in the env vars for the MCP
server. This gates every kick / delete / patch / replace / add tool.

### Tauri build fails on Linux

Install the platform deps: <https://v2.tauri.app/start/prerequisites/>.
On Ubuntu: `libwebkit2gtk-4.1-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev build-essential libssl-dev`.

### Tauri build fails on macOS

`xcode-select --install` once. Apple silicon vs Intel cross-compilation
needs `rustup target add aarch64-apple-darwin x86_64-apple-darwin` and
`--target universal-apple-darwin` at build time.

### Prisma generate fails with "url no longer supported"

The repo had a botched bump to Prisma 7 (the schema still uses
`env("DATABASE_URL")` which v7 doesn't allow). The branches in this
repo pin back to `^6.16.2`. If you see this on a fresh clone of main,
run `npm install` after the foundational-fix commit lands on main.

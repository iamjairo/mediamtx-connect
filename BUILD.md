# BUILD.md

What's been built across the four phases, where it lives, and how to
build each piece. Companion to `MANUAL.md` (operations) and
`HANDOFF.md` (status).

---

## Phase 1 — Next.js dashboard expansion

**Branch:** `claude/phase-1-dashboard-remaster` (PR #7)
**Plan:** `docs/PHASE-1-DASHBOARD-REMASTER.md`

Took the existing Next.js dashboard from **4 of 36** MediaMTX v3
endpoint calls to **36 of 36**.

### New / changed code

```
src/
├── lib/MediaMTX/
│   ├── client.ts                 # NEW — centralised factory with basic auth
│   └── errors.ts                 # NEW — normalised API error
├── lib/prisma/
│   ├── schema.prisma             # MODIFIED — added apiUsername + apiPassword
│   └── migrations/20260526170000_mediamtx_api_auth/  # NEW
├── features/
│   ├── config/
│   │   ├── path-defaults/        # NEW — configPathDefaults{Get,Patch}
│   │   └── client/
│   │       └── actions/testMediaMtxConnection.ts   # NEW — connection test
│   ├── sessions/                 # NEW DOMAIN
│   │   ├── rtsp/, rtsps/, rtmp/, rtmps/, srt/, webrtc/
│   │   └── shared/               # KickButton, formatBytes, formatTimestamp
│   └── streams/
│       ├── path-config/          # NEW — CRUD for /v3/config/paths/*
│       ├── path-detail/          # NEW — /v3/paths/get/{name}
│       └── hls-muxers/           # NEW — /v3/hlsmuxers/{list,get}
├── app/
│   ├── sessions/{rtsp,rtsps,rtmp,rtmps,srt,webrtc}/  # NEW routes
│   ├── streams/{[name],paths,hls-muxers}/            # NEW routes
│   └── config/path-defaults/                          # NEW route
└── shared/components/data/PagedTable.tsx              # NEW — paginated table
```

### Build

```sh
npm install
DATABASE_URL='file:./database.db' npx prisma generate --schema src/lib/prisma/schema.prisma
npm run build           # produces .next/
npm start               # serves on :3000
```

### CI fixes carried in this PR

- Pinned Prisma from a botched `^7.0.0` bump back to `^6.16.2`.
- Lint fixes for pre-existing failures in `.github/dependabot.yml` +
  `src/features/recordings/browse/actions/getStreamRecordings.ts`.
- E2E test updates for the new auth form fields.

---

## Phase 2 — MediaMTX MCP server

**Branch:** `claude/phase-2-mcp-server` (PR #8)
**Plan:** `docs/PHASE-2-MCP-SERVER.md`

Self-contained Model Context Protocol server in `mcp-server/`. Lets
Claude Desktop / Code / Cursor drive a MediaMTX instance via natural
language.

### New code

```
mcp-server/
├── package.json                  # @iamjairo/mediamtx-mcp
├── tsconfig.json
├── Dockerfile
├── README.md
└── src/
    ├── index.ts                  # stdio entry point
    ├── config.ts                 # env: MEDIAMTX_URL, AUTH, ALLOW_KICK, TLS_VERIFY
    ├── mediamtx/
    │   ├── generated.ts          # vendored swagger-typescript-api client
    │   ├── swagger.json
    │   └── client.ts             # factory with basic auth + custom fetch
    ├── tools/
    │   ├── index.ts              # registers everything
    │   ├── config.ts             # 4 tools (global + path defaults)
    │   ├── paths.ts              # 8 tools (runtime + config CRUD)
    │   ├── hls.ts                # 2 tools
    │   ├── sessions.ts           # 22 tools (6 protocols × list/get/kick)
    │   └── util.ts               # jsonResult, errorResult, callOrFail
    ├── resources/index.ts        # 11 mediamtx:// URIs
    └── prompts/index.ts          # 5 reusable prompts
```

### Surface

- **36 tools** (24 read + 12 write). Write tools gated behind
  `MEDIAMTX_MCP_ALLOW_KICK=true`.
- **11 resources** under the `mediamtx://` scheme.
- **5 prompts** (audit-paths, kick-stale-sessions, summarize-stream-health,
  new-path-from-rtsp, compare-config).

### Build

```sh
cd mcp-server
npm install
npm run build      # produces dist/
npm start          # node dist/index.js (stdio)
```

Or via Docker:

```sh
cd mcp-server
docker build -t mediamtx-mcp .
docker run --rm -i -e MEDIAMTX_URL=http://host.docker.internal:9997 mediamtx-mcp
```

---

## Phase 3 — Vite+React+Tailwind add-on

**Branch:** `claude/phase-3-vite-addon` (PR #9)
**Plan:** `docs/PHASE-3-VITE-ADDON.md`

Pure-client React package for embedding into a Vite host. Parallel to
the Next.js dashboard — both ship from the same repo.

### New code

```
packages/dashboard-vite/          # @iamjairo/mediamtx-dashboard
├── package.json
├── vite.config.ts                # 'app' mode = playground, 'lib' mode = consumable lib
├── Dockerfile                    # nginx + SPA fallback + runtime env injection
├── docker/{nginx.conf, runtime-config.sh}
└── src/
    ├── index.ts                  # public API
    ├── MediaMtxDashboard.tsx     # entry component
    ├── playground.tsx            # standalone Vite entry
    ├── styles.css                # Tailwind 4 + design tokens (IoT host palette)
    ├── lib/                      # context, utils, vendored client
    ├── hooks/queries.ts          # one React Query hook per endpoint
    ├── components/               # AppShell, Sidebar, TopBar, Card, Button, Badge, Stat, DataTable, KickButton
    └── modules/                  # overview, streams, sessions, paths, muxers, settings

deploy/                           # NEW
├── docker-compose.yml            # mediamtx + dashboard + mcp-server
├── mediamtx.yml
└── README.md

apps/desktop/                     # NEW — scaffolded
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/{App.tsx, ConnectionSetup.tsx, settings.ts, main.tsx}
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    └── src/{lib.rs, main.rs}
```

### Build

```sh
cd packages/dashboard-vite
npm install
npm run dev          # standalone preview at :5173
npm run build        # standalone SPA -> dist-app/
npm run build:lib    # consumable lib -> dist/ (ESM + .d.ts)
docker build -t mediamtx-dashboard .   # nginx container

cd ../../deploy
docker compose up -d                   # composed deployment

cd ../apps/desktop
npm install
npm run tauri dev                      # native window (needs Rust)
npm run tauri build                    # produces installers in src-tauri/target/release/bundle/
```

---

## Phase 4 — Production-ready releases (in progress)

**Branch:** `claude/phase-4-production-releases`
**Plan:** `docs/PHASE-4-PRODUCTION-RELEASES.md`

Four workstreams:

1. **MCP tray app** — `apps/mcp-tray/` — Tauri menubar shell that
   supervises `node dist/index.js` (child of the MCP server) and
   exposes start/stop/configure via a tray icon.
2. **MCP HTTP transport** — `mcp-server/src/http.ts` + transport switch
   in `index.ts` driven by `MEDIAMTX_MCP_TRANSPORT=stdio|http`.
3. **Release CI matrix** — `.github/workflows/release.yml` — multi-arch
   Docker builds + Tauri bundles for linux/darwin/windows × x64/arm64
   on tag push.
4. **Auto-update** — `tauri-plugin-updater` in both desktop apps,
   pointed at GitHub Releases.

### Status

This PR scaffolds the planning + the `apps/mcp-tray/` folder structure.
Concrete implementation of the four workstreams lands in follow-up PRs
per the milestone table in the plan doc.

---

## Build matrix summary

| Artifact | Where | Build command | Output |
|---|---|---|---|
| Next.js dashboard | `.` | `npm run build` | `.next/` (Next.js standalone) |
| MediaMTX MCP server | `mcp-server/` | `npm run build` | `mcp-server/dist/` |
| Vite dashboard (lib) | `packages/dashboard-vite/` | `npm run build:lib` | `dist/mediamtx-dashboard.js` + `dist/index.d.ts` |
| Vite dashboard (SPA) | `packages/dashboard-vite/` | `npm run build` | `dist-app/` |
| Dashboard container | `packages/dashboard-vite/` | `docker build .` | local Docker image |
| MCP server container | `mcp-server/` | `docker build .` | local Docker image |
| Desktop dashboard | `apps/desktop/` | `npm run tauri build` | `apps/desktop/src-tauri/target/release/bundle/` |
| MCP tray (Phase 4) | `apps/mcp-tray/` | `npm run tauri build` | `apps/mcp-tray/src-tauri/target/release/bundle/` |
| Composed stack | `deploy/` | `docker compose up -d` | running containers |

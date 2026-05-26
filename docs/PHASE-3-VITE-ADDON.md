# Phase 3 — Vite+React+Tailwind dashboard add-on (built)

This doc backfills the architecture for the work shipped on
`claude/phase-3-vite-addon` (PR #9). It complements
`PHASE-1-DASHBOARD-REMASTER.md` and `PHASE-2-MCP-SERVER.md`.

> **Status:** built. The folder tree below exists in the repo. This doc
> documents the *as-built* shape so future contributors can find their
> way around.

## Why a third dashboard

Phase 1 shipped a Next.js dashboard (server components + server actions
+ Prisma) inside this repo. Phase 3 ships a **second, parallel UI** that
targets a different deployment model:

- The personal IoT Dashboard host project is built on React+Vite+Tailwind
  and accepts third-party add-on modules.
- A Next.js app cannot be embedded into that host as a module — server
  components don't run in a Vite SPA, server actions need the Next.js
  runtime, and the App Router owns its own router.
- The Next.js dashboard (Phase 1) stays as-is for users who want the
  full server-rendered experience.
- The Vite package (Phase 3) is the path forward for embed + desktop
  + container deployments.

The two share nothing at runtime; both consume the same
`src/lib/MediaMTX/swagger.json` schema (vendored into each).

## Repo layout

```
packages/dashboard-vite/
├── package.json                  # @iamjairo/mediamtx-dashboard (peer-deps React)
├── vite.config.ts                # two modes: 'app' (playground SPA) + 'lib' (consumable lib)
├── tsconfig.json + .app.json + .node.json
├── index.html                    # playground entry; loads /runtime-config.js
├── Dockerfile                    # nginx-based static container with runtime env injection
├── docker/
│   ├── nginx.conf                # SPA fallback + cache headers
│   └── runtime-config.sh         # entrypoint shim: env → /runtime-config.js
└── src/
    ├── index.ts                  # public API (library entry)
    ├── playground.tsx            # standalone Vite entry
    ├── MediaMtxDashboard.tsx     # the React entry component
    ├── styles.css                # Tailwind 4 + design tokens (matches IoT host)
    ├── lib/
    │   ├── context.tsx           # MediaMtxProvider + useMediaMtx hook
    │   ├── utils.ts              # cn(), formatBytes, formatRelative, formatTimestamp
    │   └── mediamtx/
    │       ├── generated.ts      # vendored swagger-typescript-api client
    │       ├── swagger.json      # vendored MediaMTX OpenAPI definition
    │       └── client.ts         # factory: baseUrl + optional basic auth
    ├── hooks/
    │   └── queries.ts            # React Query hook per endpoint (read + mutate)
    ├── components/
    │   ├── AppShell.tsx          # sidebar + outlet
    │   ├── Sidebar.tsx           # collapsible nav with profile / badges / tree groups
    │   ├── TopBar.tsx            # page header, refresh, live status pill
    │   ├── Card.tsx              # surface primitive (rounded-2xl + hairline border)
    │   ├── Button.tsx            # CVA variants: primary (glow) / secondary / ghost / outline / destructive
    │   ├── Badge.tsx             # gold / muted / success / destructive / outline
    │   ├── Stat.tsx              # stat card with hue-tinted icon chip
    │   ├── DataTable.tsx         # generic table with row actions
    │   └── KickButton.tsx        # destructive action gated by allowDestructive prop
    └── modules/
        ├── overview/             # 4-up stats + sessions-by-protocol grid + quick links
        ├── streams/              # card grid + per-path detail page
        ├── sessions/             # tabbed: rtsp / rtsps / rtmp / rtmps / srt / webrtc
        ├── paths/                # CRUD: list + new + edit (with Patch/Replace toggle)
        ├── muxers/               # HLS muxers table
        └── settings/             # JSON editors for global config + path defaults

deploy/
├── docker-compose.yml            # mediamtx + dashboard + mcp-server (composed)
├── mediamtx.yml                  # minimal MediaMTX config
└── README.md

apps/desktop/                     # see PHASE-4 — scaffolded in Phase 3, completed in Phase 4
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite dev server on :1420 for Tauri
├── index.html
├── src/
│   ├── main.tsx                  # React root, mounts <App />
│   ├── App.tsx                   # connection-wizard gate + dashboard render
│   ├── ConnectionSetup.tsx       # first-run URL + creds wizard with smoke-test
│   └── settings.ts               # tauri-plugin-store wrapper
└── src-tauri/                    # Rust shell
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── build.rs
    ├── src/
    │   ├── lib.rs                # tauri::Builder + store plugin
    │   └── main.rs
    └── capabilities/default.json
```

## Design tokens

The dashboard ships its own `styles.css` with hardcoded design tokens
chosen to match the IoT Dashboard host's look (dark cool background,
`rounded-2xl` cards, hairline borders, glow on primary CTAs, hue-tinted
status fills). When the host's Tailwind theme is finalised, switching
to consume the host's CSS variables instead is a one-file change
(`packages/dashboard-vite/src/styles.css` → consume `--color-*` from the
host scope).

## Public API surface

```ts
import {
  MediaMtxDashboard,            // ready-to-mount component
  MediaMtxProvider, useMediaMtx,// for hosts building their own shell
  // every endpoint as a React Query hook:
  usePaths, useRtspSessions, useKickRtspSession, ...,
  // generated types:
  type Path, type PathConf, type RTSPSession, ...,
} from '@iamjairo/mediamtx-dashboard'
import '@iamjairo/mediamtx-dashboard/style.css'
```

Two consumption shapes:

1. **Mount the bundled shell** (sidebar + topbar + every module):
   ```tsx
   <Route path="/mediamtx/*" element={
     <MediaMtxDashboard
       baseUrl="http://localhost:9997"
       allowDestructive
     />
   } />
   ```

2. **Provider + hooks only** (host owns the layout entirely):
   ```tsx
   <MediaMtxProvider baseUrl="...">
     <MyCustomLayout />
   </MediaMtxProvider>
   ```

## Live data

Every endpoint is a `useQuery` hook in `src/hooks/queries.ts`. The
polling interval is read from the `MediaMtxProvider` context (default
5 s, settable from the Settings module and via the
`pollIntervalMs` prop). Mutations invalidate the affected query keys on
success so the UI updates without a manual refresh.

The original Phase 3 plan offered to build SSE / WebSocket push; we
defaulted to polling because (a) MediaMTX has no push API of its own,
so any push layer would itself poll, and (b) polling at 5 s is cheap and
matches the host's existing pattern.

## Deployment shapes (also Phase 3)

Three independent artifacts that compose:

- `packages/dashboard-vite/Dockerfile` — nginx-served SPA. Runtime
  config injected via env at container start, no rebuild needed.
- `deploy/docker-compose.yml` — wires upstream `bluenviron/mediamtx` +
  the dashboard image + the MCP server image.
- `apps/desktop/` — Tauri 2 shell wrapping the dashboard package for
  linux/darwin/windows × x64/arm64. Settings persisted via
  `tauri-plugin-store`. (The Rust shell is scaffolded but multi-arch
  release CI lands in Phase 4.)

## Known follow-ups handed to Phase 4

- Tauri-based **tray app for the MCP server** (different shell from the
  dashboard desktop: tray-only, supervises `node dist/index.js` as a
  child process).
- **Streamable-HTTP transport** for the MCP server so it can be the
  always-on service in the compose file.
- **Release CI matrix** (multi-arch Docker, multi-platform Tauri).
- **Auto-update** via `tauri-plugin-updater` pointed at GitHub Releases.

## Open questions still on PR #9

1. **CORS** — MediaMTX's v3 API doesn't emit `Access-Control-Allow-Origin`
   by default. The README documents the reverse-proxy / same-origin
   workarounds but the dashboard ships without a built-in proxy.
2. **Theming contract** — currently the package ships its own design
   tokens. Once the host's Tailwind theme is finalised, switch to
   consuming the host's CSS variables.
3. **Router** — Phase 3 assumed React Router v7 (host-owned). If the
   host uses TanStack Router or a different router, the
   `<MediaMtxDashboard>` component needs a render-prop variant.
4. **Recordings module** — placeholder only. The Next.js dashboard
   handles recordings via filesystem reads; the Vite add-on needs
   either a host-supplied API or its own.

## Definition of done

- [x] `npm run build:lib` produces `dist/mediamtx-dashboard.js` + types
- [x] `npm run build` produces the standalone playground SPA
- [x] Dockerfile builds a nginx image with runtime env injection
- [x] `deploy/docker-compose.yml` wires all three artifacts together
- [x] Tauri shell scaffolded (Cargo.toml, tauri.conf.json, lib.rs)
- [ ] Tauri shell verified to launch (needs Rust toolchain — Phase 4)
- [ ] Multi-arch release CI (Phase 4)
- [ ] Auto-update wired (Phase 4)

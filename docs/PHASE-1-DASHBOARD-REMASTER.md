# Phase 1 — Dashboard Re-master Plan

Goal: turn MediaMTX Connect from a thin viewer (4 of 38 API endpoints used)
into a full-coverage operational dashboard for MediaMTX. Companion to the
audit in `docs/MEDIAMTX-API-AUDIT.md`.

This document is **a plan, not a spec**. Concrete code lands in subsequent
PRs.

## Scope

- Cover all 38 v3 endpoints exposed by the generated client.
- Restructure the feature tree to make room for `sessions` and `path-config`.
- Centralise the MediaMTX HTTP client (auth, base URL, error normalisation).
- Keep the existing CLAUDE.md feature conventions; no rewrites of the
  framework, only additions.

Out of scope for Phase 1: the MCP server (Phase 2), recording management
overhaul (it's filesystem-based today and works), Tailwind/shadcn re-theming.

## Target structure

Additions in **bold**, modifications in *italic*.

```
src/
├── features/
│   ├── streams/
│   │   ├── live-view/                # existing — keep
│   │   ├── path-detail/              # NEW — per-path drawer/page (pathsGet)
│   │   ├── path-config/              # NEW — CRUD for /v3/config/paths/*
│   │   └── hls-muxers/               # NEW — /v3/hlsmuxers/{list,get}
│   ├── sessions/                     # NEW DOMAIN
│   │   ├── rtsp/                     # rtspconns + rtspsessions
│   │   ├── rtsps/                    # rtspsconns + rtspssessions
│   │   ├── rtmp/                     # rtmpconns
│   │   ├── rtmps/                    # rtmpsconns
│   │   ├── srt/                      # srtconns
│   │   └── webrtc/                   # webrtcsessions
│   ├── config/
│   │   ├── mediamtx/                 # existing — keep
│   │   ├── path-defaults/            # NEW — /v3/config/pathdefaults/*
│   │   └── client/                   # existing — keep
│   └── recordings/                   # existing — unchanged
│
├── lib/
│   └── MediaMTX/
│       ├── generated.ts              # existing — unchanged
│       ├── swagger.json              # existing — unchanged
│       ├── client.ts                 # NEW — factory + auth + defaults
│       └── errors.ts                 # NEW — normalised error type
│
└── app/
    ├── sessions/                     # NEW route group
    │   ├── page.tsx                  # redirect to /sessions/rtsp
    │   ├── rtsp/page.tsx
    │   ├── rtsps/page.tsx
    │   ├── rtmp/page.tsx
    │   ├── rtmps/page.tsx
    │   ├── srt/page.tsx
    │   └── webrtc/page.tsx
    ├── streams/
    │   └── [name]/page.tsx           # NEW — per-path detail
    ├── config/
    │   ├── path-defaults/page.tsx    # NEW
    │   └── paths/                    # NEW — CRUD UI
    │       ├── page.tsx              # list
    │       ├── new/page.tsx
    │       └── [name]/page.tsx       # edit
    └── ...
```

## Endpoint → feature mapping

| Endpoint | Feature | UI surface |
|---|---|---|
| `configGlobalGet` / `configGlobalSet` | `config/mediamtx` | existing form |
| `configPathDefaultsGet` / `configPathDefaultsPatch` | `config/path-defaults` | new form (sibling tab) |
| `configPathsList` | `streams/path-config` | list table |
| `configPathsGet` | `streams/path-config` | edit page hydrator |
| `configPathsAdd` | `streams/path-config` | "New path" form |
| `configPathsPatch` | `streams/path-config` | edit form (partial save) |
| `configPathsReplace` | `streams/path-config` | edit form (full save / YAML import) |
| `configPathsDelete` | `streams/path-config` | row action |
| `pathsList` | `streams/live-view` | existing |
| `pathsGet` | `streams/path-detail` | new detail page |
| `hlsmuxersList` / `hlsmuxersGet` | `streams/hls-muxers` | new list + drawer |
| `rtspconnsList/Get` + `rtspsessionsList/Get/Kick` | `sessions/rtsp` | two-tab page |
| `rtspsconnsList/Get` + `rtspssessionsList/Get/Kick` | `sessions/rtsps` | two-tab page |
| `rtmpconnsList/Get/Kick` | `sessions/rtmp` | list + row kick |
| `rtmpsconnsList/Get/Kick` | `sessions/rtmps` | list + row kick |
| `srtconnsList/Get/Kick` | `sessions/srt` | list + row kick |
| `webrtcsessionsList/Get/Kick` | `sessions/webrtc` | list + row kick |

## Cross-cutting work

### Centralised client (`lib/MediaMTX/client.ts`)

Replaces the inline `new Api({ baseUrl: ... })` calls scattered across server
actions. Single factory reads `getAppConfig()`, attaches a `securityWorker`
when MediaMTX auth is configured, and sets `cache: 'no-store'` as the default
fetch option. Every server action then does:

```ts
const api = await getMediaMtxClient()
```

### Auth support

Today MediaMTX with `apiUsername`/`apiPassword` configured is unreachable from
the dashboard. Add two new `Config` fields (`mediaMtxApiUsername`,
`mediaMtxApiPassword`) wired through `securityWorker`. Mark password fields
`sensitive` in the form so they don't render in plain text.

### Connection-test action

`testMediaMtxConnection()` server action: calls `configGlobalGet`, returns
`{ ok, latencyMs, error? }`. Wired to a "Test connection" button on the
config form before save, and surfaced as a status pill in the nav bar.

### List pagination

Every `*List` endpoint takes `page` + `itemsPerPage`. Add a `usePagedList`
hook in `shared/hooks/` and a `PagedTable` component in `shared/components/`.
Use it on every new list view; retro-fit `LiveViewPage` last.

### Schema-driven config form

The current `MediaMTXConfigForm` hand-enumerates ~70 fields. Build a small
helper that reads `swagger.json`, extracts `definitions.GlobalConf.properties`,
and renders a field per property typed by `format`. Replaces the hand-written
form. Same approach reusable for `PathConf` so path-config CRUD doesn't
duplicate the work.

### Generated client regen script

Add `npm run generate:mediamtx` to `package.json` driving
`swagger-typescript-api` against `src/lib/MediaMTX/swagger.json`. Document in
README.

### Lint fixes on main

Pre-existing lint failures in `.github/dependabot.yml` and
`features/recordings/browse/actions/getStreamRecordings.ts` will block CI on
any of these PRs. Land a `chore: npm run lint:fix` PR first.

## Milestones (suggested PR sequence)

| # | PR | Endpoints covered (cumulative) |
|---:|---|---:|
| 0 | `chore: lint:fix` to unblock CI | 4 / 38 |
| 1 | Foundation: `lib/MediaMTX/client.ts`, auth fields, connection-test, shared `PagedTable` | 4 / 38 |
| 2 | Sessions domain — RTSP + RTSPS (8 endpoints) | 12 / 38 |
| 3 | Sessions domain — RTMP + RTMPS + SRT + WebRTC (12 endpoints) | 24 / 38 |
| 4 | Path config CRUD (6 endpoints) + path defaults (2) | 32 / 38 |
| 5 | Per-path detail (`pathsGet`) + HLS muxers (2) | 35 / 38 |
| 6 | Schema-driven config form + swagger regen script | 35 / 38 |
| 7 | Pagination retro-fit + polish | 38 / 38 |

Each PR independently deployable; navigation entries added per-PR rather
than all at once.

## Navigation changes

Today: `Streams`, `Recordings`, `Config`.

Target:

```
Streams       (Live grid)
  └─ Paths    (config CRUD)
  └─ HLS Muxers
Sessions      (defaults to RTSP)
  ├─ RTSP
  ├─ RTSPS
  ├─ RTMP
  ├─ RTMPS
  ├─ SRT
  └─ WebRTC
Recordings
Config
  ├─ MediaMTX
  ├─ Path Defaults
  └─ Client
```

Implemented as the existing flat `NavBar` plus per-section sub-nav in
each route's `layout.tsx`.

## Open questions for the maintainer

1. **Auth credentials at rest.** Storing `mediaMtxApiPassword` in the SQLite
   `Config` table in plaintext is the simplest path. Acceptable, or do you
   want envelope encryption?
2. **Path-config editor — partial (PATCH) vs full (REPLACE)?** PATCH is
   safer; REPLACE matches the "edit YAML wholesale" mental model. Both, or
   just PATCH with an "advanced YAML editor" toggle?
3. **Kick confirmations.** Should kick actions require a confirm dialog or
   fire immediately? Recommendation: confirm for sessions, immediate for
   stale connections older than N hours.
4. **Real-time updates.** Polling vs SSE vs none? MediaMTX has no push API,
   so polling is the only option — recommend 5s on sessions pages,
   server-rendered (no polling) elsewhere.
5. **Permissions.** Single-user assumption today. Worth adding a
   read-only/admin split before exposing kick + delete actions, or defer?

## Definition of done

- All 38 v3 endpoints reachable from the UI.
- Every server action goes through `getMediaMtxClient()`.
- MediaMTX with API auth enabled works end-to-end.
- `npm run generate:mediamtx` regenerates `generated.ts` from
  `swagger.json` cleanly.
- E2E suite covers: list sessions, kick a session, create a path, edit a
  path, delete a path.
- Audit doc updated to reflect 38/38 coverage.

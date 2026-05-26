# MediaMTX API Coverage Audit

Audit of the MediaMTX v3 control API surface (as defined in
`src/lib/MediaMTX/swagger.json` / `src/lib/MediaMTX/generated.ts`) versus what
the MediaMTX Connect dashboard actually uses.

## Summary

The MediaMTX REST API exposes **38 endpoints** across 10 logical groups. The
dashboard currently calls **4 of them** (≈ 10% coverage). All read/kick
endpoints for live sessions and connections, all per-path runtime endpoints,
all path configuration endpoints, the HLS muxer endpoints, and the path
defaults endpoints are unused.

The generated client itself is complete — the gap is entirely on the UI /
server-action side.

| Group | Endpoints | Used | Status |
|---|---:|---:|---|
| Global config | 2 | 2 | Covered |
| Path defaults config | 2 | 0 | Missing |
| Path configs (CRUD) | 6 | 0 | Missing |
| Runtime paths | 2 | 1 | Partial (list only) |
| HLS muxers | 2 | 0 | Missing |
| RTSP conns/sessions | 6 | 0 | Missing |
| RTSPS conns/sessions | 6 | 0 | Missing |
| RTMP conns | 3 | 0 | Missing |
| RTMPS conns | 3 | 0 | Missing |
| SRT conns | 3 | 0 | Missing |
| WebRTC sessions | 3 | 0 | Missing |
| **Total** | **38** | **4** | **~10%** |

## Endpoint-by-endpoint matrix

| # | Method + Path | Client method | Used in repo? | Where |
|---:|---|---|---|---|
| 1 | GET `/v3/config/global/get` | `configGlobalGet` | ✅ | `features/config/mediamtx/actions/getGlobalConfig.ts`, `features/streams/live-view/components/LiveViewPage.tsx:49` |
| 2 | PATCH `/v3/config/global/patch` | `configGlobalSet` | ✅ | `features/config/mediamtx/actions/updateGlobalConfig.ts:25` |
| 3 | GET `/v3/config/pathdefaults/get` | `configPathDefaultsGet` | ❌ | — |
| 4 | PATCH `/v3/config/pathdefaults/patch` | `configPathDefaultsPatch` | ❌ | — |
| 5 | GET `/v3/config/paths/list` | `configPathsList` | ❌ | — |
| 6 | GET `/v3/config/paths/get/{name}` | `configPathsGet` | ❌ | — |
| 7 | POST `/v3/config/paths/add/{name}` | `configPathsAdd` | ❌ | — |
| 8 | PATCH `/v3/config/paths/patch/{name}` | `configPathsPatch` | ❌ | — |
| 9 | POST `/v3/config/paths/replace/{name}` | `configPathsReplace` | ❌ | — |
| 10 | DELETE `/v3/config/paths/delete/{name}` | `configPathsDelete` | ❌ | — |
| 11 | GET `/v3/paths/list` | `pathsList` | ✅ | `features/streams/live-view/components/LiveViewPage.tsx:48` |
| 12 | GET `/v3/paths/get/{name}` | `pathsGet` | ❌ | — |
| 13 | GET `/v3/hlsmuxers/list` | `hlsmuxersList` | ❌ | — |
| 14 | GET `/v3/hlsmuxers/get/{name}` | `hlsmuxersGet` | ❌ | — |
| 15 | GET `/v3/rtspconns/list` | `rtspconnsList` | ❌ | — |
| 16 | GET `/v3/rtspconns/get/{id}` | `rtspconnsGet` | ❌ | — |
| 17 | GET `/v3/rtspsessions/list` | `rtspsessionsList` | ❌ | — |
| 18 | GET `/v3/rtspsessions/get/{id}` | `rtspsessionsGet` | ❌ | — |
| 19 | POST `/v3/rtspsessions/kick/{id}` | `rtspsessionsKick` | ❌ | — |
| 20 | GET `/v3/rtspsconns/list` | `rtspsconnsList` | ❌ | — |
| 21 | GET `/v3/rtspsconns/get/{id}` | `rtspsconnsGet` | ❌ | — |
| 22 | GET `/v3/rtspssessions/list` | `rtspssessionsList` | ❌ | — |
| 23 | GET `/v3/rtspssessions/get/{id}` | `rtspssessionsGet` | ❌ | — |
| 24 | POST `/v3/rtspssessions/kick/{id}` | `rtspssessionsKick` | ❌ | — |
| 25 | GET `/v3/rtmpconns/list` | `rtmpconnsList` | ❌ | — |
| 26 | GET `/v3/rtmpconns/get/{id}` | `rtmpconnsGet` | ❌ | — |
| 27 | POST `/v3/rtmpconns/kick/{id}` | `rtmpconnsKick` | ❌ | — |
| 28 | GET `/v3/rtmpsconns/list` | `rtmpsconnsList` | ❌ | — |
| 29 | GET `/v3/rtmpsconns/get/{id}` | `rtmpsconnsGet` | ❌ | — |
| 30 | POST `/v3/rtmpsconns/kick/{id}` | `rtmpsconnsKick` | ❌ | — |
| 31 | GET `/v3/srtconns/list` | `srtconnsList` | ❌ | — |
| 32 | GET `/v3/srtconns/get/{id}` | `srtconnsGet` | ❌ | — |
| 33 | POST `/v3/srtconns/kick/{id}` | `srtconnsKick` | ❌ | — |
| 34 | GET `/v3/webrtcsessions/list` | `webrtcsessionsList` | ❌ | — |
| 35 | GET `/v3/webrtcsessions/get/{id}` | `webrtcsessionsGet` | ❌ | — |
| 36 | POST `/v3/webrtcsessions/kick/{id}` | `webrtcsessionsKick` | ❌ | — |

(`configPathsList` is a list call grouped with #5; full count = 38 if you
count the implicit list pagination params as separate.)

## What the dashboard does today

Searching the codebase for calls into the MediaMTX client
(`grep -rn "api.v3" src/`) returns exactly four call sites:

```
src/features/config/mediamtx/actions/getGlobalConfig.ts:21    api.v3.configGlobalGet
src/features/config/mediamtx/actions/updateGlobalConfig.ts:25 api.v3.configGlobalSet
src/features/streams/live-view/components/LiveViewPage.tsx:48 api.v3.pathsList
src/features/streams/live-view/components/LiveViewPage.tsx:49 api.v3.configGlobalGet
```

The remaining MediaMTX-facing surfaces in the app are file-system based, not
API based:

- Recordings browsing (`features/recordings/browse/*`) reads recording files
  directly from `recordingsDirectory`, it does not call MediaMTX.
- Thumbnail / screenshot generation (`instrumentation.ts`) uses `ffmpeg`
  against the HLS URL, not the MediaMTX REST API.
- The Next.js routes under `src/app/api/[streamName]/*` proxy local files
  (downloads, screenshots), they are not MediaMTX endpoints.

So apart from "list active paths to render cards" and "read/write the global
config form", the dashboard does not talk to MediaMTX at all.

## Gaps — capabilities that are not surfaced

Each item below maps to one or more unused endpoints. They are grouped by the
user-facing feature that would expose them.

### 1. Path configuration management (CRUD)

Endpoints: 3, 4, 5, 6, 7, 8, 9, 10.

MediaMTX stores per-path configuration (source URL, record on/off, publish
auth, run-on-ready hooks, etc.) and exposes full CRUD. None of this is
reachable from the dashboard today — paths can only be configured by editing
`mediamtx.yml` and restarting. A `features/streams/path-config/` feature
covering list/add/edit/replace/delete plus a path-defaults editor would unlock
the biggest chunk of missing functionality.

### 2. Per-path live detail

Endpoint: 12 (`pathsGet`).

The live view only uses the path list. A path-detail drawer or page could
show the active source, the active readers, bytes sent/received, and
`readyTime` / `tracks`. This is what would make the dashboard a real
operational tool rather than a thumbnail grid.

### 3. Active sessions & connections

Endpoints: 15–36.

Across RTSP, RTSPS, RTMP, RTMPS, SRT and WebRTC, MediaMTX exposes a uniform
`list / get / kick` triad. A "Sessions" / "Connections" page is the natural
place for these — one tab per protocol, a table per tab, and a kick action on
each row. None of this exists.

The kick endpoints in particular are administrator features the dashboard is
the natural home for (today an operator has to `curl` the API by hand).

### 4. HLS muxers

Endpoints: 13, 14.

`hlsmuxersList` and `hlsmuxersGet` expose the live HLS muxers (path,
created/last-request times, bytes sent). Useful for a "HLS muxers" view or as
extra columns on the streams page; currently unsurfaced.

### 5. Path defaults editor

Endpoints: 3, 4.

`configPathDefaultsGet` / `configPathDefaultsPatch` set defaults applied to
every path that doesn't override them. The Global Config page covers global
settings but not path defaults — a sibling form on the same config route is a
small, high-value add.

### 6. Pagination / search on lists

Every `*List` endpoint accepts `page` and `itemsPerPage` query params. The
generated client honours them; the one call site (`pathsList`) passes `{}`.
Once any list view grows beyond a handful of items the dashboard will fetch
everything; wiring pagination through the existing call would be cheap.

## Other observations worth flagging

- **No central API client.** Each call site builds its own `new Api({...})`
  from `getAppConfig()`. A `src/lib/MediaMTX/client.ts` factory would remove
  the duplication and give one place to attach auth headers, `cache: 'no-store'`
  defaults, and error normalisation.
- **No auth on the client.** MediaMTX supports basic auth on the API
  (`apiUsername`/`apiPassword` in the config, or external auth). The
  generated client has a `securityWorker` hook but the dashboard never sets
  one — a MediaMTX instance with auth enabled is unreachable from this UI
  today.
- **Global config form is hand-maintained.** `MediaMTXConfigForm.tsx`
  enumerates ~70 fields by hand; the swagger schema already lists them. If
  swagger changes (new MediaMTX release) the form silently drops fields. A
  schema-driven form (or at least a generated field list) would close that
  drift.
- **Generated client is checked in.** That's fine, but there's no
  `npm run` script visible to regenerate it from `swagger.json`. Worth adding
  so upgrading MediaMTX versions is a one-command operation.
- **No "connection test" UI.** The config page lets you set the MediaMTX URL
  but doesn't ping `configGlobalGet` to validate it before save. The current
  flow saves and then surfaces the failure only on the next page load.

## Suggested prioritisation

If you only do one thing: **add a Sessions page** that lists active
RTSP/RTMP/SRT/WebRTC connections with a kick button. It is the highest-value
operational feature MediaMTX offers and the dashboard ignores it entirely.

If you do two: add **path config CRUD** as a second feature, so the dashboard
becomes a complete replacement for hand-editing `mediamtx.yml`.

After that, per-path detail (`pathsGet`), path defaults, HLS muxers, and
pagination round out the API surface.

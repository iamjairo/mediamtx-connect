# HANDOFF.md

Status of the project as of 2026-05-26. Where each branch / PR stands,
which pre-existing issues are unresolved, what's awaiting your input,
and what to pick up next.

---

## Project shape (recap)

Four shippable artifacts in one private repo:

1. Next.js dashboard (server-rendered, Phase 1)
2. Vite+React+Tailwind dashboard (add-on package, Phase 3)
3. MediaMTX MCP server (Phase 2)
4. Tauri desktop apps + composed Docker deployment (Phase 3 + Phase 4)

---

## Branch / PR status

| Branch | PR | State | What it contains |
|---|---|---|---|
| `claude/mediamtx-api-audit-EDcOU` | [#6](https://github.com/iamjairo/mediamtx-connect/pull/6) | Draft | The original audit doc. Pre-existing CI red. Largely superseded by Phase 1. |
| `claude/phase-1-dashboard-remaster` | [#7](https://github.com/iamjairo/mediamtx-connect/pull/7) | Draft | Full Next.js dashboard rewrite to 36/36 API coverage. Build + CodeQL green. E2E historically broken but now fixed. |
| `claude/phase-2-mcp-server` | [#8](https://github.com/iamjairo/mediamtx-connect/pull/8) | Draft | MCP server with 36 tools, 11 resources, 5 prompts. Build + CodeQL green. |
| `claude/phase-3-vite-addon` | [#9](https://github.com/iamjairo/mediamtx-connect/pull/9) | Draft | Vite dashboard add-on + Docker + Tauri desktop. Build green. Watch for E2E. |
| `claude/phase-4-production-releases` | (this PR) | Draft | Phase 4 scaffold + the four top-level docs. |

---

## What's green vs what's red

### Green across all phase PRs

- Lint (after the foundational `chore` commit on each branch)
- TypeScript typecheck
- Next.js build
- MCP server typecheck + build
- Vite dashboard typecheck + build
- CodeQL (JS/TS) static analysis

### Yellow / situational

- **E2E tests:** Phase 1 ships the form-count + toast-string fixes
  that broke E2E. The CI step reorder (test-data dirs before MediaMTX
  container) is on every phase branch. Should now be green; verify by
  watching the next PR run.
- **Phase 4 multi-arch release CI:** not yet written; expected in PR 4
  of the milestone sequence in `docs/PHASE-4-PRODUCTION-RELEASES.md`.

### Known pre-existing problems on `main` (not introduced by this work)

- **Prisma 7 dep bump never came with the required v7 migration.** The
  schema uses `url = env("DATABASE_URL")` which v7 rejects, and the
  Prisma client is instantiated without an adapter. Every phase
  branch pins back to `^6.16.2`; merging any one of them to main
  resolves it for everyone.
- **Lint failures in `.github/dependabot.yml` and
  `src/features/recordings/browse/actions/getStreamRecordings.ts`** —
  same story. Auto-fixable; the foundational `chore` commit on every
  phase branch fixes them.
- **`actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`**
  are referenced in `.github/workflows/ci.yml`. v6 / v7 of these
  exist in GHA; not a bug.

---

## Pending decisions / open questions

These are flagged in the phase docs but worth surfacing here so you
can answer them in one place when you're ready.

### Phase 1 (dashboard) — `PHASE-1-DASHBOARD-REMASTER.md` open Qs

1. Auth credentials at rest — currently plaintext in SQLite. Acceptable?
2. Path-config editor — currently both PATCH (partial) and REPLACE
   (full). Right call?
3. Kick confirmations — currently a confirm dialog. Confirm always or
   skip on stale sessions?
4. Real-time updates — currently server-rendered with `cache: 'no-store'`,
   no client polling on the Next.js side. Phase 3 added 5 s polling
   in the Vite dashboard. OK to leave Phase 1 as-is?
5. Permissions — single-user assumed. Add a read-only/admin split?

### Phase 2 (MCP) — `PHASE-2-MCP-SERVER.md` open Qs

1. Workspace vs separate repo — chose self-contained subdirectory
   (`mcp-server/`). Confirm?
2. Package scope — `@iamjairo/mediamtx-mcp` on npm. OK?
3. Kick gating — currently env-flag `MEDIAMTX_MCP_ALLOW_KICK`. Sufficient?
4. Resource update notifications — skipped (poll-only). OK?
5. Telemetry — none. Add opt-in?

### Phase 3 (Vite add-on) — `PHASE-3-VITE-ADDON.md` open Qs

1. **CORS** — dashboard ships without a built-in proxy. Want me to add
   a sample Vite dev-proxy config in the README?
2. **Theming contract** — currently the package ships its own design
   tokens. Switch to consuming host CSS variables once the host theme
   is finalised?
3. **Router** — assumed React Router v7 (host-owned). If your IoT
   Dashboard uses a different router, the dashboard needs a
   render-prop variant.
4. **Recordings module** — placeholder only. Host-supplied API or
   build one in the package?

### Phase 4 (releases) — `PHASE-4-PRODUCTION-RELEASES.md` open Qs

1. **macOS notarization** — skipped (personal use). Re-decidable.
2. **Tray app "show logs"** — current proposal is a separate webview
   tailing `child.stderr`. Alternative: write to a file in the
   platform's log dir.
3. **MCP HTTP auth** — none in the spec; safe if bound to localhost.
   If you'd expose it remotely, add a bearer-token layer.
4. **Bundling Node** — current proposal assumes user has Node 20+.
   Bundling Node would add ~80 MB to each tray-app installer.

---

## What's pending from you

Operational items only you can do:

1. **Set the repo to private** via Settings → Danger Zone →
   "Change repository visibility". The GitHub MCP available here
   can't toggle this.
2. **Pick one phase PR to merge first.** Phase 1 has the most
   downstream consumers (Phase 2 and Phase 3 are independent of it,
   but the lint + Prisma + CI-step-order fixes need to land on main
   to stop blocking everyone). Recommended merge order: 7 → 8 → 9 →
   (new Phase 4 PR).
3. **Answer the open questions above** at your convenience.
4. **Tauri prerequisites** if you want to build the desktop apps
   locally — see `MANUAL.md` § "Tauri build fails on…".

---

## What I'd pick up next

In rough order of value:

1. Land Phase 1 → main. Unblocks the foundational lint + Prisma
   fixes for every other PR; closes the API coverage gap.
2. Land Phase 2 → main. Standalone, no Phase 1 dependency.
3. Land Phase 3 → main. Brings the Vite add-on, the dashboard
   container, the composed deployment, and the desktop scaffold.
4. Execute the Phase 4 milestone sequence (5 PRs per the table in
   `docs/PHASE-4-PRODUCTION-RELEASES.md`).
5. Address the per-phase open questions (any that still apply once
   things are merged).

---

## Useful commands cheat sheet

```sh
# See where things are
git branch -a | grep claude
gh pr list           # (gh CLI not available in this dev env — use GitHub UI)

# Foundational fixes (already on all phase branches; need to land on main)
npm install
DATABASE_URL='file:./database.db' npx prisma generate --schema src/lib/prisma/schema.prisma
npm run lint && npm run typecheck && npm run build

# Run the composed stack
cd deploy && docker compose up -d

# Run the MCP server standalone
cd mcp-server && npm install && npm run build && \
  MEDIAMTX_URL=http://localhost:9997 npm start

# Run the Vite dashboard standalone
cd packages/dashboard-vite && npm install && npm run dev

# Build the desktop app
cd apps/desktop && npm install && npm run tauri build
```

# MediaMTX Connect

Personal-use management surface for a [MediaMTX](https://github.com/bluenviron/mediamtx) server. One repo, four shippable artifacts that compose together.

## What's in this repo

| Product | Folder | Purpose | Build target |
|---|---|---|---|
| **Next.js dashboard** | `src/`, `src/app/` | Original full-stack dashboard (server components + Prisma + SQLite). | `npm run build` |
| **Vite dashboard package** | `packages/dashboard-vite/` | Pure-React UI for embedding into a React+Vite host (the IoT Dashboard add-on path) and for the container / desktop forms. | `npm run build:lib` |
| **MCP server** | `mcp-server/` | Model Context Protocol server exposing every MediaMTX v3 endpoint to Claude Desktop / Code / Cursor / etc. | `npm run build` |
| **Composed deployment** | `deploy/` | docker-compose wiring upstream MediaMTX + the dashboard image + the MCP server image. | `docker compose up -d` |
| **Desktop apps** | `apps/desktop/`, `apps/mcp-tray/` | Tauri 2 native shells: a full dashboard window and an MCP-server tray app. | `tauri build` |

## Repo-level docs

| Doc | Purpose |
|---|---|
| [`README.md`](./README.md) | This file. Overview + quick start. |
| [`BUILD.md`](./BUILD.md) | Phase-by-phase summary of what's been built and where it lives. |
| [`MANUAL.md`](./MANUAL.md) | How to operate the dashboard, deploy, and desktop apps. |
| [`HANDOFF.md`](./HANDOFF.md) | Status, open PRs, pending decisions, and what to pick up next. |

## Phase-specific docs

| Doc | What it covers |
|---|---|
| [`docs/MEDIAMTX-API-AUDIT.md`](./docs/MEDIAMTX-API-AUDIT.md) | Original gap analysis of the v3 API surface vs the dashboard. |
| [`docs/PHASE-1-DASHBOARD-REMASTER.md`](./docs/PHASE-1-DASHBOARD-REMASTER.md) | Next.js dashboard expansion to full 36/36 API coverage. |
| [`docs/PHASE-2-MCP-SERVER.md`](./docs/PHASE-2-MCP-SERVER.md) | MCP server design: tools, resources, prompts, transports. |
| [`docs/PHASE-3-VITE-ADDON.md`](./docs/PHASE-3-VITE-ADDON.md) | Vite+React+Tailwind add-on for the IoT Dashboard host. |
| [`docs/PHASE-4-PRODUCTION-RELEASES.md`](./docs/PHASE-4-PRODUCTION-RELEASES.md) | Release CI matrix, MCP tray app, auto-update, MCP HTTP transport. |

## Quick start — composed (Docker)

```sh
cd deploy
docker compose up -d
```

- Dashboard: <http://localhost:8080>
- MediaMTX API: <http://localhost:9997>
- MCP server: stdio-only by default — see `mcp-server/README.md` for client configs.

## Quick start — local dev

```sh
# Install root deps + generate Prisma client
npm install
DATABASE_URL='file:./database.db' npx prisma generate --schema src/lib/prisma/schema.prisma

# Run the Next.js dashboard
npm run dev               # http://localhost:3000

# Run the Vite dashboard standalone
cd packages/dashboard-vite && npm install && npm run dev      # http://localhost:5173

# Run the MCP server (stdio)
cd mcp-server && npm install && npm run build && \
  MEDIAMTX_URL=http://localhost:9997 npm start

# Run the desktop app (requires Rust toolchain)
cd apps/desktop && npm install && npm run tauri dev
```

## Tech stack

- Next.js 16, React 19, Prisma 6 (SQLite) — original dashboard
- Vite 6, React 19, Tailwind 4, React Router 7, TanStack Query 5 — add-on package
- Node 22, `@modelcontextprotocol/sdk` — MCP server
- Tauri 2 (Rust + system webview) — desktop apps
- Playwright — E2E tests

## License

MIT. Private repo — not for redistribution.

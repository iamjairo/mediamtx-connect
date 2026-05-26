# Phase 4 — MCP server changes (scaffold)

These files belong in `mcp-server/` once Phase 2 is merged to `main`.
They're held here so the Phase 4 branch (cut from `main`) doesn't have
to also carry the entire Phase 2 server.

Workflow when Phase 4 lands:

1. Land Phase 2 PR (#8) → `main`. `mcp-server/` now exists on `main`.
2. Rebase the Phase 4 branch onto the new `main`.
3. Move these files into the real `mcp-server/` tree:
   - `http.ts` → `mcp-server/src/http.ts`
   - The `index.ts` patch described in `index.patch.md` → applied to
     `mcp-server/src/index.ts`.
   - The `package.json` patch → applied to `mcp-server/package.json`.
4. Delete this folder.

## Files

- **`http.ts`** — Streamable-HTTP transport for the MCP server, loaded
  when `MEDIAMTX_MCP_TRANSPORT=http`. Stateless per the 2026-07-28 spec.
- **`index.patch.md`** — Describes the transport-switch change in
  `src/index.ts`.
- **`package.json.patch.md`** — Adds the `start:http` npm script.

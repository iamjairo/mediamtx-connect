# `mcp-server/package.json` patch

Add a `start:http` script alongside the existing `start`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "start:http": "MEDIAMTX_MCP_TRANSPORT=http node dist/index.js",
    "dev": "tsx src/index.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

No new dependencies — the streamable-HTTP transport is part of
`@modelcontextprotocol/sdk` 1.21+ which is already in `dependencies`.

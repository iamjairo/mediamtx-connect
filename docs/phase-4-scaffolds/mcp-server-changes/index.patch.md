# `src/index.ts` patch — transport switch

Replaces the current always-stdio bootstrap with an env-driven switch.

```ts
#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { loadConfig } from './config.js'
import { createMediaMtxClient } from './mediamtx/client.js'
import { startHttpTransport } from './http.js'
import { registerPrompts } from './prompts/index.js'
import { registerResources } from './resources/index.js'
import { registerAllTools } from './tools/index.js'

async function main(): Promise<void> {
  const config = loadConfig()
  const api = createMediaMtxClient(config)

  const server = new McpServer({
    name: '@iamjairo/mediamtx-mcp',
    version: '0.1.0',
  })

  registerAllTools({ server, api, allowKick: config.allowKick })
  registerResources(server, api)
  registerPrompts(server)

  const transport = process.env.MEDIAMTX_MCP_TRANSPORT ?? 'stdio'

  if (transport === 'http') {
    const port = Number(process.env.MEDIAMTX_MCP_HTTP_PORT ?? 8181)
    await startHttpTransport({ port, server })
  }
  else {
    const stdio = new StdioServerTransport()
    await server.connect(stdio)
    process.stderr.write(
      `mediamtx-mcp ready (MediaMTX: ${config.mediaMtxUrl}, write tools: ${config.allowKick ? 'enabled' : 'disabled'}, transport: stdio)\n`,
    )
  }
}

main().catch((error) => {
  process.stderr.write(`Fatal: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
```

## Diff vs current

- Adds `MEDIAMTX_MCP_TRANSPORT` env switch (default `stdio`).
- Adds `MEDIAMTX_MCP_HTTP_PORT` (default `8181`) used only in HTTP mode.
- Stdio path unchanged behaviourally.

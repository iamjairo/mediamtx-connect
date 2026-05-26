#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { loadConfig } from './config.js'
import { createMediaMtxClient } from './mediamtx/client.js'
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

  const transport = new StdioServerTransport()
  await server.connect(transport)

  process.stderr.write(
    `mediamtx-mcp ready (MediaMTX: ${config.mediaMtxUrl}, write tools: ${config.allowKick ? 'enabled' : 'disabled'})\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`Fatal: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

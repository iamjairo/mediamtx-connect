import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import type { Api } from '../mediamtx/generated.js'

import { registerConfigTools } from './config.js'
import { registerHlsTools } from './hls.js'
import { registerPathTools } from './paths.js'
import { registerSessionTools } from './sessions.js'

interface RegisterToolsInput {
  server: McpServer
  api: Api<unknown>
  allowKick: boolean
}

export function registerAllTools({ server, api, allowKick }: RegisterToolsInput): void {
  registerConfigTools(server, api, allowKick)
  registerPathTools(server, api, allowKick)
  registerHlsTools(server, api)
  registerSessionTools(server, api, allowKick)
}

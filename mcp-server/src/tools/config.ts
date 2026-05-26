import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { z } from 'zod'

import type { Api, GlobalConf, PathConf } from '../mediamtx/generated.js'

import { callOrFail, callVoidOrFail, errorResult } from './util.js'

export function registerConfigTools(server: McpServer, api: Api<unknown>, allowKick: boolean): void {
  server.registerTool(
    'mediamtx_config_global_get',
    {
      title: 'Get global config',
      description: 'Return the current MediaMTX global configuration.',
      annotations: { readOnlyHint: true },
      inputSchema: {},
    },
    async () => callOrFail(api.v3.configGlobalGet()),
  )

  server.registerTool(
    'mediamtx_config_global_set',
    {
      title: 'Patch global config',
      description: 'PATCH the MediaMTX global configuration. Only included fields are changed.',
      annotations: { destructiveHint: true, idempotentHint: false },
      inputSchema: { config: z.record(z.string(), z.any()).describe('Partial GlobalConf object.') },
    },
    async ({ config }) => {
      if (!allowKick) {
        return errorResult('Write tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.')
      }
      return callVoidOrFail(api.v3.configGlobalSet(config as GlobalConf), 'Global config updated.')
    },
  )

  server.registerTool(
    'mediamtx_config_pathdefaults_get',
    {
      title: 'Get path defaults',
      description: 'Return the default values applied to all paths.',
      annotations: { readOnlyHint: true },
      inputSchema: {},
    },
    async () => callOrFail(api.v3.configPathDefaultsGet()),
  )

  server.registerTool(
    'mediamtx_config_pathdefaults_patch',
    {
      title: 'Patch path defaults',
      description: 'PATCH the path-defaults config. Only included fields are changed.',
      annotations: { destructiveHint: true, idempotentHint: false },
      inputSchema: { defaults: z.record(z.string(), z.any()).describe('Partial PathConf object.') },
    },
    async ({ defaults }) => {
      if (!allowKick) {
        return errorResult('Write tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.')
      }
      return callVoidOrFail(api.v3.configPathDefaultsPatch(defaults as PathConf), 'Path defaults updated.')
    },
  )
}

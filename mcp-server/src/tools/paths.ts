import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { z } from 'zod'

import type { Api, PathConf } from '../mediamtx/generated.js'

import { callOrFail, callVoidOrFail, errorResult } from './util.js'

const paginationSchema = {
  page: z.number().int().min(1).optional(),
  itemsPerPage: z.number().int().min(1).max(1000).optional(),
}

export function registerPathTools(server: McpServer, api: Api<unknown>, allowKick: boolean): void {
  server.registerTool(
    'mediamtx_paths_list',
    {
      title: 'List active paths',
      description: 'List runtime paths (with source, ready state, bytes counters).',
      annotations: { readOnlyHint: true },
      inputSchema: paginationSchema,
    },
    async ({ page, itemsPerPage }) =>
      callOrFail(api.v3.pathsList({ page, itemsPerPage })),
  )

  server.registerTool(
    'mediamtx_paths_get',
    {
      title: 'Get path detail',
      description: 'Return runtime detail for a single path (tracks, readers, source).',
      annotations: { readOnlyHint: true },
      inputSchema: { name: z.string().describe('Path name.') },
    },
    async ({ name }) => callOrFail(api.v3.pathsGet(name)),
  )

  server.registerTool(
    'mediamtx_config_paths_list',
    {
      title: 'List path configurations',
      description: 'List all configured paths (the static configuration, not runtime state).',
      annotations: { readOnlyHint: true },
      inputSchema: paginationSchema,
    },
    async ({ page, itemsPerPage }) =>
      callOrFail(api.v3.configPathsList({ page, itemsPerPage })),
  )

  server.registerTool(
    'mediamtx_config_paths_get',
    {
      title: 'Get path configuration',
      description: 'Return the configuration for a single path.',
      annotations: { readOnlyHint: true },
      inputSchema: { name: z.string() },
    },
    async ({ name }) => callOrFail(api.v3.configPathsGet(name)),
  )

  server.registerTool(
    'mediamtx_config_paths_add',
    {
      title: 'Add path configuration',
      description: 'Create a new path. Errors if the path already exists.',
      annotations: { destructiveHint: true, idempotentHint: false },
      inputSchema: {
        name: z.string(),
        config: z.record(z.string(), z.any()).describe('Full PathConf object.'),
      },
    },
    async ({ name, config }) => {
      if (!allowKick) {
        return errorResult('Write tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.')
      }
      return callVoidOrFail(api.v3.configPathsAdd(name, config as PathConf), `Path "${name}" created.`)
    },
  )

  server.registerTool(
    'mediamtx_config_paths_patch',
    {
      title: 'Patch path configuration',
      description: 'PATCH a path. Only included fields are changed.',
      annotations: { destructiveHint: true, idempotentHint: false },
      inputSchema: {
        name: z.string(),
        config: z.record(z.string(), z.any()).describe('Partial PathConf object.'),
      },
    },
    async ({ name, config }) => {
      if (!allowKick) {
        return errorResult('Write tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.')
      }
      return callVoidOrFail(api.v3.configPathsPatch(name, config as PathConf), `Path "${name}" patched.`)
    },
  )

  server.registerTool(
    'mediamtx_config_paths_replace',
    {
      title: 'Replace path configuration',
      description: 'REPLACE a path entirely. Any field not included is reset to its default.',
      annotations: { destructiveHint: true, idempotentHint: true },
      inputSchema: {
        name: z.string(),
        config: z.record(z.string(), z.any()).describe('Full PathConf object.'),
      },
    },
    async ({ name, config }) => {
      if (!allowKick) {
        return errorResult('Write tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.')
      }
      return callVoidOrFail(api.v3.configPathsReplace(name, config as PathConf), `Path "${name}" replaced.`)
    },
  )

  server.registerTool(
    'mediamtx_config_paths_delete',
    {
      title: 'Delete path configuration',
      description: 'Remove a configured path. Does not affect currently-active paths until they end.',
      annotations: { destructiveHint: true, idempotentHint: true },
      inputSchema: { name: z.string() },
    },
    async ({ name }) => {
      if (!allowKick) {
        return errorResult('Write tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.')
      }
      return callVoidOrFail(api.v3.configPathsDelete(name), `Path "${name}" deleted.`)
    },
  )
}

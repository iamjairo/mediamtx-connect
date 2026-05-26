import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import type { Api } from '../mediamtx/generated.js'

import { z } from 'zod'

import { callOrFail, callVoidOrFail, errorResult } from './util.js'

const paginationSchema = {
  page: z.number().int().min(1).optional(),
  itemsPerPage: z.number().int().min(1).max(1000).optional(),
}

const idSchema = { id: z.string().describe('Session/connection ID.') }

export function registerSessionTools(server: McpServer, api: Api<unknown>, allowKick: boolean): void {
  function kickGate(action: () => Promise<{ status: number }>, successMessage: string) {
    if (!allowKick) {
      return Promise.resolve(errorResult('Kick tools are disabled. Set MEDIAMTX_MCP_ALLOW_KICK=true to enable.'))
    }
    return callVoidOrFail(action(), successMessage)
  }

  // ---- RTSP ----
  server.registerTool('mediamtx_rtsp_conns_list', {
    title: 'List RTSP connections',
    description: 'List active RTSP connections (TCP-level).',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.rtspConnsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_rtsp_conns_get', {
    title: 'Get RTSP connection',
    description: 'Return detail for a single RTSP connection.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.rtspConnsGet(id)))

  server.registerTool('mediamtx_rtsp_sessions_list', {
    title: 'List RTSP sessions',
    description: 'List active RTSP sessions (per-stream, includes transport and bytes).',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.rtspSessionsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_rtsp_sessions_get', {
    title: 'Get RTSP session',
    description: 'Return detail for a single RTSP session.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.rtspSessionsGet(id)))

  server.registerTool('mediamtx_rtsp_sessions_kick', {
    title: 'Kick RTSP session',
    description: 'Disconnect an RTSP session by ID.',
    annotations: { destructiveHint: true, idempotentHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => kickGate(() => api.v3.rtspSessionsKick(id), `RTSP session ${id} kicked.`))

  // ---- RTSPS ----
  server.registerTool('mediamtx_rtsps_conns_list', {
    title: 'List RTSPS connections',
    description: 'List active RTSPS (TLS) connections.',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.rtspsConnsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_rtsps_conns_get', {
    title: 'Get RTSPS connection',
    description: 'Return detail for a single RTSPS connection.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.rtspsConnsGet(id)))

  server.registerTool('mediamtx_rtsps_sessions_list', {
    title: 'List RTSPS sessions',
    description: 'List active RTSPS sessions.',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.rtspsSessionsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_rtsps_sessions_get', {
    title: 'Get RTSPS session',
    description: 'Return detail for a single RTSPS session.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.rtspsSessionsGet(id)))

  server.registerTool('mediamtx_rtsps_sessions_kick', {
    title: 'Kick RTSPS session',
    description: 'Disconnect an RTSPS session by ID.',
    annotations: { destructiveHint: true, idempotentHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => kickGate(() => api.v3.rtspsSessionsKick(id), `RTSPS session ${id} kicked.`))

  // ---- RTMP ----
  server.registerTool('mediamtx_rtmp_conns_list', {
    title: 'List RTMP connections',
    description: 'List active RTMP connections.',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.rtmpConnsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_rtmp_conns_get', {
    title: 'Get RTMP connection',
    description: 'Return detail for a single RTMP connection.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.rtmpConnectionsGet(id)))

  server.registerTool('mediamtx_rtmp_conns_kick', {
    title: 'Kick RTMP connection',
    description: 'Disconnect an RTMP connection by ID.',
    annotations: { destructiveHint: true, idempotentHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => kickGate(() => api.v3.rtmpConnsKick(id), `RTMP conn ${id} kicked.`))

  // ---- RTMPS ----
  server.registerTool('mediamtx_rtmps_conns_list', {
    title: 'List RTMPS connections',
    description: 'List active RTMPS (TLS) connections.',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.rtmpsConnsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_rtmps_conns_get', {
    title: 'Get RTMPS connection',
    description: 'Return detail for a single RTMPS connection.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.rtmpsConnectionsGet(id)))

  server.registerTool('mediamtx_rtmps_conns_kick', {
    title: 'Kick RTMPS connection',
    description: 'Disconnect an RTMPS connection by ID.',
    annotations: { destructiveHint: true, idempotentHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => kickGate(() => api.v3.rtmpsConnsKick(id), `RTMPS conn ${id} kicked.`))

  // ---- SRT ----
  server.registerTool('mediamtx_srt_conns_list', {
    title: 'List SRT connections',
    description: 'List active SRT connections.',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.srtConnsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_srt_conns_get', {
    title: 'Get SRT connection',
    description: 'Return detail for a single SRT connection.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.srtConnsGet(id)))

  server.registerTool('mediamtx_srt_conns_kick', {
    title: 'Kick SRT connection',
    description: 'Disconnect an SRT connection by ID.',
    annotations: { destructiveHint: true, idempotentHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => kickGate(() => api.v3.srtConnsKick(id), `SRT conn ${id} kicked.`))

  // ---- WebRTC ----
  server.registerTool('mediamtx_webrtc_sessions_list', {
    title: 'List WebRTC sessions',
    description: 'List active WebRTC sessions.',
    annotations: { readOnlyHint: true },
    inputSchema: paginationSchema,
  }, async ({ page, itemsPerPage }) => callOrFail(api.v3.webrtcSessionsList({ page, itemsPerPage })))

  server.registerTool('mediamtx_webrtc_sessions_get', {
    title: 'Get WebRTC session',
    description: 'Return detail for a single WebRTC session.',
    annotations: { readOnlyHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => callOrFail(api.v3.webrtcSessionsGet(id)))

  server.registerTool('mediamtx_webrtc_sessions_kick', {
    title: 'Kick WebRTC session',
    description: 'Disconnect a WebRTC session by ID.',
    annotations: { destructiveHint: true, idempotentHint: true },
    inputSchema: idSchema,
  }, async ({ id }) => kickGate(() => api.v3.webrtcSessionsKick(id), `WebRTC session ${id} kicked.`))
}

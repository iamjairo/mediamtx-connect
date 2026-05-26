import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import type { Api } from '../mediamtx/generated.js'

export function registerResources(server: McpServer, api: Api<unknown>): void {
  server.registerResource(
    'global-config',
    'mediamtx://config/global',
    {
      title: 'Global config',
      description: 'Current MediaMTX global configuration.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const resp = await api.v3.configGlobalGet()
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(resp.data, null, 2),
        }],
      }
    },
  )

  server.registerResource(
    'path-defaults',
    'mediamtx://config/pathdefaults',
    {
      title: 'Path defaults',
      description: 'Default values applied to all paths.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const resp = await api.v3.configPathDefaultsGet()
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(resp.data, null, 2),
        }],
      }
    },
  )

  server.registerResource(
    'config-paths',
    'mediamtx://config/paths',
    {
      title: 'Path configurations',
      description: 'All configured paths.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const resp = await api.v3.configPathsList({ itemsPerPage: 1000 })
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(resp.data, null, 2),
        }],
      }
    },
  )

  server.registerResource(
    'paths',
    'mediamtx://paths',
    {
      title: 'Active paths',
      description: 'Live runtime paths with source, ready state and bytes counters.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const resp = await api.v3.pathsList({ itemsPerPage: 1000 })
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(resp.data, null, 2),
        }],
      }
    },
  )

  server.registerResource(
    'hls-muxers',
    'mediamtx://hls/muxers',
    {
      title: 'HLS muxers',
      description: 'Active HLS muxers.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const resp = await api.v3.hlsMuxersList({ itemsPerPage: 1000 })
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(resp.data, null, 2),
        }],
      }
    },
  )

  // One resource per session protocol — useful in Claude Desktop's attach UI.
  const protocols: Array<{ name: string, uri: string, fetch: () => Promise<unknown> }> = [
    { name: 'sessions-rtsp', uri: 'mediamtx://sessions/rtsp', fetch: () => api.v3.rtspSessionsList({ itemsPerPage: 1000 }).then(r => r.data) },
    { name: 'sessions-rtsps', uri: 'mediamtx://sessions/rtsps', fetch: () => api.v3.rtspsSessionsList({ itemsPerPage: 1000 }).then(r => r.data) },
    { name: 'sessions-rtmp', uri: 'mediamtx://sessions/rtmp', fetch: () => api.v3.rtmpConnsList({ itemsPerPage: 1000 }).then(r => r.data) },
    { name: 'sessions-rtmps', uri: 'mediamtx://sessions/rtmps', fetch: () => api.v3.rtmpsConnsList({ itemsPerPage: 1000 }).then(r => r.data) },
    { name: 'sessions-srt', uri: 'mediamtx://sessions/srt', fetch: () => api.v3.srtConnsList({ itemsPerPage: 1000 }).then(r => r.data) },
    { name: 'sessions-webrtc', uri: 'mediamtx://sessions/webrtc', fetch: () => api.v3.webrtcSessionsList({ itemsPerPage: 1000 }).then(r => r.data) },
  ]

  for (const { name, uri, fetch } of protocols) {
    server.registerResource(
      name,
      uri,
      {
        title: name,
        description: `Active ${name.replace('sessions-', '').toUpperCase()} sessions.`,
        mimeType: 'application/json',
      },
      async (uriObj) => {
        const data = await fetch()
        return {
          contents: [{
            uri: uriObj.href,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          }],
        }
      },
    )
  }
}

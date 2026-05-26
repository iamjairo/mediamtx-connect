// Streamable-HTTP transport for the MCP server.
//
// Loaded only when MEDIAMTX_MCP_TRANSPORT=http. Lets the server run as an
// always-on container in deploy/docker-compose.yml, with remote MCP clients
// connecting over HTTP.
//
// Reference: 2026-07-28 MCP spec, "Streamable HTTP" transport. Stateless at
// the protocol layer, so this is a plain Node HTTP server — no sticky
// sessions, no shared session store needed.
//
// NOTE: this is the Phase 4 stub. The streamable-HTTP transport class
// `StreamableHTTPServerTransport` ships in @modelcontextprotocol/sdk
// 1.21+. The wiring below assumes that import path; if it differs in the
// installed SDK version, update the import accordingly. The supervisor /
// tray app and the compose file already drive this code path via env.

import http from 'node:http'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — SDK >=1.21 exports the streamable-HTTP transport here.
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

export interface HttpTransportOptions {
  port: number
  server: McpServer
}

export async function startHttpTransport({ port, server }: HttpTransportOptions): Promise<http.Server> {
  const transport = new StreamableHTTPServerTransport({
    // Stateless mode per the 2026-07-28 spec.
    sessionIdGenerator: undefined,
  })

  await server.connect(transport)

  const httpServer = http.createServer((req, res) => {
    // The transport handles every method/path the MCP HTTP spec defines.
    transport.handleRequest(req, res).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      process.stderr.write(`http transport error: ${message}\n`)
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'text/plain' })
        res.end(message)
      }
    })
  })

  await new Promise<void>((resolve) => {
    httpServer.listen(port, resolve)
  })

  process.stderr.write(`mediamtx-mcp http transport listening on :${port}\n`)
  return httpServer
}

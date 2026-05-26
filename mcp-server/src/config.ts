export interface ServerConfig {
  mediaMtxUrl: string
  username?: string
  password?: string
  allowKick: boolean
  tlsVerify: boolean
}

export function loadConfig(): ServerConfig {
  const url = process.env.MEDIAMTX_URL
  if (!url) {
    throw new Error('MEDIAMTX_URL is required. Example: http://localhost:9997')
  }
  return {
    mediaMtxUrl: url.replace(/\/$/, ''),
    username: process.env.MEDIAMTX_API_USERNAME || undefined,
    password: process.env.MEDIAMTX_API_PASSWORD || undefined,
    allowKick: process.env.MEDIAMTX_MCP_ALLOW_KICK === 'true',
    tlsVerify: process.env.MEDIAMTX_TLS_VERIFY !== 'false',
  }
}

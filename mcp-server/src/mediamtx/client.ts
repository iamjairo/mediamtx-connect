import type { ServerConfig } from '../config.js'

import { Api } from './generated.js'

export function createMediaMtxClient(config: ServerConfig): Api<unknown> {
  const headers: Record<string, string> = {}
  if (config.username) {
    const credentials = `${config.username}:${config.password ?? ''}`
    headers.Authorization = `Basic ${Buffer.from(credentials).toString('base64')}`
  }
  return new Api({
    baseUrl: config.mediaMtxUrl,
    baseApiParams: { headers },
  })
}

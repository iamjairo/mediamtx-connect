import type { Config } from '@prisma/client'

import { getAppConfig } from '@/features/config/client'

import { logger } from '@/shared/utils'
import { Api } from './generated'

import 'server-only'

export interface MediaMtxClientResult {
  api: Api<unknown>
  baseUrl: string
}

function buildAuthHeader(config: Pick<Config, 'mediaMtxApiUsername' | 'mediaMtxApiPassword'>): Record<string, string> {
  if (!config.mediaMtxApiUsername) {
    return {}
  }
  const credentials = `${config.mediaMtxApiUsername}:${config.mediaMtxApiPassword ?? ''}`
  return { Authorization: `Basic ${Buffer.from(credentials).toString('base64')}` }
}

export function buildMediaMtxClient(
  config: Pick<Config, 'mediaMtxUrl' | 'mediaMtxApiPort' | 'mediaMtxApiUsername' | 'mediaMtxApiPassword'>,
): MediaMtxClientResult {
  const baseUrl = `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`
  const api = new Api({
    baseUrl,
    baseApiParams: {
      cache: 'no-store',
      headers: buildAuthHeader(config),
    },
  })
  return { api, baseUrl }
}

export async function getMediaMtxClient(): Promise<MediaMtxClientResult | null> {
  const config = await getAppConfig()
  if (!config) {
    logger.warn('App config missing — cannot build MediaMTX client')
    return null
  }
  return buildMediaMtxClient(config)
}

'use server'

import type { RTSPConnList, RTSPSessionList } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export interface RtspsListResult {
  ok: true
  conns: RTSPConnList
  sessions: RTSPSessionList
}

export async function listRtspsSessions(
  page = 1,
  itemsPerPage = 100,
): Promise<RtspsListResult | { ok: false, error: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    const [conns, sessions] = await Promise.all([
      client.api.v3.rtspsConnsList({ page, itemsPerPage }, { cache: 'no-store' }),
      client.api.v3.rtspsSessionsList({ page, itemsPerPage }, { cache: 'no-store' }),
    ])
    return { ok: true, conns: conns.data, sessions: sessions.data }
  }
  catch (error) {
    logger.error('Failed to list RTSPS sessions', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

'use server'

import type { RTSPConnList, RTSPSessionList } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export interface RtspListResult {
  ok: true
  conns: RTSPConnList
  sessions: RTSPSessionList
}

export interface RtspListError {
  ok: false
  error: string
}

export async function listRtspSessions(page = 1, itemsPerPage = 100): Promise<RtspListResult | RtspListError> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    const [conns, sessions] = await Promise.all([
      client.api.v3.rtspConnsList({ page, itemsPerPage }, { cache: 'no-store' }),
      client.api.v3.rtspSessionsList({ page, itemsPerPage }, { cache: 'no-store' }),
    ])
    return { ok: true, conns: conns.data, sessions: sessions.data }
  }
  catch (error) {
    logger.error('Failed to list RTSP sessions', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

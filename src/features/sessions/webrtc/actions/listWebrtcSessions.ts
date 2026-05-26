'use server'

import type { WebRTCSessionList } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function listWebrtcSessions(
  page = 1,
  itemsPerPage = 100,
): Promise<{ ok: true, sessions: WebRTCSessionList } | { ok: false, error: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    const resp = await client.api.v3.webrtcSessionsList({ page, itemsPerPage }, { cache: 'no-store' })
    return { ok: true, sessions: resp.data }
  }
  catch (error) {
    logger.error('Failed to list WebRTC sessions', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

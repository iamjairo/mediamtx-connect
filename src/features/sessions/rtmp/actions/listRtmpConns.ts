'use server'

import type { RTMPConnList } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function listRtmpConns(
  page = 1,
  itemsPerPage = 100,
): Promise<{ ok: true, conns: RTMPConnList } | { ok: false, error: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    const resp = await client.api.v3.rtmpConnsList({ page, itemsPerPage }, { cache: 'no-store' })
    return { ok: true, conns: resp.data }
  }
  catch (error) {
    logger.error('Failed to list RTMP conns', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

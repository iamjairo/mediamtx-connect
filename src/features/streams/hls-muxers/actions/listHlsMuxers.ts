'use server'

import type { HLSMuxerList } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function listHlsMuxers(
  page = 1,
  itemsPerPage = 100,
): Promise<{ ok: true, muxers: HLSMuxerList } | { ok: false, error: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    const resp = await client.api.v3.hlsMuxersList({ page, itemsPerPage }, { cache: 'no-store' })
    return { ok: true, muxers: resp.data }
  }
  catch (error) {
    logger.error('Failed to list HLS muxers', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

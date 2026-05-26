'use server'

import type { PathConfList } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function listPathConfigs(
  page = 1,
  itemsPerPage = 100,
): Promise<{ ok: true, paths: PathConfList } | { ok: false, error: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    const resp = await client.api.v3.configPathsList({ page, itemsPerPage }, { cache: 'no-store' })
    return { ok: true, paths: resp.data }
  }
  catch (error) {
    logger.error('Failed to list path configs', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

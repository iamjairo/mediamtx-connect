'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { revalidatePath } from 'next/cache'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function updatePathDefaults(
  data: PathConf,
): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.configPathDefaultsPatch(data)
    revalidatePath('/config/path-defaults')
    logger.info('Updated path defaults')
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to update path defaults', error)
    return { ok: false, error: normalizeApiError(error).message }
  }
}

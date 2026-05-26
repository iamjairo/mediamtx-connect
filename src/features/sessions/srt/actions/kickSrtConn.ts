'use server'

import { revalidatePath } from 'next/cache'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function kickSrtConn(id: string): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.srtConnsKick(id)
    revalidatePath('/sessions/srt')
    logger.info('Kicked SRT conn', { id })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to kick SRT conn', { id, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

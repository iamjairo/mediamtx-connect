'use server'

import { revalidatePath } from 'next/cache'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function kickRtmpConn(id: string): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.rtmpConnsKick(id)
    revalidatePath('/sessions/rtmp')
    logger.info('Kicked RTMP conn', { id })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to kick RTMP conn', { id, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

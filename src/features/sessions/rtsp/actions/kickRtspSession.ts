'use server'

import { revalidatePath } from 'next/cache'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function kickRtspSession(id: string): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.rtspSessionsKick(id)
    revalidatePath('/sessions/rtsp')
    logger.info('Kicked RTSP session', { id })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to kick RTSP session', { id, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

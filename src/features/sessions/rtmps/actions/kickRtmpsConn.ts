'use server'

import { revalidatePath } from 'next/cache'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function kickRtmpsConn(id: string): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.rtmpsConnsKick(id)
    revalidatePath('/sessions/rtmps')
    logger.info('Kicked RTMPS conn', { id })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to kick RTMPS conn', { id, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

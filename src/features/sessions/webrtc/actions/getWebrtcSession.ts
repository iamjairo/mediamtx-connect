'use server'

import type { WebRTCSession } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getWebrtcSession(id: string): Promise<WebRTCSession | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.webrtcSessionsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get WebRTC session', { id, error })
    return null
  }
}

'use server'

import type { RTMPConn } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getRtmpConn(id: string): Promise<RTMPConn | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.rtmpConnectionsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get RTMP conn', { id, error })
    return null
  }
}

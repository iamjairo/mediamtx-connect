'use server'

import type { RTSPConn, RTSPSession } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getRtspConn(id: string): Promise<RTSPConn | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.rtspConnsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get RTSP conn', { id, error })
    return null
  }
}

export async function getRtspSession(id: string): Promise<RTSPSession | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.rtspSessionsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get RTSP session', { id, error })
    return null
  }
}

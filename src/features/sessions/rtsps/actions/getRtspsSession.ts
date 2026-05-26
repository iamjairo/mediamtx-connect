'use server'

import type { RTSPConn, RTSPSession } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getRtspsConn(id: string): Promise<RTSPConn | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.rtspsConnsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get RTSPS conn', { id, error })
    return null
  }
}

export async function getRtspsSession(id: string): Promise<RTSPSession | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.rtspsSessionsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get RTSPS session', { id, error })
    return null
  }
}

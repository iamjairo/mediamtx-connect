'use server'

import type { SRTConn } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getSrtConn(id: string): Promise<SRTConn | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.srtConnsGet(id, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get SRT conn', { id, error })
    return null
  }
}

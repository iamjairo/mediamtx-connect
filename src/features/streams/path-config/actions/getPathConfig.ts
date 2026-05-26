'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getPathConfig(name: string): Promise<PathConf | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.configPathsGet(name, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get path config', { name, error })
    return null
  }
}

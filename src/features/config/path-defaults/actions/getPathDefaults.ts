'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getPathDefaults(): Promise<PathConf | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.configPathDefaultsGet({ cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get path defaults', error)
    return null
  }
}

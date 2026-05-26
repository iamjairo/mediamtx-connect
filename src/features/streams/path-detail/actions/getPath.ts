'use server'

import type { Path } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getPath(name: string): Promise<Path | null> {
  const client = await getMediaMtxClient()
  if (!client) {
    return null
  }
  try {
    const resp = await client.api.v3.pathsGet(name, { cache: 'no-store' })
    return resp.data
  }
  catch (error) {
    logger.error('Failed to get path', { name, error })
    return null
  }
}

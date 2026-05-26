'use server'

import type { GlobalConf } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function getGlobalConfig(): Promise<GlobalConf | undefined> {
  const client = await getMediaMtxClient()
  if (!client) {
    return undefined
  }

  try {
    const mediaMtxConfig = await client.api.v3.configGlobalGet({ cache: 'no-store' })
    return mediaMtxConfig?.data
  }
  catch {
    logger.error(`Error reaching MediaMTX at: ${client.baseUrl}`)
    return undefined
  }
}

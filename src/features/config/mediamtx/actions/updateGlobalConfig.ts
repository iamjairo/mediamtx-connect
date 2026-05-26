'use server'

import type { GlobalConf } from '@/lib/MediaMTX/generated'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { logger } from '@/shared/utils'

export async function updateGlobalConfig({
  globalConfig,
}: {
  globalConfig: GlobalConf
}): Promise<boolean> {
  const client = await getMediaMtxClient()
  if (!client) {
    return false
  }
  logger.info('Updating Global Config')

  try {
    const resp = await client.api.v3.configGlobalSet(globalConfig)
    if (resp.status !== 200) {
      throw new Error(`Error setting global config: ${resp.status}`)
    }
    logger.debug('Global config updated', { status: resp.status })
  }
  catch (error) {
    logger.error('Failed to update global config', error)
    return false
  }
  return true
}

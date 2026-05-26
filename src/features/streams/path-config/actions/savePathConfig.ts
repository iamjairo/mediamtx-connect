'use server'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { revalidatePath } from 'next/cache'

import { getMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'
import { logger } from '@/shared/utils'

export async function createPathConfig(
  name: string,
  data: PathConf,
): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.configPathsAdd(name, data)
    revalidatePath('/streams/paths')
    logger.info('Created path config', { name })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to create path config', { name, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

export async function patchPathConfig(
  name: string,
  data: PathConf,
): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.configPathsPatch(name, data)
    revalidatePath('/streams/paths')
    revalidatePath(`/streams/paths/${name}`)
    logger.info('Patched path config', { name })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to patch path config', { name, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

export async function replacePathConfig(
  name: string,
  data: PathConf,
): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.configPathsReplace(name, data)
    revalidatePath('/streams/paths')
    revalidatePath(`/streams/paths/${name}`)
    logger.info('Replaced path config', { name })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to replace path config', { name, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

export async function deletePathConfig(
  name: string,
): Promise<{ ok: boolean, error?: string }> {
  const client = await getMediaMtxClient()
  if (!client) {
    return { ok: false, error: 'App config not initialised.' }
  }
  try {
    await client.api.v3.configPathsDelete(name)
    revalidatePath('/streams/paths')
    logger.info('Deleted path config', { name })
    return { ok: true }
  }
  catch (error) {
    logger.error('Failed to delete path config', { name, error })
    return { ok: false, error: normalizeApiError(error).message }
  }
}

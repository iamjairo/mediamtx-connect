'use server'

import { buildMediaMtxClient } from '@/lib/MediaMTX/client'
import { normalizeApiError } from '@/lib/MediaMTX/errors'

export type ConnectionTestResult
  = | { ok: true, latencyMs: number }
    | { ok: false, error: string }

export async function testMediaMtxConnection(input: {
  mediaMtxUrl: string
  mediaMtxApiPort: number
  mediaMtxApiUsername: string | null
  mediaMtxApiPassword: string | null
}): Promise<ConnectionTestResult> {
  const { api } = buildMediaMtxClient(input)
  const start = Date.now()
  try {
    const resp = await api.v3.configGlobalGet({ cache: 'no-store' })
    if (resp.status >= 400) {
      return { ok: false, error: `HTTP ${resp.status}` }
    }
    return { ok: true, latencyMs: Date.now() - start }
  }
  catch (error) {
    return { ok: false, error: normalizeApiError(error).message }
  }
}

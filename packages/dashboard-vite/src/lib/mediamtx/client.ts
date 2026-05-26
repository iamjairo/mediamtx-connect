import { Api } from './generated'

export interface MediaMtxClientOptions {
  baseUrl: string
  username?: string
  password?: string
  fetchOverride?: typeof fetch
}

export function createMediaMtxClient(options: MediaMtxClientOptions): Api<unknown> {
  const headers: Record<string, string> = {}
  if (options.username) {
    const credentials = `${options.username}:${options.password ?? ''}`
    headers.Authorization = `Basic ${btoa(credentials)}`
  }

  return new Api({
    baseUrl: options.baseUrl.replace(/\/$/, ''),
    baseApiParams: { headers },
    customFetch: options.fetchOverride,
  })
}

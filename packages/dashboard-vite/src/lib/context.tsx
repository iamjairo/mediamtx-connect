import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'

import type { Api } from './mediamtx/generated'
import type { MediaMtxClientOptions } from './mediamtx/client'

import { createMediaMtxClient } from './mediamtx/client'

export interface MediaMtxContextValue {
  api: Api<unknown>
  baseUrl: string
  pollIntervalMs: number
  allowDestructive: boolean
  setPollIntervalMs: (ms: number) => void
}

const MediaMtxContext = createContext<MediaMtxContextValue | null>(null)

export interface MediaMtxProviderProps {
  /** Base URL of the MediaMTX HTTP API (e.g. `http://localhost:9997`). */
  baseUrl: string
  username?: string
  password?: string
  /** Polling interval in ms for live data. Default 5000. */
  pollIntervalMs?: number
  /**
   * Set to false to hide every destructive control (kick, delete, replace, patch).
   * Useful for view-only embeds. Default true.
   */
  allowDestructive?: boolean
  /** Override the global fetch (e.g. when the host wraps requests with auth). */
  fetchOverride?: typeof fetch
  children: React.ReactNode
  /** Inject a host-owned QueryClient. If omitted, a local one is created. */
  queryClient?: QueryClient
}

export function MediaMtxProvider({
  baseUrl,
  username,
  password,
  pollIntervalMs: initialPoll = 5000,
  allowDestructive = true,
  fetchOverride,
  queryClient: hostQueryClient,
  children,
}: MediaMtxProviderProps) {
  const [pollIntervalMs, setPollIntervalMs] = useState(initialPoll)

  const queryClient = useMemo(
    () => hostQueryClient ?? new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000,
          refetchOnWindowFocus: false,
        },
      },
    }),
    [hostQueryClient],
  )

  const value = useMemo<MediaMtxContextValue>(() => {
    const opts: MediaMtxClientOptions = { baseUrl, username, password, fetchOverride }
    return {
      api: createMediaMtxClient(opts),
      baseUrl,
      pollIntervalMs,
      allowDestructive,
      setPollIntervalMs,
    }
  }, [baseUrl, username, password, fetchOverride, pollIntervalMs, allowDestructive])

  return (
    <QueryClientProvider client={queryClient}>
      <MediaMtxContext.Provider value={value}>
        {children}
      </MediaMtxContext.Provider>
    </QueryClientProvider>
  )
}

export function useMediaMtx(): MediaMtxContextValue {
  const ctx = useContext(MediaMtxContext)
  if (!ctx) {
    throw new Error('useMediaMtx must be used within a MediaMtxProvider')
  }
  return ctx
}

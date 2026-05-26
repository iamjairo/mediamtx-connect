import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useMediaMtx } from '../lib/context'
import { useGlobalConfig } from '../hooks/queries'
import { Button } from './Button'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { baseUrl } = useMediaMtx()
  const { data, isError } = useGlobalConfig()
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const connected = !!data && !isError

  return (
    <div className="flex items-start justify-between gap-4 pb-6">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-1.5 text-xs"
          title={baseUrl}
        >
          {connected
            ? (
                <>
                  <span className="relative inline-flex h-2 w-2 text-[color:var(--color-success)] mmtx-pulse-dot">
                    <span className="absolute inset-0 rounded-full bg-[color:var(--color-success)]" />
                  </span>
                  <Wifi className="h-3.5 w-3.5 text-[color:var(--color-success)]" />
                </>
              )
            : (
                <WifiOff className="h-3.5 w-3.5 text-[color:var(--color-destructive)]" />
              )}
          <span className="text-[color:var(--color-muted-foreground)]">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        <div className="hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-3 py-1.5 text-xs text-[color:var(--color-muted-foreground)] sm:block">
          {now.toLocaleTimeString()}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => queryClient.invalidateQueries()}
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {actions}
      </div>
    </div>
  )
}

import { Activity, Radio, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { usePaths } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'

export function StreamsModule() {
  const { data, isLoading } = usePaths({ itemsPerPage: 100 })
  const items = data?.items ?? []

  return (
    <>
      <TopBar
        title="Streams"
        subtitle="Every active path on the MediaMTX server."
      />

      {isLoading && (
        <div className="mmtx-card p-12 text-center text-sm text-[color:var(--color-muted-foreground)]">
          Loading…
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <Card className="text-center">
          <Tv className="mx-auto mb-2 h-8 w-8 text-[color:var(--color-muted-foreground)]" />
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            No active streams.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((path) => {
          const ready = !!path.ready
          const readers = path.readers?.length ?? 0
          return (
            <Card key={path.name} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`flex h-2 w-2 rounded-full ${
                        ready
                          ? 'bg-[color:var(--color-success)] shadow-[0_0_8px_var(--color-success)]'
                          : 'bg-[color:var(--color-muted)]'
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                      {ready ? 'Ready' : 'Idle'}
                    </span>
                  </div>
                  <Link
                    to={`/streams/${encodeURIComponent(path.name ?? '')}`}
                    className="block truncate text-base font-semibold hover:underline"
                  >
                    {path.name}
                  </Link>
                  {path.source && (
                    <p className="mt-0.5 truncate text-xs text-[color:var(--color-muted-foreground)]">
                      <code>{path.source.type}</code>
                    </p>
                  )}
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-hue-blue)] text-[color:var(--color-background)]">
                  <Tv className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-[color:var(--color-border)] pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                    Readers
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
                    <Activity className="h-3 w-3" />
                    {readers}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                    Sent
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{formatBytes(path.bytesSent)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                    Recv
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{formatBytes(path.bytesReceived)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[color:var(--color-muted-foreground)]">
                <span>{path.tracks?.length ?? 0} tracks</span>
                <span>{ready ? `since ${formatRelative(path.readyTime)}` : '—'}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
        <Radio className="h-3.5 w-3.5" />
        Updates live every few seconds.
      </p>
    </>
  )
}

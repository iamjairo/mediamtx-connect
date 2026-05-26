import { ArrowLeft, Radio } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Card, CardTitle } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { usePath } from '../../hooks/queries'
import { formatBytes, formatRelative, formatTimestamp } from '../../lib/utils'

export function StreamDetailModule() {
  const { name } = useParams<{ name: string }>()
  const decoded = name ? decodeURIComponent(name) : ''
  const { data, isLoading } = usePath(decoded)

  return (
    <>
      <TopBar title={decoded} subtitle="Live runtime detail for this path." />

      <Link
        to="/streams"
        className="mb-4 inline-flex items-center gap-1 text-xs text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to streams
      </Link>

      {isLoading && (
        <Card className="text-sm text-[color:var(--color-muted-foreground)]">Loading…</Card>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle className="mb-3">Status</CardTitle>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-[color:var(--color-muted-foreground)]">Ready</span>
              <span>
                {data.ready
                  ? (
                      <span className="inline-flex items-center gap-1 text-[color:var(--color-success)]">
                        ● Yes
                      </span>
                    )
                  : 'No'}
              </span>
              <span className="text-[color:var(--color-muted-foreground)]">Ready since</span>
              <span>{formatRelative(data.readyTime)}</span>
              <span className="text-[color:var(--color-muted-foreground)]">Config name</span>
              <span>
                <code>{data.confName ?? '—'}</code>
              </span>
              <span className="text-[color:var(--color-muted-foreground)]">Source</span>
              <span>
                {data.source
                  ? (
                      <>
                        <code>{data.source.type}</code>{' '}
                        <span className="text-[color:var(--color-muted-foreground)]">
                          {data.source.id}
                        </span>
                      </>
                    )
                  : '—'}
              </span>
              <span className="text-[color:var(--color-muted-foreground)]">Bytes received</span>
              <span>{formatBytes(data.bytesReceived)}</span>
              <span className="text-[color:var(--color-muted-foreground)]">Bytes sent</span>
              <span>{formatBytes(data.bytesSent)}</span>
              <span className="text-[color:var(--color-muted-foreground)]">Last update</span>
              <span>{formatTimestamp(new Date().toISOString())}</span>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">Tracks</CardTitle>
            {data.tracks && data.tracks.length > 0
              ? (
                  <ul className="flex flex-col gap-1 text-sm">
                    {data.tracks.map(track => (
                      <li
                        key={track}
                        className="rounded-lg bg-[color:var(--color-surface-2)] px-2 py-1.5"
                      >
                        <code>{track}</code>
                      </li>
                    ))}
                  </ul>
                )
              : (
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">No tracks.</p>
                )}
          </Card>

          <Card className="lg:col-span-3">
            <CardTitle className="mb-3 flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Readers
            </CardTitle>
            {data.readers && data.readers.length > 0
              ? (
                  <ul className="flex flex-col gap-1.5 text-sm">
                    {data.readers.map(reader => (
                      <li
                        key={`${reader.type}-${reader.id}`}
                        className="flex items-center justify-between rounded-lg bg-[color:var(--color-surface-2)] px-3 py-2"
                      >
                        <span className="text-[color:var(--color-muted-foreground)]">
                          {reader.type}
                        </span>
                        <code className="text-xs">{reader.id}</code>
                      </li>
                    ))}
                  </ul>
                )
              : (
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">
                    No active readers.
                  </p>
                )}
          </Card>
        </div>
      )}
    </>
  )
}

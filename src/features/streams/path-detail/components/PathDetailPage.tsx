import { notFound } from 'next/navigation'

import { formatBytes, formatTimestamp } from '@/features/sessions/shared'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'

import { getPath } from '../actions/getPath'

interface Props {
  name: string
}

export async function PathDetailPage({ name }: Props) {
  const path = await getPath(name)
  if (!path) {
    notFound()
  }

  const readers = path.readers ?? []
  const tracks = path.tracks ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{path.name}</h2>
          <p className="text-sm text-muted-foreground">
            Config name:
            {' '}
            <code>{path.confName ?? '—'}</code>
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Ready</span>
            <span>{path.ready ? '✓' : '✗'}</span>
            <span className="text-muted-foreground">Since</span>
            <span>{formatTimestamp(path.readyTime)}</span>
            <span className="text-muted-foreground">Bytes received</span>
            <span>{formatBytes(path.bytesReceived)}</span>
            <span className="text-muted-foreground">Bytes sent</span>
            <span>{formatBytes(path.bytesSent)}</span>
            <span className="text-muted-foreground">Source</span>
            <span>
              {path.source
                ? (
                    <>
                      <code className="text-xs">{path.source.type}</code>
                      {' '}
                      <span className="text-muted-foreground">{path.source.id}</span>
                    </>
                  )
                : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Tracks</h3>
        </CardHeader>
        <CardContent>
          {tracks.length === 0
            ? <p className="text-muted-foreground text-sm">No tracks reported.</p>
            : (
                <ul className="space-y-1 text-sm">
                  {tracks.map(track => (
                    <li key={track}><code>{track}</code></li>
                  ))}
                </ul>
              )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Readers</h3>
        </CardHeader>
        <CardContent>
          {readers.length === 0
            ? <p className="text-muted-foreground text-sm">No active readers.</p>
            : (
                <ul className="space-y-1 text-sm">
                  {readers.map(reader => (
                    <li key={`${reader.type}-${reader.id}`} className="flex gap-2">
                      <span className="text-muted-foreground">{reader.type}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <code className="text-xs">{reader.id}</code>
                    </li>
                  ))}
                </ul>
              )}
        </CardContent>
      </Card>
    </div>
  )
}

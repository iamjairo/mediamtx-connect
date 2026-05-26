import type { RTSPConn, RTSPSession } from '@/lib/MediaMTX/generated'
import type { Column } from '@/shared/components/data'

import { PagedTable } from '@/shared/components/data'

import { ConnectionError, formatBytes, formatTimestamp, KickButton } from '../../shared'
import { kickRtspSession } from '../actions/kickRtspSession'
import { listRtspSessions } from '../actions/listRtspSessions'

interface Props {
  page: number
}

export async function RtspSessionsPage({ page }: Props) {
  const result = await listRtspSessions(page)
  if (!result.ok) {
    return <ConnectionError message={result.error} />
  }

  const sessions = result.sessions.items ?? []
  const conns = result.conns.items ?? []

  const sessionColumns: Column<RTSPSession>[] = [
    { header: 'ID', cell: row => <code className="text-xs">{row.id}</code> },
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'State', cell: row => row.state ?? '—' },
    { header: 'Transport', cell: row => row.transport ?? '—' },
    { header: 'Remote', cell: row => row.remoteAddr ?? '—' },
    { header: 'Created', cell: row => formatTimestamp(row.created) },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived) },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent) },
  ]

  const connColumns: Column<RTSPConn>[] = [
    { header: 'ID', cell: row => <code className="text-xs">{row.id}</code> },
    { header: 'Remote', cell: row => row.remoteAddr ?? '—' },
    { header: 'Created', cell: row => formatTimestamp(row.created) },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived) },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent) },
  ]

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Sessions</h3>
        <PagedTable
          rows={sessions}
          columns={sessionColumns}
          page={page}
          pageCount={result.sessions.pageCount}
          rowKey={row => row.id ?? ''}
          rowActions={row =>
            row.id ? <KickButton id={row.id} action={kickRtspSession} /> : null}
          emptyMessage="No active RTSP sessions."
        />
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Connections</h3>
        <PagedTable
          rows={conns}
          columns={connColumns}
          page={page}
          pageCount={result.conns.pageCount}
          rowKey={row => row.id ?? ''}
          emptyMessage="No active RTSP connections."
        />
      </section>
    </div>
  )
}

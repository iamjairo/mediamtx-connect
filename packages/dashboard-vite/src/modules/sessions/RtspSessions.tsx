import { CardTitle } from '../../components/Card'
import { DataTable, type Column } from '../../components/DataTable'
import { KickButton } from '../../components/KickButton'
import { useKickRtspSession, useRtspConns, useRtspSessions } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'
import type { RTSPConn, RTSPSession } from '../../lib/mediamtx/generated'

export function RtspSessions() {
  const sessions = useRtspSessions({ itemsPerPage: 100 })
  const conns = useRtspConns({ itemsPerPage: 100 })
  const kick = useKickRtspSession()

  const sessionColumns: Column<RTSPSession>[] = [
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'State', cell: row => row.state ?? '—' },
    { header: 'Transport', cell: row => row.transport ?? '—' },
    { header: 'Remote', cell: row => <code className="text-xs">{row.remoteAddr}</code> },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived), align: 'right' },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent), align: 'right' },
    { header: 'Created', cell: row => formatRelative(row.created), align: 'right' },
  ]

  const connColumns: Column<RTSPConn>[] = [
    { header: 'ID', cell: row => <code className="text-xs">{row.id?.slice(0, 8)}</code> },
    { header: 'Remote', cell: row => <code className="text-xs">{row.remoteAddr}</code> },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived), align: 'right' },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent), align: 'right' },
    { header: 'Created', cell: row => formatRelative(row.created), align: 'right' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section>
        <CardTitle className="mb-3">Sessions</CardTitle>
        <DataTable
          rows={sessions.data?.items ?? []}
          columns={sessionColumns}
          rowKey={row => row.id ?? ''}
          isLoading={sessions.isLoading}
          rowActions={row =>
            row.id
              ? (
                  <KickButton
                    id={row.id}
                    label={`RTSP session ${row.id.slice(0, 8)}`}
                    onKick={id => kick.mutateAsync(id)}
                  />
                )
              : null}
          emptyMessage="No active RTSP sessions."
        />
      </section>

      <section>
        <CardTitle className="mb-3">Connections</CardTitle>
        <DataTable
          rows={conns.data?.items ?? []}
          columns={connColumns}
          rowKey={row => row.id ?? ''}
          isLoading={conns.isLoading}
          emptyMessage="No active RTSP connections."
        />
      </section>
    </div>
  )
}

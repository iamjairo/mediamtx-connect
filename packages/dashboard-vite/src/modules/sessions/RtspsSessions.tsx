import { CardTitle } from '../../components/Card'
import { DataTable, type Column } from '../../components/DataTable'
import { KickButton } from '../../components/KickButton'
import { useKickRtspsSession, useRtspsConns, useRtspsSessions } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'
import type { RTSPConn, RTSPSession } from '../../lib/mediamtx/generated'

export function RtspsSessions() {
  const sessions = useRtspsSessions({ itemsPerPage: 100 })
  const conns = useRtspsConns({ itemsPerPage: 100 })
  const kick = useKickRtspsSession()

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
                    label={`RTSPS session ${row.id.slice(0, 8)}`}
                    onKick={id => kick.mutateAsync(id)}
                  />
                )
              : null}
          emptyMessage="No active RTSPS sessions."
        />
      </section>

      <section>
        <CardTitle className="mb-3">Connections</CardTitle>
        <DataTable
          rows={conns.data?.items ?? []}
          columns={connColumns}
          rowKey={row => row.id ?? ''}
          isLoading={conns.isLoading}
          emptyMessage="No active RTSPS connections."
        />
      </section>
    </div>
  )
}

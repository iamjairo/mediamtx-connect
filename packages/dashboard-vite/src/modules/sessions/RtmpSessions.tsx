import { DataTable, type Column } from '../../components/DataTable'
import { KickButton } from '../../components/KickButton'
import { useKickRtmpConn, useRtmpConns } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'
import type { RTMPConn } from '../../lib/mediamtx/generated'

export function RtmpSessions() {
  const conns = useRtmpConns({ itemsPerPage: 100 })
  const kick = useKickRtmpConn()

  const columns: Column<RTMPConn>[] = [
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'State', cell: row => row.state ?? '—' },
    { header: 'Remote', cell: row => <code className="text-xs">{row.remoteAddr}</code> },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived), align: 'right' },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent), align: 'right' },
    { header: 'Created', cell: row => formatRelative(row.created), align: 'right' },
  ]

  return (
    <DataTable
      rows={conns.data?.items ?? []}
      columns={columns}
      rowKey={row => row.id ?? ''}
      isLoading={conns.isLoading}
      rowActions={row =>
        row.id
          ? (
              <KickButton
                id={row.id}
                label={`RTMP conn ${row.id.slice(0, 8)}`}
                onKick={id => kick.mutateAsync(id)}
              />
            )
          : null}
      emptyMessage="No active RTMP connections."
    />
  )
}

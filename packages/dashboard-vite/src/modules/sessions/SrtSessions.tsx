import { DataTable, type Column } from '../../components/DataTable'
import { KickButton } from '../../components/KickButton'
import { useKickSrtConn, useSrtConns } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'
import type { SRTConn } from '../../lib/mediamtx/generated'

export function SrtSessions() {
  const conns = useSrtConns({ itemsPerPage: 100 })
  const kick = useKickSrtConn()

  const columns: Column<SRTConn>[] = [
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
                label={`SRT conn ${row.id.slice(0, 8)}`}
                onKick={id => kick.mutateAsync(id)}
              />
            )
          : null}
      emptyMessage="No active SRT connections."
    />
  )
}

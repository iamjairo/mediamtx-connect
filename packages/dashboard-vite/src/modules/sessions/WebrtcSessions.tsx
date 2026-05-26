import { DataTable, type Column } from '../../components/DataTable'
import { KickButton } from '../../components/KickButton'
import { useKickWebrtcSession, useWebrtcSessions } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'
import type { WebRTCSession } from '../../lib/mediamtx/generated'

export function WebrtcSessions() {
  const sessions = useWebrtcSessions({ itemsPerPage: 100 })
  const kick = useKickWebrtcSession()

  const columns: Column<WebRTCSession>[] = [
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'State', cell: row => row.state ?? '—' },
    {
      header: 'PC',
      cell: row =>
        row.peerConnectionEstablished
          ? (
              <span className="text-[color:var(--color-success)]">✓</span>
            )
          : (
              <span className="text-[color:var(--color-muted-foreground)]">—</span>
            ),
      align: 'center',
    },
    { header: 'Remote', cell: row => <code className="text-xs">{row.remoteAddr}</code> },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived), align: 'right' },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent), align: 'right' },
    { header: 'Created', cell: row => formatRelative(row.created), align: 'right' },
  ]

  return (
    <DataTable
      rows={sessions.data?.items ?? []}
      columns={columns}
      rowKey={row => row.id ?? ''}
      isLoading={sessions.isLoading}
      rowActions={row =>
        row.id
          ? (
              <KickButton
                id={row.id}
                label={`WebRTC session ${row.id.slice(0, 8)}`}
                onKick={id => kick.mutateAsync(id)}
              />
            )
          : null}
      emptyMessage="No active WebRTC sessions."
    />
  )
}

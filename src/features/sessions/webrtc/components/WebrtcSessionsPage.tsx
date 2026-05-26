import type { WebRTCSession } from '@/lib/MediaMTX/generated'
import type { Column } from '@/shared/components/data'

import { PagedTable } from '@/shared/components/data'

import { ConnectionError, formatBytes, formatTimestamp, KickButton } from '../../shared'
import { kickWebrtcSession } from '../actions/kickWebrtcSession'
import { listWebrtcSessions } from '../actions/listWebrtcSessions'

interface Props {
  page: number
}

export async function WebrtcSessionsPage({ page }: Props) {
  const result = await listWebrtcSessions(page)
  if (!result.ok) {
    return <ConnectionError message={result.error} />
  }

  const sessions = result.sessions.items ?? []

  const columns: Column<WebRTCSession>[] = [
    { header: 'ID', cell: row => <code className="text-xs">{row.id}</code> },
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'State', cell: row => row.state ?? '—' },
    {
      header: 'PC',
      cell: row => row.peerConnectionEstablished ? '✓' : '—',
    },
    { header: 'Remote', cell: row => row.remoteAddr ?? '—' },
    { header: 'Created', cell: row => formatTimestamp(row.created) },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived) },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent) },
  ]

  return (
    <PagedTable
      rows={sessions}
      columns={columns}
      page={page}
      pageCount={result.sessions.pageCount}
      rowKey={row => row.id ?? ''}
      rowActions={row =>
        row.id ? <KickButton id={row.id} action={kickWebrtcSession} /> : null}
      emptyMessage="No active WebRTC sessions."
    />
  )
}

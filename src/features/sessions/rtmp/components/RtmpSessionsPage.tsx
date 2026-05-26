import type { RTMPConn } from '@/lib/MediaMTX/generated'
import type { Column } from '@/shared/components/data'

import { PagedTable } from '@/shared/components/data'

import { ConnectionError, formatBytes, formatTimestamp, KickButton } from '../../shared'
import { kickRtmpConn } from '../actions/kickRtmpConn'
import { listRtmpConns } from '../actions/listRtmpConns'

interface Props {
  page: number
}

export async function RtmpSessionsPage({ page }: Props) {
  const result = await listRtmpConns(page)
  if (!result.ok) {
    return <ConnectionError message={result.error} />
  }

  const conns = result.conns.items ?? []

  const columns: Column<RTMPConn>[] = [
    { header: 'ID', cell: row => <code className="text-xs">{row.id}</code> },
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'State', cell: row => row.state ?? '—' },
    { header: 'Remote', cell: row => row.remoteAddr ?? '—' },
    { header: 'Created', cell: row => formatTimestamp(row.created) },
    { header: 'Recv', cell: row => formatBytes(row.bytesReceived) },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent) },
  ]

  return (
    <PagedTable
      rows={conns}
      columns={columns}
      page={page}
      pageCount={result.conns.pageCount}
      rowKey={row => row.id ?? ''}
      rowActions={row =>
        row.id ? <KickButton id={row.id} action={kickRtmpConn} /> : null}
      emptyMessage="No active RTMP connections."
    />
  )
}

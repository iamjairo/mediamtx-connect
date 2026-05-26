import type { SRTConn } from '@/lib/MediaMTX/generated'
import type { Column } from '@/shared/components/data'

import { PagedTable } from '@/shared/components/data'

import { ConnectionError, formatBytes, formatTimestamp, KickButton } from '../../shared'
import { kickSrtConn } from '../actions/kickSrtConn'
import { listSrtConns } from '../actions/listSrtConns'

interface Props {
  page: number
}

export async function SrtSessionsPage({ page }: Props) {
  const result = await listSrtConns(page)
  if (!result.ok) {
    return <ConnectionError message={result.error} />
  }

  const conns = result.conns.items ?? []

  const columns: Column<SRTConn>[] = [
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
        row.id ? <KickButton id={row.id} action={kickSrtConn} /> : null}
      emptyMessage="No active SRT connections."
    />
  )
}

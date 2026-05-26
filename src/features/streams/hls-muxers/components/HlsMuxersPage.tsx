import type { HLSMuxer } from '@/lib/MediaMTX/generated'
import type { Column } from '@/shared/components/data'

import { ConnectionError, formatBytes, formatTimestamp } from '@/features/sessions/shared'
import { PagedTable } from '@/shared/components/data'

import { listHlsMuxers } from '../actions/listHlsMuxers'

interface Props {
  page: number
}

export async function HlsMuxersPage({ page }: Props) {
  const result = await listHlsMuxers(page)
  if (!result.ok) {
    return <ConnectionError message={result.error} />
  }

  const muxers = result.muxers.items ?? []

  const columns: Column<HLSMuxer>[] = [
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'Created', cell: row => formatTimestamp(row.created) },
    { header: 'Last request', cell: row => formatTimestamp(row.lastRequest) },
    { header: 'Bytes sent', cell: row => formatBytes(row.bytesSent) },
  ]

  return (
    <PagedTable
      rows={muxers}
      columns={columns}
      page={page}
      pageCount={result.muxers.pageCount}
      rowKey={row => row.path ?? ''}
      emptyMessage="No active HLS muxers."
    />
  )
}

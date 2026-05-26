import { DataTable, type Column } from '../../components/DataTable'
import { TopBar } from '../../components/TopBar'
import { useHlsMuxers } from '../../hooks/queries'
import { formatBytes, formatRelative } from '../../lib/utils'
import type { HLSMuxer } from '../../lib/mediamtx/generated'

export function MuxersModule() {
  const { data, isLoading } = useHlsMuxers({ itemsPerPage: 100 })

  const columns: Column<HLSMuxer>[] = [
    { header: 'Path', cell: row => row.path ?? '—' },
    { header: 'Created', cell: row => formatRelative(row.created) },
    { header: 'Last request', cell: row => formatRelative(row.lastRequest) },
    { header: 'Sent', cell: row => formatBytes(row.bytesSent), align: 'right' },
  ]

  return (
    <>
      <TopBar
        title="HLS Muxers"
        subtitle="Active HLS output muxers and per-muxer request stats."
      />
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        rowKey={row => row.path ?? ''}
        isLoading={isLoading}
        emptyMessage="No active HLS muxers."
      />
    </>
  )
}

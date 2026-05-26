import { Plus, Trash } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../components/Button'
import { DataTable, type Column } from '../../components/DataTable'
import { TopBar } from '../../components/TopBar'
import { useDeletePathConfig, usePathConfigs } from '../../hooks/queries'
import { useMediaMtx } from '../../lib/context'
import type { PathConf } from '../../lib/mediamtx/generated'

export function PathsModule() {
  const { allowDestructive } = useMediaMtx()
  const { data, isLoading } = usePathConfigs({ itemsPerPage: 100 })
  const del = useDeletePathConfig()

  const columns: Column<PathConf>[] = [
    {
      header: 'Name',
      cell: row =>
        row.name
          ? (
              <Link
                to={`/paths/${encodeURIComponent(row.name)}`}
                className="font-medium hover:underline"
              >
                {row.name}
              </Link>
            )
          : '—',
    },
    {
      header: 'Source',
      cell: row =>
        row.source
          ? <code className="text-xs">{row.source}</code>
          : <span className="text-[color:var(--color-muted-foreground)]">publisher</span>,
    },
    {
      header: 'On-demand',
      cell: row => (row.sourceOnDemand ? '✓' : '—'),
      align: 'center',
    },
    {
      header: 'Record',
      cell: row => (row.record ? '✓' : '—'),
      align: 'center',
    },
    {
      header: 'Max readers',
      cell: row => row.maxReaders ?? '∞',
      align: 'right',
    },
  ]

  return (
    <>
      <TopBar
        title="Paths"
        subtitle="MediaMTX path configuration — sources, recording, hooks, access control."
        actions={
          <Button asChild variant="primary" size="sm">
            <Link to="/paths/new">
              <Plus className="h-4 w-4" />
              New path
            </Link>
          </Button>
        }
      />

      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        rowKey={row => row.name ?? ''}
        isLoading={isLoading}
        rowActions={row =>
          allowDestructive && row.name
            ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    if (window.confirm(`Delete path "${row.name}"?`)) {
                      del.mutate(row.name!)
                    }
                  }}
                >
                  <Trash className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )
            : null}
        emptyMessage="No paths configured yet — click 'New path' to add one."
      />
    </>
  )
}

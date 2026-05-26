import type { PathConf } from '@/lib/MediaMTX/generated'
import type { Column } from '@/shared/components/data'

import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ConnectionError } from '@/features/sessions/shared'
import { PagedTable } from '@/shared/components/data'
import { Button } from '@/shared/components/ui/button'

import { listPathConfigs } from '../actions/listPathConfigs'
import { DeletePathButton } from './DeletePathButton'

interface Props {
  page: number
}

export async function PathConfigList({ page }: Props) {
  const result = await listPathConfigs(page)
  if (!result.ok) {
    return <ConnectionError message={result.error} />
  }

  const items = result.paths.items ?? []

  const columns: Column<PathConf>[] = [
    {
      header: 'Name',
      cell: row =>
        row.name
          ? (
              <Link
                href={`/streams/paths/${encodeURIComponent(row.name)}`}
                className="font-medium hover:underline"
              >
                {row.name}
              </Link>
            )
          : '—',
    },
    {
      header: 'Source',
      cell: row => row.source ? <code className="text-xs">{row.source}</code> : <span className="text-muted-foreground">publisher</span>,
    },
    { header: 'On demand', cell: row => row.sourceOnDemand ? '✓' : '—' },
    { header: 'Record', cell: row => row.record ? '✓' : '—' },
    { header: 'Max readers', cell: row => row.maxReaders ?? '∞' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/streams/paths/new">
            <Plus className="h-4 w-4 mr-2" />
            New path
          </Link>
        </Button>
      </div>
      <PagedTable
        rows={items}
        columns={columns}
        page={page}
        pageCount={result.paths.pageCount}
        rowKey={row => row.name ?? ''}
        rowActions={row =>
          row.name ? <DeletePathButton name={row.name} /> : null}
        emptyMessage="No configured paths."
      />
    </div>
  )
}

'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { Button } from '@/shared/components/ui/button'

export interface Column<T> {
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

interface PagedTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  pageCount?: number
  page: number
  emptyMessage?: string
  rowKey: (row: T) => string
  rowActions?: (row: T) => React.ReactNode
}

export function PagedTable<T>({
  rows,
  columns,
  pageCount,
  page,
  emptyMessage = 'No items.',
  rowKey,
  rowActions,
}: PagedTableProps<T>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const buildPageHref = (target: number): string => {
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : [],
    )
    params.set('page', String(target))
    return `${pathname}?${params.toString()}`
  }

  if (rows.length === 0) {
    return (
      <div className="rounded border border-dashed border-muted-foreground/40 p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map(col => (
                <th key={col.header} className={`px-3 py-2 ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
              {rowActions && <th className="px-3 py-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={rowKey(row)} className="border-t hover:bg-muted/30">
                {columns.map(col => (
                  <td key={col.header} className={`px-3 py-2 ${col.className ?? ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-3 py-2 text-right">{rowActions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount && pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            Page
            {' '}
            {page}
            {' '}
            of
            {' '}
            {pageCount}
          </span>
          <Button
            asChild
            variant="outline"
            size="icon"
            disabled={page <= 1}
          >
            <Link
              href={page > 1 ? buildPageHref(page - 1) : '#'}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon"
            disabled={page >= pageCount}
          >
            <Link
              href={page < pageCount ? buildPageHref(page + 1) : '#'}
              aria-disabled={page >= pageCount}
              tabIndex={page >= pageCount ? -1 : 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

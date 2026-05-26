import { cn } from '../lib/utils'

export interface Column<T> {
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  rowActions?: (row: T) => React.ReactNode
  emptyMessage?: string
  isLoading?: boolean
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  rowActions,
  emptyMessage = 'No items to show.',
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="mmtx-card p-12 text-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="mmtx-card p-12 text-center text-sm text-[color:var(--color-muted-foreground)]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="mmtx-card mmtx-scroll overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--color-border)]">
            {columns.map(col => (
              <th
                key={col.header}
                className={cn(
                  'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                {col.header}
              </th>
            ))}
            {rowActions && <th className="px-4 py-3 text-right" />}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={rowKey(row)}
              className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-[color:var(--color-surface-2)] transition-colors"
            >
              {columns.map(col => (
                <td
                  key={col.header}
                  className={cn(
                    'px-4 py-3 text-[color:var(--color-foreground)]',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
              {rowActions && (
                <td className="px-4 py-3 text-right">{rowActions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

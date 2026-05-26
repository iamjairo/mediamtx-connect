export function formatBytes(bytes: number | undefined): string {
  if (!bytes && bytes !== 0) {
    return '—'
  }
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }
  const date = new Date(iso)
  return date.toLocaleString()
}

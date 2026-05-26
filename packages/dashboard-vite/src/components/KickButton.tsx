import { Loader2, UserX } from 'lucide-react'
import { useState } from 'react'

import { useMediaMtx } from '../lib/context'
import { Button } from './Button'

interface KickButtonProps {
  id: string
  label: string
  onKick: (id: string) => Promise<unknown>
}

export function KickButton({ id, label, onKick }: KickButtonProps) {
  const { allowDestructive } = useMediaMtx()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!allowDestructive) return null

  const handleClick = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Kick ${label}?`)) return
    setPending(true)
    setError(null)
    try {
      await onKick(id)
    }
    catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
    finally {
      setPending(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
        Kick
      </Button>
      {error && (
        <span className="text-[10px] text-[color:var(--color-destructive)]">{error}</span>
      )}
    </div>
  )
}

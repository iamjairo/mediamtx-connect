'use client'

import { Loader2, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/components/ui/use-toast'

interface KickButtonProps {
  id: string
  label?: string
  action: (id: string) => Promise<{ ok: boolean, error?: string }>
}

export function KickButton({ id, label = 'Kick', action }: KickButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  const onClick = async () => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(`Kick session ${id}?`)
    if (!confirmed) {
      return
    }
    setPending(true)
    const result = await action(id)
    setPending(false)
    if (result.ok) {
      toast({ title: 'Session kicked', description: id })
      router.refresh()
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Failed to kick',
        description: result.error ?? 'Unknown error',
      })
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      {pending
        ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        : <UserX className="h-3 w-3 mr-1" />}
      {label}
    </Button>
  )
}

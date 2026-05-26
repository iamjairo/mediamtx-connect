'use client'

import { Loader2, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/components/ui/use-toast'

import { deletePathConfig } from '../actions/savePathConfig'

export function DeletePathButton({ name }: { name: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  const onClick = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete path "${name}"? This removes the configuration from MediaMTX.`)) {
      return
    }
    setPending(true)
    const result = await deletePathConfig(name)
    setPending(false)
    if (result.ok) {
      toast({ title: 'Path deleted', description: name })
      router.refresh()
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Failed to delete path',
        description: result.error,
      })
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      {pending
        ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        : <Trash className="h-3 w-3 mr-1" />}
      Delete
    </Button>
  )
}

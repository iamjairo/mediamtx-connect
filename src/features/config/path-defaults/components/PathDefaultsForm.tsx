'use client'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { useToast } from '@/shared/components/ui/use-toast'

import { updatePathDefaults } from '../actions/updatePathDefaults'

interface Props {
  defaults: PathConf
}

export function PathDefaultsForm({ defaults }: Props) {
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [text, setText] = useState(() => JSON.stringify(defaults, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)

  const onSubmit = async () => {
    let parsed: PathConf
    try {
      parsed = JSON.parse(text) as PathConf
      setParseError(null)
    }
    catch (error) {
      setParseError((error as Error).message)
      return
    }
    setPending(true)
    const result = await updatePathDefaults(parsed)
    setPending(false)
    if (result.ok) {
      toast({ title: 'Path defaults saved' })
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Failed to save path defaults',
        description: result.error,
      })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Defaults applied to every path that does not override them. Edit as JSON
        — every key on
        {' '}
        <code>PathConf</code>
        {' '}
        is supported. PATCH semantics:
        only included keys change.
      </p>
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={30}
        className="font-mono text-xs"
      />
      {parseError && (
        <p className="text-sm text-red-500">
          JSON parse error:
          {' '}
          {parseError}
        </p>
      )}
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save defaults
        </Button>
      </div>
    </div>
  )
}

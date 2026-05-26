import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../components/Button'
import { Card, CardDescription, CardTitle } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import {
  useCreatePathConfig,
  usePatchPathConfig,
  usePathConfig,
  useReplacePathConfig,
} from '../../hooks/queries'
import { cn } from '../../lib/utils'
import type { PathConf } from '../../lib/mediamtx/generated'

interface Props {
  mode: 'create' | 'edit'
}

const sections: { title: string, fields: Array<keyof PathConf | { field: keyof PathConf, label: string, hint?: string }> }[] = [
  {
    title: 'Source',
    fields: [
      { field: 'source', label: 'Source URL', hint: 'rtsp://, hls://, srt://, publisher, redirect…' },
      { field: 'sourceOnDemand', label: 'Source on demand (true / false)' },
      { field: 'sourceOnDemandStartTimeout', label: 'Start timeout', hint: 'e.g. 10s' },
      { field: 'sourceOnDemandCloseAfter', label: 'Close after', hint: 'e.g. 10s' },
      { field: 'maxReaders', label: 'Max readers (number)' },
      { field: 'fallback', label: 'Fallback URL' },
    ],
  },
  {
    title: 'Recording',
    fields: [{ field: 'record', label: 'Record (true / false)' }],
  },
  {
    title: 'Publish access',
    fields: [
      { field: 'publishUser', label: 'Publish user' },
      { field: 'publishPass', label: 'Publish password' },
    ],
  },
  {
    title: 'Read access',
    fields: [
      { field: 'readUser', label: 'Read user' },
      { field: 'readPass', label: 'Read password' },
    ],
  },
  {
    title: 'Hooks',
    fields: [
      { field: 'runOnReady', label: 'Run on ready' },
      { field: 'runOnNotReady', label: 'Run on not ready' },
      { field: 'runOnRead', label: 'Run on read' },
      { field: 'runOnRecordSegmentComplete', label: 'Run on record segment complete' },
    ],
  },
]

function normalize(value: string | undefined): unknown {
  if (value === undefined || value === '') return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  const n = Number(value)
  if (!Number.isNaN(n) && value.trim() !== '' && /^-?\d+(?:\.\d+)?$/.test(value)) return n
  return value
}

export function PathFormModule({ mode }: Props) {
  const navigate = useNavigate()
  const { name: rawName } = useParams<{ name: string }>()
  const name = rawName ? decodeURIComponent(rawName) : ''

  const existing = usePathConfig(mode === 'edit' ? name : undefined)
  const create = useCreatePathConfig()
  const patch = usePatchPathConfig()
  const replace = useReplacePathConfig()

  const [pathName, setPathName] = useState<string>(name)
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitMode, setSubmitMode] = useState<'patch' | 'replace'>('patch')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && existing.data) {
      const seed: Record<string, string> = {}
      for (const [k, v] of Object.entries(existing.data)) {
        if (v === undefined || v === null) continue
        if (Array.isArray(v)) seed[k] = v.join('\n')
        else seed[k] = String(v)
      }
      setValues(seed)
    }
  }, [mode, existing.data])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!pathName) {
      setError('Path name is required')
      return
    }

    const body: PathConf = {}
    for (const [k, v] of Object.entries(values)) {
      const normalized = normalize(v)
      if (normalized !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(body as any)[k] = normalized
      }
    }

    try {
      if (mode === 'create') {
        await create.mutateAsync({ name: pathName, data: body })
      }
      else if (submitMode === 'replace') {
        await replace.mutateAsync({ name: pathName, data: body })
      }
      else {
        await patch.mutateAsync({ name: pathName, data: body })
      }
      navigate('/paths')
    }
    catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  const pending = create.isPending || patch.isPending || replace.isPending

  return (
    <>
      <TopBar
        title={mode === 'create' ? 'New path' : name}
        subtitle={mode === 'create' ? 'Add a new MediaMTX path configuration.' : 'Edit this path configuration.'}
        actions={
          <Button
            type="submit"
            form="path-form"
            variant="primary"
            size="sm"
            disabled={pending}
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === 'create' ? 'Create' : submitMode === 'replace' ? 'Replace' : 'Save'}
          </Button>
        }
      />

      <Link
        to="/paths"
        className="mb-4 inline-flex items-center gap-1 text-xs text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to paths
      </Link>

      <form id="path-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <Card>
          <CardTitle>Name</CardTitle>
          <CardDescription>Unique identifier. Cannot be changed after creation.</CardDescription>
          <input
            type="text"
            value={pathName}
            disabled={mode === 'edit'}
            onChange={e => setPathName(e.target.value)}
            placeholder="my_cam"
            className={cn(
              'mt-3 w-full rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 py-2 text-sm placeholder:text-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]',
              mode === 'edit' && 'opacity-60',
            )}
          />
        </Card>

        {sections.map(section => (
          <Card key={section.title}>
            <CardTitle className="mb-3">{section.title}</CardTitle>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {section.fields.map((f) => {
                const obj = typeof f === 'string' ? { field: f as keyof PathConf, label: String(f) } : f
                const fieldName = obj.field as string
                return (
                  <label key={fieldName} className="flex flex-col gap-1.5 text-xs">
                    <span className="font-medium text-[color:var(--color-foreground)]">
                      {obj.label}
                    </span>
                    <input
                      type="text"
                      value={values[fieldName] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [fieldName]: e.target.value }))}
                      placeholder={obj.hint}
                      className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm placeholder:text-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]"
                    />
                    {obj.hint && (
                      <span className="text-[10px] text-[color:var(--color-muted-foreground)]">
                        {obj.hint}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </Card>
        ))}

        {mode === 'edit' && (
          <Card>
            <CardTitle>Save mode</CardTitle>
            <CardDescription>
              <strong>Patch</strong> only changes included fields.
              <strong> Replace</strong> resets every other field to defaults.
            </CardDescription>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant={submitMode === 'patch' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSubmitMode('patch')}
              >
                Patch
              </Button>
              <Button
                type="button"
                variant={submitMode === 'replace' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSubmitMode('replace')}
              >
                Replace
              </Button>
            </div>
          </Card>
        )}

        {error && (
          <p className="text-sm text-[color:var(--color-destructive)]">{error}</p>
        )}
      </form>
    </>
  )
}

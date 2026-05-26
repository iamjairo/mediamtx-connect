'use client'

import type { PathConf } from '@/lib/MediaMTX/generated'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { GridFormItem } from '@/shared/components/forms'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { Textarea } from '@/shared/components/ui/textarea'
import { useToast } from '@/shared/components/ui/use-toast'

import { createPathConfig, patchPathConfig, replacePathConfig } from '../actions/savePathConfig'
import { PathConfigSchema } from '../schemas/path-config.schema'

type Mode = 'create' | 'edit'

interface Props {
  mode: Mode
  defaultName?: string
  defaultValues?: PathConf
}

function BooleanSelect({
  value,
  onChange,
}: {
  value: boolean | undefined
  onChange: (v: boolean | undefined) => void
}) {
  return (
    <Select
      value={value === undefined ? '' : String(value)}
      onValueChange={(v) => {
        if (v === '') {
          onChange(undefined)
        }
        else {
          onChange(v === 'true')
        }
      }}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Inherit default" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="true">True</SelectItem>
        <SelectItem value="false">False</SelectItem>
      </SelectContent>
    </Select>
  )
}

function handleTextareaToArray(value: string): string[] {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function arrayToTextarea(value: string[] | undefined): string {
  return value?.join('\n') ?? ''
}

export function PathConfigForm({ mode, defaultName, defaultValues }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [submitMode, setSubmitMode] = useState<'patch' | 'replace'>('patch')

  const form = useForm({
    resolver: zodResolver(PathConfigSchema),
    mode: 'onBlur',
    defaultValues: defaultValues ?? {},
  })

  const [name, setName] = useState(defaultName ?? '')

  const onSubmit = form.handleSubmit(async (values) => {
    if (!name) {
      toast({ variant: 'destructive', title: 'Path name required' })
      return
    }
    setPending(true)
    const cleaned: PathConf = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== undefined && v !== ''),
    )

    let result: { ok: boolean, error?: string }
    if (mode === 'create') {
      result = await createPathConfig(name, cleaned)
    }
    else if (submitMode === 'replace') {
      result = await replacePathConfig(name, cleaned)
    }
    else {
      result = await patchPathConfig(name, cleaned)
    }
    setPending(false)

    if (result.ok) {
      toast({
        title: mode === 'create' ? 'Path created' : 'Path saved',
        description: name,
      })
      if (mode === 'create') {
        router.push('/streams/paths')
      }
    }
    else {
      toast({
        variant: 'destructive',
        title: mode === 'create' ? 'Failed to create path' : 'Failed to save path',
        description: result.error,
      })
    }
  })

  return (
    <Form {...form}>
      <form className="space-y-4 py-2 flex flex-col" onSubmit={onSubmit}>
        <div className="flex justify-end gap-2 py-2">
          {mode === 'edit' && (
            <Select value={submitMode} onValueChange={v => setSubmitMode(v as 'patch' | 'replace')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patch">Patch (partial)</SelectItem>
                <SelectItem value="replace">Replace (full)</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Create path' : 'Save'}
          </Button>
        </div>

        <GridFormItem label="Path name">
          <>
            <Input
              value={name}
              disabled={mode === 'edit'}
              onChange={e => setName(e.target.value)}
              placeholder="my_cam"
            />
            <FormDescription>
              Unique identifier. Cannot be changed after creation.
            </FormDescription>
          </>
        </GridFormItem>

        <Separator />
        <h3 className="text-sm font-semibold">Source</h3>

        <FormField
          name="source"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Source URL">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="rtsp://camera.example/stream" />
                </FormControl>
                <FormDescription>
                  rtsp://, rtsps://, rtmp://, rtmps://, hls://, srt://, udp://, publisher, or redirect.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="sourceOnDemand"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Source on demand">
              <>
                <BooleanSelect value={field.value} onChange={field.onChange} />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="sourceOnDemandStartTimeout"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Start timeout">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="10s" />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="sourceOnDemandCloseAfter"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Close after">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="10s" />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="maxReaders"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Max readers">
              <>
                <FormControl>
                  <Input
                    type="number"
                    value={(field.value as number | undefined) ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <Separator />
        <h3 className="text-sm font-semibold">Recording</h3>

        <FormField
          name="record"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record">
              <>
                <BooleanSelect value={field.value} onChange={field.onChange} />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <Separator />
        <h3 className="text-sm font-semibold">Publish authentication</h3>

        <FormField
          name="publishUser"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Publish user">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="publishPass"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Publish password">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="password" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="publishIPs"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Publish IPs (one per line)">
              <>
                <FormControl>
                  <Textarea
                    value={arrayToTextarea(field.value)}
                    onChange={e => field.onChange(handleTextareaToArray(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <Separator />
        <h3 className="text-sm font-semibold">Read authentication</h3>

        <FormField
          name="readUser"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Read user">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="readPass"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Read password">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="password" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="readIPs"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Read IPs (one per line)">
              <>
                <FormControl>
                  <Textarea
                    value={arrayToTextarea(field.value)}
                    onChange={e => field.onChange(handleTextareaToArray(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <Separator />
        <h3 className="text-sm font-semibold">RTSP</h3>

        <FormField
          name="rtspTransport"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTSP transport">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="automatic, udp, multicast, tcp" />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="rtspAnyPort"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTSP any port">
              <>
                <BooleanSelect value={field.value} onChange={field.onChange} />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="fallback"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Fallback URL">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <Separator />
        <h3 className="text-sm font-semibold">Hooks</h3>

        <FormField
          name="runOnReady"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on ready">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="runOnNotReady"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on not ready">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="runOnRead"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on read">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="runOnRecordSegmentComplete"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on record segment complete">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
      </form>
    </Form>
  )
}

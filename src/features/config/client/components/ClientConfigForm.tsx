'use client'

import type { Config } from '@prisma/client'

import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
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
import { useToast } from '@/shared/components/ui/use-toast'

import { testMediaMtxConnection } from '../actions/testMediaMtxConnection'
import { updateClientConfig } from '../actions/updateClientConfig'
import { ClientConfigSchema } from '../schemas/client-config.schema'

type TestResult
  = | { status: 'idle' }
    | { status: 'testing' }
    | { status: 'ok', latencyMs: number }
    | { status: 'error', message: string }

export function ClientConfigForm({
  clientConfig,
}: {
  clientConfig: Config | null
}) {
  const { toast } = useToast()
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' })
  const form = useForm({
    resolver: zodResolver(ClientConfigSchema),
    mode: 'onBlur',
    defaultValues: clientConfig ?? undefined,
  })
  const onSubmit = async (values: z.output<typeof ClientConfigSchema>) => {
    const updated = await updateClientConfig({ clientConfig: values })

    if (updated) {
      toast({ title: 'Updated Global Config' })
    }
    else {
      toast({
        variant: 'destructive',
        title: 'There was an issue updating the Global Config',
        description: 'Please double check your form values.',
      })
    }
  }

  const onTestConnection = async () => {
    const values = form.getValues()
    setTestResult({ status: 'testing' })
    const result = await testMediaMtxConnection({
      mediaMtxUrl: values.mediaMtxUrl,
      mediaMtxApiPort: Number(values.mediaMtxApiPort),
      mediaMtxApiUsername: values.mediaMtxApiUsername ?? null,
      mediaMtxApiPassword: values.mediaMtxApiPassword ?? null,
    })
    setTestResult(
      result.ok
        ? { status: 'ok', latencyMs: result.latencyMs }
        : { status: 'error', message: result.error },
    )
  }

  return (
    <Form {...form}>
      <form
        className="space-y-2 py-2 flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex justify-end gap-2 py-2">
          <Button type="button" variant="outline" onClick={onTestConnection}>
            {testResult.status === 'testing'
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : testResult.status === 'ok'
                ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                : testResult.status === 'error'
                  ? <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  : null}
            Test connection
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty}
          >
            Submit
          </Button>
        </div>

        {testResult.status === 'ok' && (
          <p className="text-sm text-green-500 text-right">
            Connected in
            {' '}
            {testResult.latencyMs}
            ms
          </p>
        )}
        {testResult.status === 'error' && (
          <p className="text-sm text-red-500 text-right">{testResult.message}</p>
        )}

        <FormField
          name="mediaMtxUrl"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx Url">
              <>
                <FormControl {...field}>
                  <Input placeholder="http://mediamtx" />
                </FormControl>
                <FormDescription>
                  The address to your MediaMTX Instance. Within a Docker
                  Network, you can use the container name. Otherwise, use the
                  external IP / hostname.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="mediaMtxApiPort"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx Api Port">
              <>
                <FormControl {...field}>
                  <Input type="number" placeholder="9997" />
                </FormControl>
                <FormDescription>The port to the MediaMTX API</FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="mediaMtxApiUsername"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx API Username">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  Optional. Required when MediaMTX is configured with
                  {' '}
                  <code>authInternalUsers</code>
                  {' '}
                  protecting the API.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="mediaMtxApiPassword"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx API Password">
              <>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    type="password"
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>
                  Stored in the local SQLite config. Leave blank when no
                  auth is required.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="remoteMediaMtxUrl"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Remote MediaMtx URL">
              <>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="http://localhost" />
                </FormControl>
                <FormDescription>
                  This is the browser-accessible, externally-facing IP /
                  hostname of your MediaMTX Server.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="recordingsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Recordings Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="/recordings" />
                </FormControl>
                <FormDescription>
                  Directory containing MediaMTX recordings (Not recommended to
                  change if using Docker)
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
        <FormField
          name="screenshotsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Screenshots Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="/screenshots" />
                </FormControl>
                <FormDescription>
                  Directory to store generated screenshots (Not recommended to
                  change if using Docker)
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
      </form>
    </Form>
  )
}

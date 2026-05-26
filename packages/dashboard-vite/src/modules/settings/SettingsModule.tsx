import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '../../components/Button'
import { Card, CardDescription, CardTitle } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import {
  useGlobalConfig,
  usePathDefaults,
  useUpdateGlobalConfig,
  useUpdatePathDefaults,
} from '../../hooks/queries'
import { useMediaMtx } from '../../lib/context'
import type { GlobalConf, PathConf } from '../../lib/mediamtx/generated'

export function SettingsModule() {
  const { baseUrl, pollIntervalMs, setPollIntervalMs } = useMediaMtx()
  const global = useGlobalConfig()
  const defaults = usePathDefaults()
  const updateGlobal = useUpdateGlobalConfig()
  const updateDefaults = useUpdatePathDefaults()

  const [globalText, setGlobalText] = useState('')
  const [defaultsText, setDefaultsText] = useState('')
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [defaultsError, setDefaultsError] = useState<string | null>(null)

  useEffect(() => {
    if (global.data) setGlobalText(JSON.stringify(global.data, null, 2))
  }, [global.data])

  useEffect(() => {
    if (defaults.data) setDefaultsText(JSON.stringify(defaults.data, null, 2))
  }, [defaults.data])

  const saveGlobal = () => {
    setGlobalError(null)
    try {
      const parsed = JSON.parse(globalText) as GlobalConf
      updateGlobal.mutate(parsed, {
        onError: e => setGlobalError(e instanceof Error ? e.message : 'Save failed'),
      })
    }
    catch (e) {
      setGlobalError((e as Error).message)
    }
  }

  const saveDefaults = () => {
    setDefaultsError(null)
    try {
      const parsed = JSON.parse(defaultsText) as PathConf
      updateDefaults.mutate(parsed, {
        onError: e => setDefaultsError(e instanceof Error ? e.message : 'Save failed'),
      })
    }
    catch (e) {
      setDefaultsError((e as Error).message)
    }
  }

  return (
    <>
      <TopBar title="Settings" subtitle="Connection, refresh and MediaMTX server configuration." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Connection</CardTitle>
          <CardDescription>
            Configured by the host. To change, update the host's MediaMtxProvider props.
          </CardDescription>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[color:var(--color-muted-foreground)]">Base URL</dt>
            <dd><code className="text-xs">{baseUrl}</code></dd>
            <dt className="text-[color:var(--color-muted-foreground)]">Poll interval</dt>
            <dd>
              <input
                type="number"
                min={1000}
                step={1000}
                value={pollIntervalMs}
                onChange={e => setPollIntervalMs(Number(e.target.value))}
                className="w-24 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]"
              />
              <span className="ml-1 text-xs text-[color:var(--color-muted-foreground)]">ms</span>
            </dd>
          </dl>
        </Card>

        <Card>
          <CardTitle>MediaMTX status</CardTitle>
          <CardDescription>
            Live state of the configured backend.
          </CardDescription>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[color:var(--color-muted-foreground)]">Reachable</dt>
            <dd>
              {global.isError
                ? <span className="text-[color:var(--color-destructive)]">No</span>
                : global.data
                  ? <span className="text-[color:var(--color-success)]">Yes</span>
                  : 'Checking…'}
            </dd>
            <dt className="text-[color:var(--color-muted-foreground)]">Log level</dt>
            <dd>{global.data?.logLevel ?? '—'}</dd>
            <dt className="text-[color:var(--color-muted-foreground)]">API address</dt>
            <dd><code className="text-xs">{global.data?.apiAddress ?? '—'}</code></dd>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Global config</CardTitle>
              <CardDescription>
                MediaMTX global configuration as JSON. Only included keys change.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={saveGlobal}
              disabled={updateGlobal.isPending}
            >
              {updateGlobal.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
          </div>
          <textarea
            value={globalText}
            onChange={e => setGlobalText(e.target.value)}
            rows={20}
            className="mt-3 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)] mmtx-scroll"
          />
          {globalError && (
            <p className="mt-2 text-xs text-[color:var(--color-destructive)]">{globalError}</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Path defaults</CardTitle>
              <CardDescription>
                Defaults applied to every path that does not override them.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={saveDefaults}
              disabled={updateDefaults.isPending}
            >
              {updateDefaults.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
          </div>
          <textarea
            value={defaultsText}
            onChange={e => setDefaultsText(e.target.value)}
            rows={16}
            className="mt-3 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)] mmtx-scroll"
          />
          {defaultsError && (
            <p className="mt-2 text-xs text-[color:var(--color-destructive)]">{defaultsError}</p>
          )}
        </Card>
      </div>
    </>
  )
}

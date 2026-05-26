import { useState } from 'react'

import type { DesktopSettings } from './settings'

interface Props {
  onConfigured: (settings: DesktopSettings) => void | Promise<void>
}

export function ConnectionSetup({ onConfigured }: Props) {
  const [baseUrl, setBaseUrl] = useState('http://localhost:9997')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      // Smoke-test the connection before persisting.
      const headers: Record<string, string> = {}
      if (username) {
        headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`
      }
      const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/v3/config/global/get`, { headers })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      await onConfigured({
        baseUrl,
        username: username || undefined,
        password: password || undefined,
        allowDestructive: true,
        pollIntervalMs: 5000,
      })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
    finally {
      setPending(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'oklch(0.16 0.012 250)', color: 'oklch(0.98 0 0)' }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-2xl border p-8"
        style={{
          background: 'oklch(0.21 0.013 250)',
          borderColor: 'oklch(1 0 0 / 10%)',
        }}
      >
        <div>
          <h1 className="text-xl font-semibold">MediaMTX Connect</h1>
          <p className="mt-1 text-sm" style={{ color: 'oklch(0.72 0.012 250)' }}>
            Point this desktop app at a running MediaMTX server.
          </p>
        </div>

        <Field label="MediaMTX URL">
          <input
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="http://localhost:9997"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            style={{
              background: 'oklch(0.18 0.012 250)',
              borderColor: 'oklch(1 0 0 / 16%)',
              color: 'inherit',
            }}
          />
        </Field>

        <Field label="API username (optional)">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            style={{
              background: 'oklch(0.18 0.012 250)',
              borderColor: 'oklch(1 0 0 / 16%)',
              color: 'inherit',
            }}
          />
        </Field>

        <Field label="API password (optional)">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
            style={{
              background: 'oklch(0.18 0.012 250)',
              borderColor: 'oklch(1 0 0 / 16%)',
              color: 'inherit',
            }}
          />
        </Field>

        {error && (
          <p className="text-sm" style={{ color: 'oklch(0.65 0.22 28)' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          style={{
            background: 'oklch(0.66 0.20 255)',
            color: 'oklch(0.99 0 0)',
            boxShadow: '0 8px 30px -4px oklch(0.72 0.22 255 / 60%)',
          }}
        >
          {pending ? 'Connecting…' : 'Connect'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium">{label}</span>
      {children}
    </label>
  )
}

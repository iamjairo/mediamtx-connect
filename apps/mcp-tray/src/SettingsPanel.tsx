import { useEffect, useState } from 'react'

import { loadSettings, restartServer, saveSettings, type McpSettings } from './ipc'

const DEFAULTS: McpSettings = {
  mediaMtxUrl: 'http://localhost:9997',
  apiUsername: '',
  apiPassword: '',
  allowKick: false,
  autoStart: false,
  transport: 'stdio',
  httpPort: 8181,
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<McpSettings>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings().then((s) => {
      if (s) setSettings({ ...DEFAULTS, ...s })
    })
  }, [])

  const update = <K extends keyof McpSettings>(key: K, value: McpSettings[K]) => {
    setSettings(s => ({ ...s, [key]: value }))
    setSaved(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await saveSettings(settings)
      await restartServer()
      setSaved(true)
    }
    finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
        MediaMTX MCP
      </h1>
      <p style={{ fontSize: '12px', color: 'oklch(0.72 0.012 250)', margin: 0 }}>
        Configure once; the tray manages the server process for you.
      </p>

      <Field label="MediaMTX URL">
        <input
          value={settings.mediaMtxUrl}
          onChange={e => update('mediaMtxUrl', e.target.value)}
          placeholder="http://localhost:9997"
          required
          style={inputStyle}
        />
      </Field>

      <Field label="API username (optional)">
        <input
          value={settings.apiUsername}
          onChange={e => update('apiUsername', e.target.value)}
          autoComplete="off"
          style={inputStyle}
        />
      </Field>

      <Field label="API password (optional)">
        <input
          type="password"
          value={settings.apiPassword}
          onChange={e => update('apiPassword', e.target.value)}
          autoComplete="off"
          style={inputStyle}
        />
      </Field>

      <Field label="Transport">
        <select
          value={settings.transport}
          onChange={e => update('transport', e.target.value as 'stdio' | 'http')}
          style={inputStyle}
        >
          <option value="stdio">stdio (Claude Desktop, Claude Code)</option>
          <option value="http">HTTP (remote MCP clients)</option>
        </select>
      </Field>

      {settings.transport === 'http' && (
        <Field label="HTTP port">
          <input
            type="number"
            min={1}
            max={65535}
            value={settings.httpPort ?? 8181}
            onChange={e => update('httpPort', Number(e.target.value))}
            style={inputStyle}
          />
        </Field>
      )}

      <Toggle
        label="Allow destructive tools (kick, delete, replace, patch)"
        checked={settings.allowKick}
        onChange={v => update('allowKick', v)}
      />

      <Toggle
        label="Auto-start on login"
        checked={settings.autoStart}
        onChange={v => update('autoStart', v)}
      />

      <button
        type="submit"
        disabled={saving}
        style={{
          marginTop: '8px',
          padding: '10px 16px',
          borderRadius: '12px',
          background: 'oklch(0.66 0.20 255)',
          color: 'oklch(0.99 0 0)',
          fontSize: '13px',
          fontWeight: 500,
          border: 'none',
          cursor: saving ? 'wait' : 'pointer',
          boxShadow: '0 8px 30px -4px oklch(0.72 0.22 255 / 60%)',
        }}
      >
        {saving ? 'Saving & restarting…' : saved ? 'Saved ✓' : 'Save & restart server'}
      </button>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid oklch(1 0 0 / 16%)',
  background: 'oklch(0.18 0.012 250)',
  color: 'inherit',
  fontSize: '13px',
  outline: 'none',
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, marginBottom: '4px' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span style={{ fontSize: '12px' }}>{label}</span>
    </label>
  )
}

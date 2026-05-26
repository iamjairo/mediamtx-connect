import { MediaMtxDashboard } from '@iamjairo/mediamtx-dashboard'
import { useEffect, useState } from 'react'

import { ConnectionSetup } from './ConnectionSetup'
import { loadSettings, saveSettings, type DesktopSettings } from './settings'

export function App() {
  const [settings, setSettings] = useState<DesktopSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[color:var(--color-background)] text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    )
  }

  if (!settings?.baseUrl) {
    return (
      <ConnectionSetup
        onConfigured={async (s) => {
          await saveSettings(s)
          setSettings(s)
        }}
      />
    )
  }

  return (
    <MediaMtxDashboard
      baseUrl={settings.baseUrl}
      username={settings.username || undefined}
      password={settings.password || undefined}
      allowDestructive={settings.allowDestructive ?? true}
      pollIntervalMs={settings.pollIntervalMs ?? 5000}
      hostName="MediaMTX Connect"
    />
  )
}

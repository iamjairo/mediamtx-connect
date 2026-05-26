import { useEffect, useState } from 'react'

import { LogViewer } from './LogViewer'
import { SettingsPanel } from './SettingsPanel'
import { getView } from './ipc'

type View = 'settings' | 'logs'

export function App() {
  const [view, setView] = useState<View>('settings')

  useEffect(() => {
    getView().then(v => v && setView(v))
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'oklch(0.16 0.012 250)',
        color: 'oklch(0.98 0 0)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {view === 'settings' && <SettingsPanel />}
      {view === 'logs' && <LogViewer />}
    </div>
  )
}

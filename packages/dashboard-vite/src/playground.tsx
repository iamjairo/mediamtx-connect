import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { MediaMtxDashboard } from './MediaMtxDashboard'

import './styles.css'

interface RuntimeConfig {
  baseUrl: string
  username?: string
  password?: string
  allowDestructive?: boolean
  pollIntervalMs?: number
}

declare global {
  interface Window {
    __MEDIAMTX_DASHBOARD_CONFIG__?: RuntimeConfig
  }
}

const envBaseUrl
  = (import.meta as unknown as { env: Record<string, string | undefined> })
    .env.VITE_MEDIAMTX_URL

const runtime = window.__MEDIAMTX_DASHBOARD_CONFIG__

const config: RuntimeConfig = {
  baseUrl: runtime?.baseUrl ?? envBaseUrl ?? 'http://localhost:9997',
  username: runtime?.username || undefined,
  password: runtime?.password || undefined,
  allowDestructive: runtime?.allowDestructive ?? true,
  pollIntervalMs: runtime?.pollIntervalMs ?? 5000,
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <BrowserRouter>
    <MediaMtxDashboard
      baseUrl={config.baseUrl}
      username={config.username}
      password={config.password}
      allowDestructive={config.allowDestructive}
      pollIntervalMs={config.pollIntervalMs}
      hostName="MediaMTX"
    />
  </BrowserRouter>,
)

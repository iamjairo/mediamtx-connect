import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { MediaMtxDashboard } from './MediaMtxDashboard'

import './styles.css'

const root = createRoot(document.getElementById('root')!)

const baseUrl
  = (import.meta as unknown as { env: Record<string, string | undefined> })
    .env.VITE_MEDIAMTX_URL ?? 'http://localhost:9997'

root.render(
  <BrowserRouter>
    <MediaMtxDashboard
      baseUrl={baseUrl}
      hostName="Playground"
      allowDestructive
    />
  </BrowserRouter>,
)

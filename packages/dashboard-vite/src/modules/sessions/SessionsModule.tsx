import { NavLink, Outlet } from 'react-router-dom'

import { TopBar } from '../../components/TopBar'
import { cn } from '../../lib/utils'

const tabs = [
  { to: '/sessions/rtsp', label: 'RTSP' },
  { to: '/sessions/rtsps', label: 'RTSPS' },
  { to: '/sessions/rtmp', label: 'RTMP' },
  { to: '/sessions/rtmps', label: 'RTMPS' },
  { to: '/sessions/srt', label: 'SRT' },
  { to: '/sessions/webrtc', label: 'WebRTC' },
]

export function SessionsModule() {
  return (
    <>
      <TopBar
        title="Sessions"
        subtitle="Active connections and sessions across every MediaMTX protocol."
      />

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-1">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-foreground)]'
                  : 'text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]',
              )}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </>
  )
}

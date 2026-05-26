import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'

interface AppShellProps {
  hostName?: string
}

export function AppShell({ hostName }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-full min-h-screen gap-4 bg-[color:var(--color-background)] p-4">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        hostName={hostName}
      />
      <main className="mmtx-scroll flex-1 overflow-auto">
        <div className="mx-auto max-w-[1400px] px-2 py-2 sm:px-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

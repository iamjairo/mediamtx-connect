import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Film,
  LayoutDashboard,
  Plus,
  Radio,
  Route,
  Settings,
  Tv,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { cn } from '../lib/utils'

interface ChildItem {
  to: string
  label: string
}

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string | number
  children?: ChildItem[]
}

const items: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/streams', label: 'Streams', icon: Tv },
  { to: '/paths', label: 'Paths', icon: Route },
  {
    to: '/sessions',
    label: 'Sessions',
    icon: Activity,
    children: [
      { to: '/sessions/rtsp', label: 'RTSP' },
      { to: '/sessions/rtsps', label: 'RTSPS' },
      { to: '/sessions/rtmp', label: 'RTMP' },
      { to: '/sessions/rtmps', label: 'RTMPS' },
      { to: '/sessions/srt', label: 'SRT' },
      { to: '/sessions/webrtc', label: 'WebRTC' },
    ],
  },
  { to: '/muxers', label: 'HLS Muxers', icon: Radio },
  { to: '/recordings', label: 'Recordings', icon: Film },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  hostName?: string
  hostStatus?: 'ok' | 'warning' | 'error'
}

export function Sidebar({ collapsed, onToggle, hostName = 'MediaMTX', hostStatus = 'ok' }: SidebarProps) {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '/sessions': location.pathname.startsWith('/sessions'),
  })

  const toggleGroup = (to: string) => {
    setExpandedGroups(prev => ({ ...prev, [to]: !prev[to] }))
  }

  return (
    <aside
      className={cn(
        'relative mmtx-card mmtx-scroll flex h-full flex-col py-5 transition-[width] duration-200 overflow-hidden',
        collapsed ? 'w-[76px] px-3' : 'w-[260px] px-4',
      )}
    >
      {/* Pulse status dot — green stripe on left edge */}
      <span
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 h-12 w-[3px] rounded-r-full',
          hostStatus === 'ok' && 'bg-[color:var(--color-success)] shadow-[0_0_18px_2px_var(--color-success)]',
          hostStatus === 'warning' && 'bg-[color:var(--color-warning)] shadow-[0_0_18px_2px_var(--color-warning)]',
          hostStatus === 'error' && 'bg-[color:var(--color-destructive)] shadow-[0_0_18px_2px_var(--color-destructive)]',
        )}
      />

      {/* Header */}
      <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--color-hue-blue)] to-[color:var(--color-hue-purple)] text-base font-bold text-[color:var(--color-background)]">
          M
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
              Connected
            </p>
            <p className="truncate text-sm font-semibold">{hostName}</p>
          </div>
        )}
      </div>

      <div className="my-5 border-t border-[color:var(--color-border)]" />

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const isGroupOpen = expandedGroups[item.to]
          const sectionActive
            = location.pathname === item.to
              || (item.children && location.pathname.startsWith(item.to))

          if (item.children) {
            return (
              <div key={item.to}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.to)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    sectionActive
                      ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-foreground)]'
                      : 'text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]',
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isGroupOpen ? 'rotate-180' : '',
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isGroupOpen && (
                  <div className="relative ml-5 mt-1 flex flex-col gap-0.5 border-l border-[color:var(--color-border)] pl-3">
                    {item.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          cn(
                            'rounded-lg px-3 py-1.5 text-xs transition-colors',
                            isActive
                              ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-foreground)]'
                              : 'text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]',
                          )}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-foreground)]'
                    : 'text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]',
                )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge != null && (
                <span className="rounded-md bg-[color:var(--color-warning)] px-1.5 text-[10px] font-semibold text-[color:var(--color-background)] mmtx-glow-yellow">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="my-4 border-t border-[color:var(--color-border)]" />

      {/* CTA */}
      <NavLink
        to="/paths/new"
        className={cn(
          'flex items-center gap-3 rounded-xl border border-dashed border-[color:var(--color-border-strong)] py-3 text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:border-[color:var(--color-brand)]',
          collapsed ? 'justify-center px-0' : 'px-3',
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] mmtx-glow-blue">
          <Plus className="h-4 w-4" />
        </span>
        {!collapsed && <span>New path</span>}
      </NavLink>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] mmtx-glow-blue"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  )
}

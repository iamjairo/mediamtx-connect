import { Activity, Cog, Film, Radio, Route, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardDescription, CardTitle } from '../../components/Card'
import { Stat } from '../../components/Stat'
import { TopBar } from '../../components/TopBar'
import {
  useHlsMuxers,
  usePathConfigs,
  usePaths,
  useRtmpConns,
  useRtmpsConns,
  useRtspSessions,
  useRtspsSessions,
  useSrtConns,
  useWebrtcSessions,
} from '../../hooks/queries'

export function OverviewModule() {
  const paths = usePaths()
  const pathConfigs = usePathConfigs()
  const muxers = useHlsMuxers()

  const rtsp = useRtspSessions()
  const rtsps = useRtspsSessions()
  const rtmp = useRtmpConns()
  const rtmps = useRtmpsConns()
  const srt = useSrtConns()
  const webrtc = useWebrtcSessions()

  const readyPaths = paths.data?.items?.filter(p => p.ready).length ?? 0
  const totalPaths = paths.data?.items?.length ?? 0
  const configuredPaths = pathConfigs.data?.items?.length ?? 0

  const totalSessions
    = (rtsp.data?.items?.length ?? 0)
    + (rtsps.data?.items?.length ?? 0)
    + (rtmp.data?.items?.length ?? 0)
    + (rtmps.data?.items?.length ?? 0)
    + (srt.data?.items?.length ?? 0)
    + (webrtc.data?.items?.length ?? 0)

  const totalMuxers = muxers.data?.items?.length ?? 0

  const protocolBreakdown = [
    { label: 'RTSP', count: rtsp.data?.items?.length ?? 0, to: '/sessions/rtsp', hue: 'blue' as const },
    { label: 'RTSPS', count: rtsps.data?.items?.length ?? 0, to: '/sessions/rtsps', hue: 'purple' as const },
    { label: 'RTMP', count: rtmp.data?.items?.length ?? 0, to: '/sessions/rtmp', hue: 'orange' as const },
    { label: 'RTMPS', count: rtmps.data?.items?.length ?? 0, to: '/sessions/rtmps', hue: 'pink' as const },
    { label: 'SRT', count: srt.data?.items?.length ?? 0, to: '/sessions/srt', hue: 'green' as const },
    { label: 'WebRTC', count: webrtc.data?.items?.length ?? 0, to: '/sessions/webrtc', hue: 'yellow' as const },
  ]

  const hueClass: Record<string, string> = {
    blue: 'bg-[color:var(--color-hue-blue)]',
    purple: 'bg-[color:var(--color-hue-purple)]',
    orange: 'bg-[color:var(--color-hue-orange)]',
    pink: 'bg-[color:var(--color-hue-pink)]',
    green: 'bg-[color:var(--color-hue-green)]',
    yellow: 'bg-[color:var(--color-hue-yellow)]',
  }

  return (
    <>
      <TopBar
        title="Overview"
        subtitle="Live state of your MediaMTX server, refreshed in real time."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Active paths"
          value={`${readyPaths} / ${totalPaths}`}
          hint={`${configuredPaths} configured`}
          icon={Tv}
          hue="green"
        />
        <Stat
          label="Live sessions"
          value={totalSessions}
          hint="Across all protocols"
          icon={Activity}
          hue="blue"
        />
        <Stat
          label="HLS muxers"
          value={totalMuxers}
          hint="Active output streams"
          icon={Radio}
          hue="orange"
        />
        <Stat
          label="Configured paths"
          value={configuredPaths}
          hint="In MediaMTX config"
          icon={Route}
          hue="purple"
        />
      </div>

      {/* Protocol breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <CardTitle>Sessions by protocol</CardTitle>
              <CardDescription>Click a tile to drill in</CardDescription>
            </div>
            <span className="text-xs text-[color:var(--color-muted-foreground)]">
              Total
              {' '}
              <span className="text-[color:var(--color-foreground)]">{totalSessions}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {protocolBreakdown.map(p => (
              <Link
                key={p.label}
                to={p.to}
                className="group mmtx-card mmtx-card-hover flex items-center justify-between gap-3 p-3 transition-transform hover:-translate-y-px"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-[color:var(--color-background)] ${hueClass[p.hue]}`}>
                    <Activity className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                      {p.label}
                    </p>
                    <p className="text-lg font-semibold">{p.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Quick links</CardTitle>
          <div className="flex flex-col gap-2">
            <QuickLink to="/streams" icon={Tv} label="Live streams" />
            <QuickLink to="/paths" icon={Route} label="Manage paths" />
            <QuickLink to="/muxers" icon={Radio} label="HLS muxers" />
            <QuickLink to="/recordings" icon={Film} label="Recordings" />
            <QuickLink to="/settings" icon={Cog} label="Settings" />
          </div>
        </Card>
      </div>
    </>
  )
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: typeof Tv
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-foreground)]"
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      <span aria-hidden>→</span>
    </Link>
  )
}

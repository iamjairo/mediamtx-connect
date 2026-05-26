import { Route, Routes } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { MediaMtxProvider, type MediaMtxProviderProps } from './lib/context'
import { MuxersModule } from './modules/muxers/MuxersModule'
import { OverviewModule } from './modules/overview/OverviewModule'
import { PathFormModule } from './modules/paths/PathFormModule'
import { PathsModule } from './modules/paths/PathsModule'
import { RtmpSessions } from './modules/sessions/RtmpSessions'
import { RtmpsSessions } from './modules/sessions/RtmpsSessions'
import { RtspSessions } from './modules/sessions/RtspSessions'
import { RtspsSessions } from './modules/sessions/RtspsSessions'
import { SessionsModule } from './modules/sessions/SessionsModule'
import { SrtSessions } from './modules/sessions/SrtSessions'
import { WebrtcSessions } from './modules/sessions/WebrtcSessions'
import { SettingsModule } from './modules/settings/SettingsModule'
import { StreamDetailModule } from './modules/streams/StreamDetailModule'
import { StreamsModule } from './modules/streams/StreamsModule'

export type MediaMtxDashboardProps = Omit<MediaMtxProviderProps, 'children'> & {
  /** Host display name shown in the sidebar header. Defaults to "MediaMTX". */
  hostName?: string
}

/**
 * The main entry point for embedding the dashboard inside a host React+Vite app.
 *
 * The host owns the React Router context — mount this component under a route
 * (e.g. `/mediamtx/*`) and the dashboard handles its own sub-routes via nested
 * `<Routes>`.
 *
 * Example (in the host app):
 *
 * ```tsx
 * <Route
 *   path="/mediamtx/*"
 *   element={
 *     <MediaMtxDashboard
 *       baseUrl="http://localhost:9997"
 *       allowDestructive
 *     />
 *   }
 * />
 * ```
 */
export function MediaMtxDashboard({
  hostName,
  ...providerProps
}: MediaMtxDashboardProps) {
  return (
    <MediaMtxProvider {...providerProps}>
      <Routes>
        <Route element={<AppShell hostName={hostName} />}>
          <Route index element={<OverviewModule />} />
          <Route path="streams" element={<StreamsModule />} />
          <Route path="streams/:name" element={<StreamDetailModule />} />
          <Route path="paths" element={<PathsModule />} />
          <Route path="paths/new" element={<PathFormModule mode="create" />} />
          <Route path="paths/:name" element={<PathFormModule mode="edit" />} />
          <Route path="sessions" element={<SessionsModule />}>
            <Route index element={<RtspSessions />} />
            <Route path="rtsp" element={<RtspSessions />} />
            <Route path="rtsps" element={<RtspsSessions />} />
            <Route path="rtmp" element={<RtmpSessions />} />
            <Route path="rtmps" element={<RtmpsSessions />} />
            <Route path="srt" element={<SrtSessions />} />
            <Route path="webrtc" element={<WebrtcSessions />} />
          </Route>
          <Route path="muxers" element={<MuxersModule />} />
          <Route path="recordings" element={<RecordingsPlaceholder />} />
          <Route path="settings" element={<SettingsModule />} />
        </Route>
      </Routes>
    </MediaMtxProvider>
  )
}

function RecordingsPlaceholder() {
  return (
    <div className="mmtx-card p-12 text-center">
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        Recordings browsing is filesystem-based and lives in the legacy Next.js dashboard.
        The host can supply its own recordings module here.
      </p>
    </div>
  )
}

import './styles.css'

export { MediaMtxDashboard } from './MediaMtxDashboard'
export type { MediaMtxDashboardProps } from './MediaMtxDashboard'

// Re-export the provider + hook so hosts that want to wire data into their own
// shell (not the bundled AppShell) can still consume MediaMTX state.
export { MediaMtxProvider, useMediaMtx } from './lib/context'
export type { MediaMtxProviderProps, MediaMtxContextValue } from './lib/context'

// Re-export every React Query hook so hosts can build custom widgets.
export * from './hooks/queries'

// Re-export the generated MediaMTX types for type-safe host integration.
export type {
  GlobalConf,
  HLSMuxer,
  Path,
  PathConf,
  PathSource,
  RTMPConn,
  RTSPConn,
  RTSPSession,
  SRTConn,
  WebRTCSession,
} from './lib/mediamtx/generated'

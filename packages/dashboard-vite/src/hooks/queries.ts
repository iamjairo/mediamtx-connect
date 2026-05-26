import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  GlobalConf,
  HLSMuxer,
  HLSMuxerList,
  Path,
  PathConf,
  PathConfList,
  PathList,
  RTMPConn,
  RTMPConnList,
  RTSPConn,
  RTSPConnList,
  RTSPSession,
  RTSPSessionList,
  SRTConn,
  SRTConnList,
  WebRTCSession,
  WebRTCSessionList,
} from '../lib/mediamtx/generated'

import { useMediaMtx } from '../lib/context'

interface PageParams {
  page?: number
  itemsPerPage?: number
}

function unwrap<T>(p: Promise<{ data: T }>): Promise<T> {
  return p.then(r => r.data)
}

// ------------- Global config -------------

export function useGlobalConfig() {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<GlobalConf>({
    queryKey: ['globalConfig'],
    queryFn: () => unwrap(api.v3.configGlobalGet()),
    refetchInterval: pollIntervalMs,
  })
}

export function useUpdateGlobalConfig() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: GlobalConf) => api.v3.configGlobalSet(config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['globalConfig'] }),
  })
}

// ------------- Path defaults -------------

export function usePathDefaults() {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<PathConf>({
    queryKey: ['pathDefaults'],
    queryFn: () => unwrap(api.v3.configPathDefaultsGet()),
    refetchInterval: pollIntervalMs,
  })
}

export function useUpdatePathDefaults() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PathConf) => api.v3.configPathDefaultsPatch(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pathDefaults'] }),
  })
}

// ------------- Path configs -------------

export function usePathConfigs(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<PathConfList>({
    queryKey: ['pathConfigs', params],
    queryFn: () => unwrap(api.v3.configPathsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function usePathConfig(name: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<PathConf>({
    queryKey: ['pathConfig', name],
    queryFn: () => unwrap(api.v3.configPathsGet(name!)),
    enabled: !!name,
  })
}

export function useCreatePathConfig() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, data }: { name: string, data: PathConf }) =>
      api.v3.configPathsAdd(name, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pathConfigs'] }),
  })
}

export function usePatchPathConfig() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, data }: { name: string, data: PathConf }) =>
      api.v3.configPathsPatch(name, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['pathConfigs'] })
      qc.invalidateQueries({ queryKey: ['pathConfig', variables.name] })
    },
  })
}

export function useReplacePathConfig() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, data }: { name: string, data: PathConf }) =>
      api.v3.configPathsReplace(name, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['pathConfigs'] })
      qc.invalidateQueries({ queryKey: ['pathConfig', variables.name] })
    },
  })
}

export function useDeletePathConfig() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.v3.configPathsDelete(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pathConfigs'] }),
  })
}

// ------------- Runtime paths -------------

export function usePaths(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<PathList>({
    queryKey: ['paths', params],
    queryFn: () => unwrap(api.v3.pathsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function usePath(name: string | undefined) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<Path>({
    queryKey: ['path', name],
    queryFn: () => unwrap(api.v3.pathsGet(name!)),
    enabled: !!name,
    refetchInterval: pollIntervalMs,
  })
}

// ------------- HLS muxers -------------

export function useHlsMuxers(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<HLSMuxerList>({
    queryKey: ['hlsMuxers', params],
    queryFn: () => unwrap(api.v3.hlsMuxersList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useHlsMuxer(name: string | undefined) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<HLSMuxer>({
    queryKey: ['hlsMuxer', name],
    queryFn: () => unwrap(api.v3.hlsMuxersGet(name!)),
    enabled: !!name,
    refetchInterval: pollIntervalMs,
  })
}

// ------------- RTSP / RTSPS sessions + conns -------------

export function useRtspConns(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<RTSPConnList>({
    queryKey: ['rtspConns', params],
    queryFn: () => unwrap(api.v3.rtspConnsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useRtspConn(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<RTSPConn>({
    queryKey: ['rtspConn', id],
    queryFn: () => unwrap(api.v3.rtspConnsGet(id!)),
    enabled: !!id,
  })
}

export function useRtspSessions(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<RTSPSessionList>({
    queryKey: ['rtspSessions', params],
    queryFn: () => unwrap(api.v3.rtspSessionsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useRtspSession(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<RTSPSession>({
    queryKey: ['rtspSession', id],
    queryFn: () => unwrap(api.v3.rtspSessionsGet(id!)),
    enabled: !!id,
  })
}

export function useKickRtspSession() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.v3.rtspSessionsKick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtspSessions'] }),
  })
}

export function useRtspsConns(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<RTSPConnList>({
    queryKey: ['rtspsConns', params],
    queryFn: () => unwrap(api.v3.rtspsConnsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useRtspsConn(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<RTSPConn>({
    queryKey: ['rtspsConn', id],
    queryFn: () => unwrap(api.v3.rtspsConnsGet(id!)),
    enabled: !!id,
  })
}

export function useRtspsSessions(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<RTSPSessionList>({
    queryKey: ['rtspsSessions', params],
    queryFn: () => unwrap(api.v3.rtspsSessionsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useRtspsSession(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<RTSPSession>({
    queryKey: ['rtspsSession', id],
    queryFn: () => unwrap(api.v3.rtspsSessionsGet(id!)),
    enabled: !!id,
  })
}

export function useKickRtspsSession() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.v3.rtspsSessionsKick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtspsSessions'] }),
  })
}

// ------------- RTMP / RTMPS -------------

export function useRtmpConns(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<RTMPConnList>({
    queryKey: ['rtmpConns', params],
    queryFn: () => unwrap(api.v3.rtmpConnsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useRtmpConn(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<RTMPConn>({
    queryKey: ['rtmpConn', id],
    queryFn: () => unwrap(api.v3.rtmpConnectionsGet(id!)),
    enabled: !!id,
  })
}

export function useKickRtmpConn() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.v3.rtmpConnsKick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtmpConns'] }),
  })
}

export function useRtmpsConns(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<RTMPConnList>({
    queryKey: ['rtmpsConns', params],
    queryFn: () => unwrap(api.v3.rtmpsConnsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useRtmpsConn(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<RTMPConn>({
    queryKey: ['rtmpsConn', id],
    queryFn: () => unwrap(api.v3.rtmpsConnectionsGet(id!)),
    enabled: !!id,
  })
}

export function useKickRtmpsConn() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.v3.rtmpsConnsKick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtmpsConns'] }),
  })
}

// ------------- SRT -------------

export function useSrtConns(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<SRTConnList>({
    queryKey: ['srtConns', params],
    queryFn: () => unwrap(api.v3.srtConnsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useSrtConn(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<SRTConn>({
    queryKey: ['srtConn', id],
    queryFn: () => unwrap(api.v3.srtConnsGet(id!)),
    enabled: !!id,
  })
}

export function useKickSrtConn() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.v3.srtConnsKick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['srtConns'] }),
  })
}

// ------------- WebRTC -------------

export function useWebrtcSessions(params: PageParams = {}) {
  const { api, pollIntervalMs } = useMediaMtx()
  return useQuery<WebRTCSessionList>({
    queryKey: ['webrtcSessions', params],
    queryFn: () => unwrap(api.v3.webrtcSessionsList(params)),
    refetchInterval: pollIntervalMs,
  })
}

export function useWebrtcSession(id: string | undefined) {
  const { api } = useMediaMtx()
  return useQuery<WebRTCSession>({
    queryKey: ['webrtcSession', id],
    queryFn: () => unwrap(api.v3.webrtcSessionsGet(id!)),
    enabled: !!id,
  })
}

export function useKickWebrtcSession() {
  const { api } = useMediaMtx()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.v3.webrtcSessionsKick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webrtcSessions'] }),
  })
}

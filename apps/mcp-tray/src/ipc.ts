// Typed wrapper around tauri::invoke commands the Rust shell exposes.
// All command names mirror functions in src-tauri/src/lib.rs.

import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export interface McpSettings {
  mediaMtxUrl: string
  apiUsername?: string
  apiPassword?: string
  allowKick: boolean
  autoStart: boolean
  transport: 'stdio' | 'http'
  httpPort?: number
}

export type ServerState = 'stopped' | 'starting' | 'running' | 'error'

export async function loadSettings(): Promise<McpSettings | null> {
  return invoke('load_settings')
}

export async function saveSettings(settings: McpSettings): Promise<void> {
  await invoke('save_settings', { settings })
}

export async function startServer(): Promise<void> {
  await invoke('start_server')
}

export async function stopServer(): Promise<void> {
  await invoke('stop_server')
}

export async function restartServer(): Promise<void> {
  await invoke('restart_server')
}

export async function getServerState(): Promise<ServerState> {
  return invoke('get_server_state')
}

export async function getLogs(maxLines = 500): Promise<string[]> {
  return invoke('get_logs', { maxLines })
}

export async function getView(): Promise<'settings' | 'logs' | null> {
  // Tauri sets the URL hash to identify which window we're in.
  const hash = window.location.hash.replace(/^#/, '')
  if (hash === 'logs') return 'logs'
  if (hash === 'settings') return 'settings'
  return null
}

export function onLogLine(callback: (line: string) => void): () => void {
  let unlisten: (() => void) | null = null
  listen<string>('mcp:log', e => callback(e.payload)).then((u) => {
    unlisten = u
  })
  return () => {
    if (unlisten) unlisten()
  }
}

export function onStateChange(callback: (state: ServerState) => void): () => void {
  let unlisten: (() => void) | null = null
  listen<ServerState>('mcp:state', e => callback(e.payload)).then((u) => {
    unlisten = u
  })
  return () => {
    if (unlisten) unlisten()
  }
}

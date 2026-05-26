import { LazyStore } from '@tauri-apps/plugin-store'

export interface DesktopSettings {
  baseUrl: string
  username?: string
  password?: string
  allowDestructive?: boolean
  pollIntervalMs?: number
}

const STORE_FILE = 'settings.json'
const STORE_KEY = 'connection'

const store = new LazyStore(STORE_FILE)

export async function loadSettings(): Promise<DesktopSettings | null> {
  const value = await store.get<DesktopSettings>(STORE_KEY)
  return value ?? null
}

export async function saveSettings(settings: DesktopSettings): Promise<void> {
  await store.set(STORE_KEY, settings)
  await store.save()
}

export async function clearSettings(): Promise<void> {
  await store.delete(STORE_KEY)
  await store.save()
}

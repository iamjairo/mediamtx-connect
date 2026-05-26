import { PageLayout } from '@/shared/components/layout'

import { SessionsTabs } from './sessions-tabs'

const tabs = [
  { href: '/sessions/rtsp', label: 'RTSP' },
  { href: '/sessions/rtsps', label: 'RTSPS' },
  { href: '/sessions/rtmp', label: 'RTMP' },
  { href: '/sessions/rtmps', label: 'RTMPS' },
  { href: '/sessions/srt', label: 'SRT' },
  { href: '/sessions/webrtc', label: 'WebRTC' },
]

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout header="Sessions" subHeader="Live connections and sessions across every protocol.">
      <div className="space-y-6">
        <SessionsTabs tabs={tabs} />
        {children}
      </div>
    </PageLayout>
  )
}

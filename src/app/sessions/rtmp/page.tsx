import { RtmpSessionsPage } from '@/features/sessions/rtmp'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams
  return <RtmpSessionsPage page={Math.max(1, Number(page) || 1)} />
}

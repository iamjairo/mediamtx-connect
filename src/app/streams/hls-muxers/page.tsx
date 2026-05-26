import { HlsMuxersPage } from '@/features/streams/hls-muxers'
import { PageLayout } from '@/shared/components/layout'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams
  return (
    <PageLayout header="HLS Muxers" subHeader="Active HLS muxers and their request stats.">
      <HlsMuxersPage page={Math.max(1, Number(page) || 1)} />
    </PageLayout>
  )
}

import { PathConfigList } from '@/features/streams/path-config'
import { PageLayout } from '@/shared/components/layout'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams
  return (
    <PageLayout header="Paths" subHeader="MediaMTX path configuration. Add, edit and remove streams.">
      <PathConfigList page={Math.max(1, Number(page) || 1)} />
    </PageLayout>
  )
}

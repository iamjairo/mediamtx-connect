import { PathDetailPage } from '@/features/streams/path-detail'
import { PageLayout } from '@/shared/components/layout'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ name: string }>
}

export default async function Page({ params }: PageProps) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  return (
    <PageLayout header={decoded} subHeader="Live path detail.">
      <PathDetailPage name={decoded} />
    </PageLayout>
  )
}

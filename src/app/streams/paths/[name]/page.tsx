import { PathConfigEditPage } from '@/features/streams/path-config'
import { PageLayout } from '@/shared/components/layout'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ name: string }>
}

export default async function Page({ params }: PageProps) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  return (
    <PageLayout header="Edit Path" subHeader="Patch or replace this path's configuration.">
      <PathConfigEditPage name={decoded} />
    </PageLayout>
  )
}

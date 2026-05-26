import { PathConfigForm } from '@/features/streams/path-config'
import { PageLayout } from '@/shared/components/layout'

export const dynamic = 'force-dynamic'

export default function NewPathPage() {
  return (
    <PageLayout header="New Path" subHeader="Add a new MediaMTX path.">
      <PathConfigForm mode="create" />
    </PageLayout>
  )
}

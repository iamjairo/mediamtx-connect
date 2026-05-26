import { SrtSessionsPage } from '@/features/sessions/srt'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams
  return <SrtSessionsPage page={Math.max(1, Number(page) || 1)} />
}

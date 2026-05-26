import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'

import { getPathDefaults } from '../actions/getPathDefaults'
import { PathDefaultsForm } from './PathDefaultsForm'

export const dynamic = 'force-dynamic'

export async function PathDefaultsPage() {
  const defaults = await getPathDefaults()
  if (!defaults) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cannot load path defaults</AlertTitle>
        <AlertDescription>
          MediaMTX did not return path defaults. Check the server and API
          credentials on the Client Config page.
        </AlertDescription>
      </Alert>
    )
  }
  return <PathDefaultsForm defaults={defaults} />
}

import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'

export function ConnectionError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Cannot reach MediaMTX</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

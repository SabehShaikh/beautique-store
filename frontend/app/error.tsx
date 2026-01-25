'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
      </div>
      <p className="text-muted-foreground max-w-md text-center">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

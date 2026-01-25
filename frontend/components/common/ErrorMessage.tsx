import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center',
        className
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}

export function PageError({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <ErrorMessage message={message} onRetry={onRetry} />
    </div>
  )
}

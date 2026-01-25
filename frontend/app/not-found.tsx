import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileQuestion className="h-12 w-12" />
      </div>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  )
}

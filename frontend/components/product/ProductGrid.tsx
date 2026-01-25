'use client'

import { cn } from '@/lib/utils'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { PackageOpen } from 'lucide-react'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useWishlist } from '@/hooks/useWishlist'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/button'
import { Heart, ArrowLeft } from 'lucide-react'
import type { Product } from '@/types'

export default function WishlistPage() {
  const { items, initialized } = useWishlist()

  if (!initialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Save items you love by clicking the heart icon on products.
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Convert wishlist items to products for ProductGrid
  const products: Product[] = items.map((item) => ({
    id: item.product_id,
    name: item.name,
    regular_price: item.price,
    images: [item.image],
    category: item.category,
    is_bestseller: false,
    is_active: true,
    description: '',
    sizes: [],
    colors: [],
    created_at: '',
    updated_at: '',
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <ProductGrid products={products} />

      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  )
}

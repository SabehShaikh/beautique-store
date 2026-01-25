'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn, formatPrice, calculateDiscount, getEffectivePrice } from '@/lib/utils'
import { useWishlist } from '@/hooks/useWishlist'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const inWishlist = isInWishlist(product.id)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const getCategoryLabel = (category: string) => {
    // Handle both slug format and proper case format from backend
    const labels: Record<string, string> = {
      'maxi': 'Maxi',
      'Maxi': 'Maxi',
      'lehanga-choli': 'Lehanga Choli',
      'Lehanga Choli': 'Lehanga Choli',
      'long-shirt': 'Long Shirt',
      'Long Shirt': 'Long Shirt',
      'shalwar-kameez': 'Shalwar Kameez',
      'Shalwar Kameez': 'Shalwar Kameez',
      'gharara': 'Gharara',
      'Gharara': 'Gharara',
    }
    return labels[category] || category
  }

  const hasDiscount = product.sale_price != null && product.sale_price < product.regular_price
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.regular_price, product.sale_price!)
    : 0

  return (
    <Card className={cn('group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1', className)}>
      <Link href={`/products/detail/${product.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-50">
          <Image
            src={product.images[0] || '/images/placeholder.png'}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Discount Badge - top right */}
          {hasDiscount && (
            <Badge className="absolute right-2 top-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold z-10">
              {discountPercentage}% OFF
            </Badge>
          )}
          {/* Bestseller Badge - top left */}
          {product.is_bestseller && (
            <Badge className="absolute left-2 top-2 bg-primary">
              Bestseller
            </Badge>
          )}
          {/* Wishlist Button - below discount badge or top right if no discount */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute bg-white/80 backdrop-blur-sm transition-all duration-200',
              'hover:bg-white hover:text-red-500 hover:scale-110',
              hasDiscount ? 'right-2 top-12' : 'right-2 top-2',
              inWishlist && 'text-red-500'
            )}
            onClick={handleWishlistToggle}
          >
            <Heart
              className={cn('h-5 w-5 transition-transform', inWishlist && 'fill-current')}
            />
          </Button>
        </div>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2 text-xs">
            {getCategoryLabel(product.category)}
          </Badge>
          <h3 className="font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {/* Price Display */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.regular_price)}
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(product.sale_price!)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

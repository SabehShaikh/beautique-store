'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { productsApi } from '@/lib/api'
import { formatPrice, calculateDiscount, getEffectivePrice } from '@/lib/utils'
import { SIZES } from '@/lib/constants'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { useToast } from '@/hooks/use-toast'
import { ImageGallery } from '@/components/product/ImageGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ShoppingCart, Minus, Plus, ArrowLeft, Check } from 'lucide-react'
import type { Product, ProductSize } from '@/types'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [colorVariants, setColorVariants] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { addToCart, isInCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await productsApi.getProduct(id)
        setProduct(data)
        // Pre-select first available size and color
        if (data.sizes.length > 0) {
          setSelectedSize(data.sizes[0])
        }
        if (data.colors.length > 0) {
          setSelectedColor(data.colors[0])
        }

        // Fetch color variants - search for products with similar base name
        // Extract base name (e.g., "Liana Maxi" from "Liana Maxi - White")
        const baseName = data.name.split(' - ')[0].trim()
        if (baseName.length >= 3) {
          try {
            const response = await productsApi.getProducts({ search: baseName, limit: 10 })
            // Filter out current product and get color variants
            const variants = (response?.items || []).filter(
              (p) => p.id !== data.id && p.is_active
            )
            setColorVariants(variants.slice(0, 6)) // Show max 6 variants
          } catch {
            // Ignore errors fetching variants
          }
        }
      } catch (err) {
        setError('Product not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    notFound()
  }

  const inWishlist = isInWishlist(product.id)
  const inCart = selectedSize && selectedColor
    ? isInCart(product.id, selectedSize, selectedColor)
    : false

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: 'Selection required',
        description: 'Please select a size and color',
        variant: 'destructive',
      })
      return
    }

    addToCart(product, selectedSize, selectedColor, quantity)
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist`,
      })
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/products"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <ImageGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {getCategoryLabel(product.category)}
              </Badge>
              {product.is_bestseller && (
                <Badge className="bg-primary">Bestseller</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Price Display with Sale Pricing */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {product.sale_price != null && product.sale_price < product.regular_price ? (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.regular_price)}
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.sale_price)}
                  </span>
                  <Badge className="bg-red-500 text-white rounded-full px-3 py-1">
                    {calculateDiscount(product.regular_price, product.sale_price)}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.regular_price)}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Size Selection */}
          <div>
            <h2 className="font-semibold mb-3">Size</h2>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const isAvailable = product.sizes.includes(size)
                const isSelected = selectedSize === size
                return (
                  <Button
                    key={size}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className="min-w-[48px]"
                  >
                    {size}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h2 className="font-semibold mb-3">Color</h2>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color
                return (
                  <Button
                    key={color}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                    className="relative"
                  >
                    {color}
                    {isSelected && (
                      <Check className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h2 className="font-semibold mb-3">Quantity</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium text-lg">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {inCart ? 'Add More' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlistToggle}
              className={inWishlist ? 'text-red-500 hover:text-red-500' : ''}
            >
              <Heart
                className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`}
              />
            </Button>
          </div>

          {/* Selection Hint */}
          {(!selectedSize || !selectedColor) && (
            <p className="text-sm text-muted-foreground">
              Please select a size and color to add to cart
            </p>
          )}
        </div>
      </div>

      {/* Available in Other Colors Section */}
      {colorVariants.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available in Other Colors</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {colorVariants.map((variant) => {
              const variantHasDiscount = variant.sale_price != null && variant.sale_price < variant.regular_price
              return (
                <Link
                  key={variant.id}
                  href={`/products/detail/${variant.id}`}
                  className="flex-shrink-0"
                >
                  <Card className="w-[180px] hover:shadow-md transition-shadow">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <Image
                        src={variant.images[0] || '/images/placeholder.png'}
                        alt={variant.name}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                      {variantHasDiscount && (
                        <Badge className="absolute right-1 top-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                          {calculateDiscount(variant.regular_price, variant.sale_price!)}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {variant.colors[0] || 'Color'}
                      </Badge>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {variantHasDiscount ? (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(variant.regular_price)}
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {formatPrice(variant.sale_price!)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(variant.regular_price)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-9 w-3/4 mb-2" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-px w-full" />
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <div>
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-12" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-20" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

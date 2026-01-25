'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  className?: string
}

export function CartItem({ item, className }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.id)
  }

  const lineTotal = item.price * item.quantity

  return (
    <div
      className={cn(
        'flex gap-4 rounded-lg border p-4',
        className
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/detail/${item.product_id}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md"
      >
        <Image
          src={item.image || '/images/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/detail/${item.product_id}`}
            className="font-medium hover:text-primary transition-colors line-clamp-1"
          >
            {item.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            Size: {item.size} | Color: {item.color}
          </p>
          <p className="text-sm font-medium text-primary">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Line Total (visible on larger screens) */}
      <div className="hidden sm:flex items-center">
        <p className="font-semibold">{formatPrice(lineTotal)}</p>
      </div>
    </div>
  )
}

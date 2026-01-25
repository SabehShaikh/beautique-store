'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, initialized } = useCart()

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
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <div className="pt-4">
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}

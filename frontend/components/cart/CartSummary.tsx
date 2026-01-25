'use client'

import Link from 'next/link'
import { cn, formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface CartSummaryProps {
  className?: string
}

export function CartSummary({ className }: CartSummaryProps) {
  const { items, getCartTotal, getCartCount } = useCart()

  const subtotal = getCartTotal()
  const itemCount = getCartCount()

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Items ({itemCount})
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-green-600">Calculated at checkout</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Subtotal</span>
          <span className="text-primary">{formatPrice(subtotal)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className="w-full"
          size="lg"
          disabled={items.length === 0}
        >
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

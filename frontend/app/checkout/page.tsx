'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/use-toast'
import { ordersApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { STORAGE_KEYS } from '@/lib/constants'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CheckoutFormValues } from '@/lib/validation'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCartTotal, clearCart, initialized } = useCart()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect to cart if empty
  useEffect(() => {
    if (initialized && items.length === 0) {
      router.replace('/cart')
    }
  }, [initialized, items.length, router])

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
    return null // Will redirect
  }

  const handleSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)

    try {
      // Prepare order data
      const orderData = {
        customer_name: data.customer_name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email || undefined,
        address: data.address,
        city: data.city,
        country: data.country || undefined,
        notes: data.notes || undefined,
        payment_method: data.payment_method,
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
        })),
      }

      // Create order
      const response = await ordersApi.createOrder(orderData)

      // Store order data temporarily for confirmation page
      const orderConfirmationData = {
        ...response,
        payment_method: data.payment_method,
        items: items,
      }
      localStorage.setItem(
        STORAGE_KEYS.ORDER_DATA,
        JSON.stringify(orderConfirmationData)
      )

      // Clear cart
      clearCart()

      toast({
        title: 'Order placed successfully',
        description: `Your order ID is ${response.order_id}`,
      })

      // Redirect to confirmation
      router.push(`/order-confirmation/${response.order_id}`)
    } catch (error: any) {
      toast({
        title: 'Failed to place order',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtotal = getCartTotal()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/cart"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.image || '/images/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} / {item.color} x {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Calculated after order</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Shipping costs will be confirmed via WhatsApp based on your
                location.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

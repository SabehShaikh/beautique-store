'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { STORAGE_KEYS, PAYMENT_DETAILS, getWhatsAppLink } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Copy,
  MessageCircle,
  ArrowRight,
  Home,
  Package,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>
}

interface OrderData {
  order_id: string
  payment_method: 'Easypaisa' | 'Meezan Bank'
  items: Array<{
    name: string
    size: string
    color: string
    quantity: number
    price: number
  }>
  total?: number
}

export default function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderId } = use(params)
  const { toast } = useToast()
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  useEffect(() => {
    // Get order data from localStorage
    const stored = localStorage.getItem(STORAGE_KEYS.ORDER_DATA)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setOrderData(data)
        // Clear stored data after reading
        localStorage.removeItem(STORAGE_KEYS.ORDER_DATA)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const paymentMethod = orderData?.payment_method || 'Easypaisa'
  const paymentInfo = PAYMENT_DETAILS[paymentMethod]

  const total = orderData?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    toast({
      title: 'Copied',
      description: 'Order ID copied to clipboard',
    })
  }

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(paymentInfo.accountNumber)
    toast({
      title: 'Copied',
      description: 'Account number copied to clipboard',
    })
  }

  const whatsappMessage = `Hi! I've placed an order with ID: ${orderId}. I'm sending my payment confirmation.`

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-muted-foreground">
          Thank you for your order. Please complete the payment to proceed.
        </p>
      </div>

      {/* Order ID */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-2xl font-bold font-mono">{orderId}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyOrderId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Payment Instructions
            <Badge variant="secondary">
              {paymentMethod === 'Easypaisa' ? 'Easypaisa' : 'Meezan Bank'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Details */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Title</span>
              <span className="font-medium">{paymentInfo.accountTitle}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">
                  {paymentInfo.accountNumber}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyAccountNumber}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {'bankName' in paymentInfo && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Name</span>
                  <span className="font-medium">{paymentInfo.bankName}</span>
                </div>
              </>
            )}
            {'iban' in paymentInfo && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IBAN</span>
                  <span className="font-mono font-medium text-xs sm:text-sm">{paymentInfo.iban}</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount to Pay</span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold mb-2">Steps to Complete Payment:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {paymentInfo.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {/* WhatsApp Button */}
          <Button asChild className="w-full" size="lg">
            <a
              href={getWhatsAppLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Send Payment Confirmation via WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Order Summary */}
      {orderData?.items && orderData.items.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">
                      {item.size} / {item.color} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What Happens Next */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Complete Payment</p>
                <p className="text-sm text-muted-foreground">
                  Transfer the exact amount using the details above
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Send Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  Screenshot your payment and send via WhatsApp
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll verify and process your order within 24 hours
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                4
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Your order will be dispatched and delivered
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/track-order">
            <Package className="mr-2 h-4 w-4" />
            Track Your Order
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  )
}

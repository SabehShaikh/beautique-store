'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ordersApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { trackOrderSchema, type TrackOrderFormValues } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react'
import type { OrderTracking } from '@/types'

export default function TrackOrderPage() {
  const [orderData, setOrderData] = useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const form = useForm<TrackOrderFormValues>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: {
      order_id: '',
      phone: '',
    },
  })

  const handleSubmit = async (data: TrackOrderFormValues) => {
    setIsLoading(true)
    setError('')
    setOrderData(null)

    try {
      const result = await ordersApi.trackOrder(data.order_id, data.phone)
      setOrderData(result)
    } catch (err: any) {
      if (err.status === 404) {
        setError('Order not found. Please check your Order ID and phone number.')
      } else {
        setError(err.message || 'Failed to track order. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Package className="h-5 w-5" />
      case 'processing':
        return <Clock className="h-5 w-5" />
      case 'ready':
        return <CheckCircle className="h-5 w-5" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
      paid: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      'not-started': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'out-for-delivery': 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const orderStatuses = ['received', 'processing', 'ready', 'delivered']
  const currentStatusIndex = orderData
    ? orderStatuses.indexOf(orderData.order_status)
    : -1

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">
          Enter your order ID and phone number to track your order
        </p>
      </div>

      {/* Track Order Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="BQ-20260122-ABC"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Track Order
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Order Tracking Results */}
      {orderData && (
        <div className="space-y-6">
          {/* Order Status Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-mono">{orderData.order_id}</span>
                <Badge className={getStatusColor(orderData.order_status)}>
                  {orderData.order_status.charAt(0).toUpperCase() +
                    orderData.order_status.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Ordered on {formatDate(orderData.order_date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Progress Steps */}
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {orderStatuses.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    return (
                      <div
                        key={status}
                        className={`flex flex-col items-center flex-1 ${
                          index !== 0 ? 'ml-2' : ''
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          {getStatusIcon(status)}
                        </div>
                        <span className="text-xs mt-2 text-center">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-10">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge className={getStatusColor(orderData.payment_status)}>
                    {orderData.payment_status.charAt(0).toUpperCase() +
                      orderData.payment_status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Status</p>
                  <Badge className={getStatusColor(orderData.delivery_status)}>
                    {orderData.delivery_status
                      .split('-')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </Badge>
                </div>
                {orderData.estimated_delivery && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Delivery
                    </p>
                    <p className="font-medium">
                      {formatDate(orderData.estimated_delivery)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="font-medium text-lg text-primary">
                    {formatPrice(orderData.total_amount)}
                  </p>
                </div>
              </div>

              {orderData.tracking_notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tracking Notes
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {orderData.tracking_notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          {orderData.items && orderData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

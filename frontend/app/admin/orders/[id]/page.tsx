'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  DELIVERY_STATUSES,
  getWhatsAppLink,
} from '@/lib/constants'
import { orderStatusUpdateSchema, type OrderStatusUpdateFormValues } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, MessageCircle, Loader2, Save } from 'lucide-react'
import type { OrderDetail } from '@/types'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<OrderStatusUpdateFormValues>({
    resolver: zodResolver(orderStatusUpdateSchema),
    defaultValues: {
      payment_status: undefined,
      order_status: undefined,
      delivery_status: undefined,
      estimated_delivery: '',
      tracking_notes: '',
    },
  })

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await adminApi.orders.getOne(id)
        setOrder(data)
        // Set form defaults from order data
        form.reset({
          payment_status: data.payment_status,
          order_status: data.order_status,
          delivery_status: data.delivery_status,
          estimated_delivery: data.estimated_delivery || '',
          tracking_notes: data.tracking_notes || '',
        })
      } catch (error) {
        toast({
          title: 'Order not found',
          description: 'The order you are looking for does not exist.',
          variant: 'destructive',
        })
        router.push('/admin/orders')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
  }, [id, router, toast, form])

  const handleSubmit = async (data: OrderStatusUpdateFormValues) => {
    setIsSaving(true)
    try {
      const updatedOrder = await adminApi.orders.updateStatus(id, {
        payment_status: data.payment_status,
        order_status: data.order_status,
        delivery_status: data.delivery_status,
        estimated_delivery: data.estimated_delivery || undefined,
        tracking_notes: data.tracking_notes || undefined,
      })
      setOrder(updatedOrder)
      toast({
        title: 'Order updated',
        description: 'The order status has been updated successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Failed to update order',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Received': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-yellow-100 text-yellow-800',
      'Ready': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Pending': 'bg-gray-100 text-gray-800',
      'Paid': 'bg-blue-100 text-blue-800',
      'Verified': 'bg-green-100 text-green-800',
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return null
  }

  const whatsappMessage = `Hi! Regarding your order ${order.order_id}:\n\nOrder Status: ${order.order_status}\nPayment Status: ${order.payment_status}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-mono">{order.order_id}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <a
            href={getWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact Customer
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd className="font-medium">{order.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{order.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">WhatsApp</dt>
                  <dd className="font-medium">{order.whatsapp}</dd>
                </div>
                {order.email && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="font-medium">{order.email}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">Address</dt>
                  <dd className="font-medium">
                    {order.address}
                    <br />
                    {order.city}
                    {order.country && `, ${order.country}`}
                  </dd>
                </div>
                {order.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-muted-foreground">Order Notes</dt>
                    <dd className="font-medium">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Update Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="payment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DELIVERY_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_delivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Delivery</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tracking_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tracking Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add tracking information..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32 mt-1" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

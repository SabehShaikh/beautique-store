'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { adminApi, downloadBlob } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { PAGINATION, ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/common/Pagination'
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
import { Download, Eye, Filter, Loader2 } from 'lucide-react'
import type { OrderListItem, OrderListParams, PaymentStatus, OrderStatus } from '@/types'

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState<{
    payment_status?: PaymentStatus
    order_status?: OrderStatus
  }>({})

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: OrderListParams = {
        page: currentPage,
        limit: PAGINATION.ADMIN_LIMIT,
        payment_status: filters.payment_status || undefined,
        order_status: filters.order_status || undefined,
      }
      const response = await adminApi.orders.getAll(params)
      setOrders(response?.items || [])
      setTotalPages(response?.total_pages || 1)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filters])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleFilterChange = (key: 'payment_status' | 'order_status', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value as PaymentStatus | OrderStatus,
    }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const blob = await adminApi.orders.exportCSV(filters)
      const filename = `orders-${new Date().toISOString().split('T')[0]}.csv`
      downloadBlob(blob, filename)
      toast({
        title: 'Export successful',
        description: 'Orders have been exported to CSV',
      })
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export orders',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
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
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <Button onClick={handleExportCSV} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select
          value={filters.payment_status || 'all'}
          onValueChange={(value) => handleFilterChange('payment_status', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {PAYMENT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.order_status || 'all'}
          onValueChange={(value) => handleFilterChange('order_status', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.payment_status || filters.order_status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({})
              setCurrentPage(1)
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.order_id}
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.phone}
                  </TableCell>
                  <TableCell>{formatPrice(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(order.payment_status)}
                      variant="secondary"
                    >
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(order.order_status)}
                      variant="secondary"
                    >
                      {order.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.order_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" title="View">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {filters.payment_status || filters.order_status
                ? 'No orders match your filters'
                : 'No orders yet'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

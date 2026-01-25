/**
 * Order Types for Beautique Store
 */

export type PaymentMethod = 'easypaisa' | 'meezan-bank'

export type PaymentStatus = 'pending' | 'paid' | 'verified'

export type OrderStatus = 'received' | 'processing' | 'ready' | 'delivered' | 'cancelled'

export type DeliveryStatus = 'not-started' | 'in-progress' | 'out-for-delivery' | 'delivered'

export interface OrderItem {
  product_id: string
  name: string
  size: string
  color: string
  quantity: number
  price: number
  image?: string
}

export interface OrderCreate {
  customer_name: string
  phone: string
  whatsapp: string
  email?: string
  address: string
  city: string
  country?: string
  notes?: string
  items: OrderItem[]
  payment_method: PaymentMethod
}

export interface OrderResponse {
  id: string
  order_id: string
  customer_name: string
  phone: string
  whatsapp: string
  email?: string
  address: string
  city: string
  country?: string
  notes?: string
  items: OrderItem[]
  total_amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  delivery_status: DeliveryStatus
  estimated_delivery?: string
  tracking_notes?: string
  order_date: string
  created_at: string
  updated_at: string
}

export interface OrderTracking {
  order_id: string
  order_date: string
  items: OrderItem[]
  total_amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  delivery_status: DeliveryStatus
  estimated_delivery?: string
  tracking_notes?: string
}

export interface OrderDetail extends OrderResponse {}

export interface OrderListItem {
  id: string
  order_id: string
  customer_name: string
  phone: string
  total_amount: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  order_date: string
}

export interface OrderListParams {
  page?: number
  limit?: number
  payment_status?: PaymentStatus
  order_status?: OrderStatus
  start_date?: string
  end_date?: string
  search?: string
}

export interface OrderListResponse {
  items: OrderListItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface OrderStatusUpdate {
  payment_status?: PaymentStatus
  order_status?: OrderStatus
  delivery_status?: DeliveryStatus
  estimated_delivery?: string
  tracking_notes?: string
}

// Form Data Types
export interface CheckoutFormData {
  customer_name: string
  phone: string
  whatsapp: string
  email?: string
  address: string
  city: string
  country?: string
  notes?: string
  payment_method: PaymentMethod
}

export interface TrackOrderFormData {
  order_id: string
  phone: string
}

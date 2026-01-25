/**
 * Admin Types for Beautique Store
 */

export interface Admin {
  id: string
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface AdminLogin {
  username: string
  password: string
}

export interface AdminLoginResponse {
  access_token: string
  token_type: string
  admin: Admin
}

export interface DashboardAnalytics {
  total_orders: number
  total_revenue: number
  pending_payments: number
  orders_ready: number
  orders_by_status: {
    received: number
    processing: number
    ready: number
    delivered: number
    cancelled: number
  }
  orders_by_payment_status: {
    pending: number
    paid: number
    verified: number
  }
  recent_orders: RecentOrder[]
}

export interface RecentOrder {
  id: string
  order_id: string
  customer_name: string
  total_amount: number
  payment_status: string
  order_status: string
  order_date: string
}

// Auth Context Types
export interface AuthState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: AdminLogin) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

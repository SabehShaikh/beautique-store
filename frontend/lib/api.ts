/**
 * API Client for Beautique Store
 */

import { STORAGE_KEYS, API_ROUTES } from './constants'
import type {
  Product,
  ProductListParams,
  ProductListResponse,
  ProductCreate,
  ProductUpdate,
  OrderCreate,
  OrderResponse,
  OrderTracking,
  OrderListParams,
  OrderListResponse,
  OrderDetail,
  OrderStatusUpdate,
  AdminLogin,
  AdminLoginResponse,
  DashboardAnalytics,
  ApiError,
  CategoriesResponse,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Custom API Error
 */
export class ApiClientError extends Error {
  status: number
  details?: Record<string, string[]>

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Base fetch wrapper with error handling
 */
async function apiClient<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
    requiresAuth?: boolean
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, requiresAuth = false } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (requiresAuth) {
    const token = getAuthToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.detail || errorData.message || getErrorMessage(response.status)
      throw new ApiClientError(message, response.status, errorData.errors)
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T

    return JSON.parse(text) as T
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    throw new ApiClientError('Network error. Please check your connection.', 0)
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    422: 'Validation failed. Please check your input.',
    500: 'Something went wrong on our end. Please try again later.',
  }
  return messages[status] || 'An unexpected error occurred.'
}

/**
 * Build query string from params
 */
function buildQueryString<T extends object>(params: T): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// ============================================
// PUBLIC API - Products
// ============================================

export const productsApi = {
  /**
   * Get list of products with optional filters
   */
  getProducts: async (params?: ProductListParams): Promise<ProductListResponse> => {
    const query = params ? buildQueryString(params) : ''
    return apiClient<ProductListResponse>(`${API_ROUTES.PRODUCTS}${query}`)
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    return apiClient<Product>(API_ROUTES.PRODUCT(id))
  },

  /**
   * Get bestseller products
   */
  getBestsellers: async (limit = 8): Promise<Product[]> => {
    // Use dedicated bestsellers endpoint that filters by is_bestseller=true
    const response = await apiClient<{ products: Product[] }>(
      `${API_ROUTES.PRODUCTS}/bestsellers?limit=${limit}`
    )
    return response?.products ?? []
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<CategoriesResponse> => {
    return apiClient<CategoriesResponse>(API_ROUTES.CATEGORIES)
  },
}

// ============================================
// PUBLIC API - Orders
// ============================================

export const ordersApi = {
  /**
   * Create a new order
   */
  createOrder: async (data: OrderCreate): Promise<OrderResponse> => {
    return apiClient<OrderResponse>(API_ROUTES.ORDERS, {
      method: 'POST',
      body: data,
    })
  },

  /**
   * Track order by order ID and phone
   */
  trackOrder: async (orderId: string, phone: string): Promise<OrderTracking> => {
    const query = buildQueryString({ order_id: orderId, phone })
    return apiClient<OrderTracking>(`${API_ROUTES.TRACK_ORDER}${query}`)
  },
}

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  /**
   * Admin login
   */
  login: async (credentials: AdminLogin): Promise<AdminLoginResponse> => {
    return apiClient<AdminLoginResponse>(API_ROUTES.ADMIN_LOGIN, {
      method: 'POST',
      body: credentials,
    })
  },

  /**
   * Get dashboard analytics
   */
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    return apiClient<DashboardAnalytics>(API_ROUTES.ADMIN_DASHBOARD, {
      requiresAuth: true,
    })
  },

  // Products Management
  products: {
    /**
     * Get admin products list
     */
    getAll: async (params?: ProductListParams): Promise<ProductListResponse> => {
      const query = params ? buildQueryString(params) : ''
      return apiClient<ProductListResponse>(`${API_ROUTES.ADMIN_PRODUCTS}${query}`, {
        requiresAuth: true,
      })
    },

    /**
     * Get single product
     */
    getOne: async (id: string): Promise<Product> => {
      return apiClient<Product>(API_ROUTES.ADMIN_PRODUCT(id), {
        requiresAuth: true,
      })
    },

    /**
     * Create new product
     */
    create: async (data: ProductCreate): Promise<Product> => {
      return apiClient<Product>(API_ROUTES.ADMIN_PRODUCTS, {
        method: 'POST',
        body: data,
        requiresAuth: true,
      })
    },

    /**
     * Update product
     */
    update: async (id: string, data: Partial<ProductCreate>): Promise<Product> => {
      return apiClient<Product>(API_ROUTES.ADMIN_PRODUCT(id), {
        method: 'PUT',
        body: data,
        requiresAuth: true,
      })
    },

    /**
     * Delete product (soft delete - sets is_active=false)
     */
    delete: async (id: string): Promise<void> => {
      return apiClient<void>(API_ROUTES.ADMIN_PRODUCT(id), {
        method: 'DELETE',
        requiresAuth: true,
      })
    },

    /**
     * Permanently delete product (removes from database)
     */
    permanentDelete: async (id: string): Promise<void> => {
      return apiClient<void>(`${API_ROUTES.ADMIN_PRODUCT(id)}/permanent`, {
        method: 'DELETE',
        requiresAuth: true,
      })
    },

    /**
     * Upload product images
     */
    uploadImages: async (id: string, files: File[]): Promise<{ images: string[] }> => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const token = getAuthToken()
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.ADMIN_PRODUCT_IMAGES(id)}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiClientError(
          errorData.detail || 'Failed to upload images',
          response.status
        )
      }

      return response.json()
    },
  },

  // Orders Management
  orders: {
    /**
     * Get orders list
     */
    getAll: async (params?: OrderListParams): Promise<OrderListResponse> => {
      const query = params ? buildQueryString(params) : ''
      return apiClient<OrderListResponse>(`${API_ROUTES.ADMIN_ORDERS}${query}`, {
        requiresAuth: true,
      })
    },

    /**
     * Get single order
     */
    getOne: async (id: string): Promise<OrderDetail> => {
      return apiClient<OrderDetail>(API_ROUTES.ADMIN_ORDER(id), {
        requiresAuth: true,
      })
    },

    /**
     * Update order status
     */
    updateStatus: async (id: string, data: OrderStatusUpdate): Promise<OrderDetail> => {
      return apiClient<OrderDetail>(API_ROUTES.ADMIN_ORDER_STATUS(id), {
        method: 'PATCH',
        body: data,
        requiresAuth: true,
      })
    },

    /**
     * Export orders to CSV
     */
    exportCSV: async (params?: OrderListParams): Promise<Blob> => {
      const token = getAuthToken()
      const query = params ? buildQueryString(params) : ''

      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.ADMIN_ORDERS_EXPORT}${query}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      if (!response.ok) {
        throw new ApiClientError('Failed to export orders', response.status)
      }

      return response.blob()
    },
  },
}

// Helper to download blob as file
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

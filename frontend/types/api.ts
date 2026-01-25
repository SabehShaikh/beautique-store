/**
 * API Types for Beautique Store
 */

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ValidationError {
  field: string
  message: string
}

export interface CategoriesResponse {
  categories: CategoryInfo[]
}

export interface CategoryInfo {
  value: string
  label: string
  count: number
}

// API Request Options
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  requiresAuth?: boolean
}

// Error codes mapping
export const API_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  422: 'Validation failed. Please check your input.',
  500: 'Something went wrong on our end. Please try again later.',
}

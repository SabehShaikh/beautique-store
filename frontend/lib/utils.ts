import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price in PKR currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format date in readable format
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Check if we're running on the client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Calculate discount percentage
 * Returns the percentage discount rounded to nearest integer
 */
export function calculateDiscount(regularPrice: number, salePrice: number): number {
  if (regularPrice <= 0 || salePrice >= regularPrice) return 0
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100)
}

/**
 * Get effective price (sale_price if available, else regular_price)
 */
export function getEffectivePrice(regularPrice: number, salePrice?: number | null): number {
  return salePrice != null ? salePrice : regularPrice
}

/**
 * Category mapping between URL format (kebab-case) and backend format (proper case)
 * URL: "gharara", "lehanga-choli", etc.
 * Backend: "Gharara", "Lehanga Choli", etc.
 */
const CATEGORY_URL_TO_BACKEND: Record<string, string> = {
  'maxi': 'Maxi',
  'lehanga-choli': 'Lehanga Choli',
  'long-shirt': 'Long Shirt',
  'shalwar-kameez': 'Shalwar Kameez',
  'gharara': 'Gharara',
}

const CATEGORY_BACKEND_TO_URL: Record<string, string> = {
  'Maxi': 'maxi',
  'Lehanga Choli': 'lehanga-choli',
  'Long Shirt': 'long-shirt',
  'Shalwar Kameez': 'shalwar-kameez',
  'Gharara': 'gharara',
}

/**
 * Convert URL category format to backend format
 * "gharara" -> "Gharara"
 * "lehanga-choli" -> "Lehanga Choli"
 */
export function categoryUrlToBackend(urlCategory: string | undefined | null): string | undefined {
  if (!urlCategory) return undefined
  return CATEGORY_URL_TO_BACKEND[urlCategory.toLowerCase()] || urlCategory
}

/**
 * Convert backend category format to URL format
 * "Gharara" -> "gharara"
 * "Lehanga Choli" -> "lehanga-choli"
 */
export function categoryBackendToUrl(backendCategory: string | undefined | null): string | undefined {
  if (!backendCategory) return undefined
  return CATEGORY_BACKEND_TO_URL[backendCategory] || backendCategory.toLowerCase().replace(/\s+/g, '-')
}

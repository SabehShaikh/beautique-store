/**
 * Product Categories
 */
export const CATEGORIES = [
  { value: 'maxi', label: 'Maxi' },
  { value: 'lehanga-choli', label: 'Lehanga Choli' },
  { value: 'long-shirt', label: 'Long Shirt' },
  { value: 'shalwar-kameez', label: 'Shalwar Kameez' },
  { value: 'gharara', label: 'Gharara' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

/**
 * Product Sizes
 */
export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const
export type SizeValue = (typeof SIZES)[number]

/**
 * Common Colors
 */
export const COLORS = [
  'Red',
  'Blue',
  'Green',
  'Black',
  'White',
  'Pink',
  'Purple',
  'Yellow',
  'Orange',
  'Gold',
  'Silver',
  'Maroon',
  'Navy',
  'Beige',
  'Brown',
] as const

/**
 * Payment Methods (Only Easypaisa and Meezan Bank) - values must match backend enum exactly
 */
export const PAYMENT_METHODS = [
  { value: 'Easypaisa', label: 'Easypaisa' },
  { value: 'Meezan Bank', label: 'Meezan Bank Transfer' },
] as const

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]['value']

/**
 * Payment Details for instructions
 */
export const PAYMENT_DETAILS = {
  'Easypaisa': {
    accountTitle: 'Muhammad Arshad',
    accountNumber: '0333 2306429',
    instructions: [
      'Open your Easypaisa app',
      'Select "Send Money"',
      'Enter the account number: 0333 2306429',
      'Enter the exact order amount',
      'Take a screenshot of the confirmation',
      'Send the screenshot via WhatsApp to 0313-2306429',
    ],
  },
  'Meezan Bank': {
    accountTitle: 'MUHAMMAD ARSHAD',
    accountNumber: '01820100017061',
    iban: 'PK68MEZN0001820100017061',
    bankName: 'Meezan Bank Limited',
    instructions: [
      'Transfer the exact order amount to the account details above',
      'Account Holder: MUHAMMAD ARSHAD',
      'Account Number: 01820100017061',
      'IBAN: PK68MEZN0001820100017061',
      'Take a screenshot of the transfer confirmation',
      'Send the screenshot via WhatsApp to 0313-2306429',
    ],
  },
} as const

/**
 * Order Statuses - values must match backend enum exactly
 */
export const ORDER_STATUSES = [
  { value: 'Received', label: 'Received' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Ready', label: 'Ready' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
] as const

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]['value']

/**
 * Payment Statuses - values must match backend enum exactly
 */
export const PAYMENT_STATUSES = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Verified', label: 'Verified' },
] as const

export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number]['value']

/**
 * Delivery Statuses - values must match backend enum exactly
 */
export const DELIVERY_STATUSES = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Out for Delivery', label: 'Out for Delivery' },
  { value: 'Delivered', label: 'Delivered' },
] as const

export type DeliveryStatusValue = (typeof DELIVERY_STATUSES)[number]['value']

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  CART: 'beautique-cart',
  WISHLIST: 'beautique-wishlist',
  AUTH_TOKEN: 'beautique-admin-token',
  ORDER_DATA: 'beautique-order-data',
} as const

/**
 * API Routes
 */
export const API_ROUTES = {
  // Public
  PRODUCTS: '/api/products',
  PRODUCT: (id: string) => `/api/products/${id}`,
  CATEGORIES: '/api/categories',
  ORDERS: '/api/orders',
  TRACK_ORDER: '/api/orders/track',

  // Admin
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_PRODUCT: (id: string) => `/api/admin/products/${id}`,
  ADMIN_PRODUCT_IMAGES: (id: string) => `/api/admin/products/${id}/images`,
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_ORDER: (id: string) => `/api/admin/orders/${id}`,
  ADMIN_ORDER_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
  ADMIN_ORDERS_EXPORT: '/api/admin/orders/export',
  ADMIN_DASHBOARD: '/api/admin/analytics/dashboard',
} as const

/**
 * Store Contact Information
 */
export const STORE_INFO = {
  name: 'Beautique Store',
  address: 'Shop No. G-157, Saima Mall & Residency',
  city: 'Karachi',
  country: 'Pakistan',
  fullAddress: 'Shop No. G-157, Saima Mall & Residency, Karachi, Pakistan',
} as const

/**
 * Phone Numbers (NO EMAIL)
 */
export const PHONE_NUMBERS = {
  primary: '0313 2306429',
  secondary: '0333 2306429',
  whatsapp: '923132306429', // With country code, no +
} as const

/**
 * Business Hours
 */
export const BUSINESS_HOURS = [
  { days: 'Monday - Thursday', hours: '1:00 PM - 10:00 PM' },
  { days: 'Friday', hours: '3:00 PM - 10:00 PM' },
  { days: 'Saturday', hours: '1:00 PM - 10:00 PM' },
  { days: 'Sunday', hours: '3:00 PM - 10:00 PM' },
] as const

/**
 * Social Media Links
 */
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/beautiiqueshop/',
  facebook: 'https://www.facebook.com/BeautiqueGallery',
} as const

/**
 * WhatsApp Number for payment verification
 */
export const WHATSAPP_NUMBER = '923132306429'

/**
 * Generate WhatsApp link
 */
export function getWhatsAppLink(message: string = ''): string {
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return encodedMessage
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    : `https://wa.me/${WHATSAPP_NUMBER}`
}

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  ADMIN_LIMIT: 20,
} as const

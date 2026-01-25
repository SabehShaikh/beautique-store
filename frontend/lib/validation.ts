/**
 * Zod Validation Schemas for Beautique Store
 */

import { z } from 'zod'

// Phone validation regex - accepts international formats
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/

// Phone validation with length check (10-15 digits)
const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number is too long')
  .refine((val) => {
    const digitsOnly = val.replace(/\D/g, '')
    return digitsOnly.length >= 10 && digitsOnly.length <= 15
  }, 'Phone number must have 10-15 digits')
  .refine((val) => phoneRegex.test(val), 'Invalid phone number format')

// ============================================
// Checkout Form Schema
// ============================================

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long'),
  phone: phoneSchema,
  whatsapp: phoneSchema,
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address is too long'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City name is too long'),
  country: z
    .string()
    .max(100, 'Country name is too long')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  payment_method: z.enum(['easypaisa', 'meezan-bank'], {
    message: 'Please select a payment method',
  }),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

// ============================================
// Login Form Schema
// ============================================

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ============================================
// Product Form Schema
// ============================================

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name cannot exceed 255 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  regular_price: z
    .number({ message: 'Regular price must be a valid number' })
    .min(0, 'Regular price cannot be negative')
    .max(1000000, 'Regular price cannot exceed 1,000,000'),
  sale_price: z
    .number({ message: 'Sale price must be a valid number' })
    .min(0, 'Sale price cannot be negative')
    .max(1000000, 'Sale price cannot exceed 1,000,000')
    .nullable()
    .optional(),
  category: z.enum(['maxi', 'lehanga-choli', 'long-shirt', 'shalwar-kameez', 'gharara'], {
    message: 'Please select a category',
  }),
  sizes: z
    .array(z.enum(['S', 'M', 'L', 'XL', 'XXL']))
    .min(1, 'Select at least one size'),
  colors: z
    .array(z.string().min(1))
    .min(1, 'Enter the product color'),
  is_bestseller: z.boolean(),
  is_active: z.boolean(),
}).refine((data) => {
  // Validate that sale_price is less than regular_price if provided
  if (data.sale_price != null && data.sale_price >= data.regular_price) {
    return false
  }
  return true
}, {
  message: 'Sale price must be less than regular price',
  path: ['sale_price'],
})

export type ProductFormValues = z.infer<typeof productSchema>

// ============================================
// Track Order Form Schema
// ============================================

// Order ID format: BQ-YYYYMMDD-XXX
const orderIdRegex = /^BQ-\d{8}-[A-Z0-9]{3,}$/i

export const trackOrderSchema = z.object({
  order_id: z
    .string()
    .min(1, 'Order ID is required')
    .refine(
      (val) => orderIdRegex.test(val),
      'Invalid Order ID format. Expected: BQ-YYYYMMDD-XXX'
    ),
  phone: phoneSchema,
})

export type TrackOrderFormValues = z.infer<typeof trackOrderSchema>

// ============================================
// Contact Form Schema (Phone only, no email)
// ============================================

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
})

export type ContactFormValues = z.infer<typeof contactSchema>

// ============================================
// Password Change Schema
// ============================================

export const passwordChangeSchema = z
  .object({
    current_password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    new_password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirm_password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

// ============================================
// Order Status Update Schema
// ============================================

export const orderStatusUpdateSchema = z.object({
  payment_status: z
    .enum(['pending', 'paid', 'verified'])
    .optional(),
  order_status: z
    .enum(['received', 'processing', 'ready', 'delivered', 'cancelled'])
    .optional(),
  delivery_status: z
    .enum(['not-started', 'in-progress', 'out-for-delivery', 'delivered'])
    .optional(),
  estimated_delivery: z
    .string()
    .optional()
    .or(z.literal('')),
  tracking_notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
})

export type OrderStatusUpdateFormValues = z.infer<typeof orderStatusUpdateSchema>

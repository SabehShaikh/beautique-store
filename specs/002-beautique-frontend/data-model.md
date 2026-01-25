# Data Model: Beautique Store Frontend

**Feature Branch**: `002-beautique-frontend`
**Created**: 2026-01-19
**Status**: Complete

## Overview

This document defines the TypeScript type definitions for the Beautique Store Frontend. Types mirror the backend Pydantic schemas to ensure API contract alignment.

---

## Enumerations

### Product Categories

```typescript
// types/product.ts
export const PRODUCT_CATEGORIES = [
  'Maxi',
  'Lehanga Choli',
  'Long Shirt',
  'Shalwar Kameez',
  'Gharara',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
```

### Product Sizes

```typescript
export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export type ProductSize = typeof PRODUCT_SIZES[number];
```

### Payment Methods

```typescript
// types/order.ts
export const PAYMENT_METHODS = [
  'Easypaisa',
  'Meezan Bank',
  'International Bank',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];
```

### Payment Status

```typescript
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Verified'] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];
```

### Order Status

```typescript
export const ORDER_STATUSES = [
  'Received',
  'Processing',
  'Ready',
  'Delivered',
  'Cancelled',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];
```

### Delivery Status

```typescript
export const DELIVERY_STATUSES = [
  'Not Started',
  'In Progress',
  'Out for Delivery',
  'Delivered',
] as const;

export type DeliveryStatus = typeof DELIVERY_STATUSES[number];
```

---

## Core Entities

### Product

```typescript
// types/product.ts

/**
 * Product entity returned from API
 */
export interface Product {
  id: string;                    // UUID
  name: string;                  // 3-255 chars
  category: ProductCategory;
  price: number;                 // 0-1,000,000
  description: string;           // 10-2000 chars
  images: string[];              // Array of Cloudinary URLs, 1-10 items
  sizes: ProductSize[];          // Available sizes, min 1
  colors: string[];              // Available colors, min 1
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;            // ISO datetime
  updated_at: string;            // ISO datetime
}

/**
 * Request body for creating a product (admin)
 */
export interface ProductCreate {
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  images: string[];
  sizes: ProductSize[];
  colors: string[];
  is_bestseller?: boolean;
}

/**
 * Request body for updating a product (admin)
 */
export interface ProductUpdate {
  name?: string;
  category?: ProductCategory;
  price?: number;
  description?: string;
  images?: string[];
  sizes?: ProductSize[];
  colors?: string[];
  is_bestseller?: boolean;
}

/**
 * Paginated product list response
 */
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Query parameters for product list
 */
export interface ProductListParams {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
```

---

### Order

```typescript
// types/order.ts

/**
 * Order item (cart snapshot at purchase time)
 */
export interface OrderItem {
  product_id: string;           // UUID
  name: string;
  size: string;
  color: string;
  quantity: number;             // >= 1
  price: number;                // Price at time of purchase
}

/**
 * Request body for creating an order
 */
export interface OrderCreate {
  customer_name: string;        // min 3 chars
  phone: string;                // 10-15 digits, international format
  whatsapp: string;             // 10-15 digits, international format
  email?: string;               // Optional, valid email
  address: string;              // min 10 chars
  city: string;                 // min 2 chars
  country?: string;             // Optional
  notes?: string;               // Optional, max 500 chars
  items: OrderItem[];           // min 1 item
  payment_method: PaymentMethod;
}

/**
 * Response from order creation
 */
export interface OrderResponse {
  id: string;                   // UUID
  order_id: string;             // Format: BQ-YYYYMMDD-XXX
  customer_name: string;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;           // ISO datetime
}

/**
 * Order tracking response (customer view)
 */
export interface OrderTracking {
  order_id: string;
  customer_name: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  delivery_status: DeliveryStatus;
  estimated_delivery?: string;  // ISO date
  tracking_notes?: string;
  order_date: string;           // ISO date
}

/**
 * Full order details (admin view)
 */
export interface OrderDetail {
  id: string;                   // UUID
  order_id: string;
  customer_name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  country?: string;
  notes?: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  delivery_status: DeliveryStatus;
  estimated_delivery?: string;
  tracking_notes?: string;
  order_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Order list item (summary view for admin list)
 */
export interface OrderListItem {
  id: string;
  order_id: string;
  customer_name: string;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
}

/**
 * Paginated order list response
 */
export interface OrderListResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Query parameters for order list
 */
export interface OrderListParams {
  payment_status?: PaymentStatus;
  order_status?: OrderStatus;
  page?: number;
  limit?: number;
}

/**
 * Request body for updating order status
 */
export interface OrderStatusUpdate {
  payment_status?: PaymentStatus;
  order_status?: OrderStatus;
  delivery_status?: DeliveryStatus;
  estimated_delivery?: string;   // ISO date
  tracking_notes?: string;
}
```

---

### Admin

```typescript
// types/admin.ts

/**
 * Admin login request
 */
export interface AdminLogin {
  username: string;
  password: string;
}

/**
 * Admin login response with JWT token
 */
export interface AdminLoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;           // Seconds (default: 86400 = 24 hours)
}

/**
 * Dashboard analytics data
 */
export interface DashboardAnalytics {
  total_orders: number;
  pending_payment: number;
  total_revenue: number;
  orders_by_status: Record<OrderStatus, number>;
}
```

---

## Client-Side State Types

### Cart

```typescript
// types/cart.ts

/**
 * Cart item (stored in localStorage)
 */
export interface CartItem {
  productId: string;            // Product UUID
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;                // First product image URL
}

/**
 * Cart state
 */
export interface CartState {
  items: CartItem[];
  totalItems: number;           // Sum of quantities
  totalAmount: number;          // Sum of price * quantity
}

/**
 * Cart context actions
 */
export interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
}

export type CartContextType = CartState & CartActions;
```

### Wishlist

```typescript
// types/wishlist.ts

/**
 * Wishlist item (stored in localStorage)
 */
export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;              // ISO datetime
}

/**
 * Wishlist state
 */
export interface WishlistState {
  items: WishlistItem[];
}

/**
 * Wishlist context actions
 */
export interface WishlistActions {
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export type WishlistContextType = WishlistState & WishlistActions;
```

### Auth

```typescript
// types/auth.ts

/**
 * Auth state for admin panel
 */
export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth context actions
 */
export interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
}

export type AuthContextType = AuthState & AuthActions;
```

---

## API Error Types

```typescript
// types/api.ts

/**
 * Standard API error response
 */
export interface ApiError {
  detail: string | ValidationError[];
  status: number;
}

/**
 * Validation error detail (for 422 responses)
 */
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Categories list response
 */
export interface CategoriesResponse {
  categories: string[];
}
```

---

## UI Component Props Types

```typescript
// types/components.ts

/**
 * Pagination props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Product filter state
 */
export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sizes?: ProductSize[];
  colors?: string[];
  search?: string;
}

/**
 * Sort options for product list
 */
export type ProductSortOption = 'newest' | 'price-asc' | 'price-desc' | 'name';
```

---

## LocalStorage Keys

```typescript
// lib/constants.ts

export const STORAGE_KEYS = {
  CART: 'beautique_cart',
  WISHLIST: 'beautique_wishlist',
  ADMIN_TOKEN: 'admin_token',
} as const;
```

---

## Type Guards

```typescript
// lib/type-guards.ts

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    'status' in error
  );
}

export function isValidationError(detail: unknown): detail is ValidationError[] {
  return Array.isArray(detail) && detail.every(
    (item) => 'loc' in item && 'msg' in item && 'type' in item
  );
}
```

---

## Entity Relationships

```
┌─────────────┐     contains     ┌─────────────┐
│   Product   │◄────────────────│  CartItem   │
│             │                  │ (client)    │
└─────────────┘                  └─────────────┘
       │
       │ referenced by
       ▼
┌─────────────┐     contains     ┌─────────────┐
│   Order     │◄────────────────│  OrderItem  │
│             │                  │ (snapshot)  │
└─────────────┘                  └─────────────┘
       │
       │ managed by
       ▼
┌─────────────┐
│    Admin    │
│             │
└─────────────┘
```

**Notes**:
- CartItem references Product by productId (client-side)
- OrderItem is a snapshot of product data at purchase time (persisted)
- Admin manages Orders (status updates) and Products (CRUD)
- Wishlist is a simple list of product references (client-side only)

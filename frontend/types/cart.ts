/**
 * Cart Types for Beautique Store
 */

import type { Product } from './product'

export interface CartItem {
  id: string // Unique ID for this cart item
  product_id: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
  initialized: boolean
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] }

export interface CartContextType {
  items: CartItem[]
  initialized: boolean
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  isInCart: (productId: string, size: string, color: string) => boolean
}

// Helper type for adding items
export interface AddToCartParams {
  product: Product
  size: string
  color: string
  quantity?: number
}

/**
 * Wishlist Types for Beautique Store
 */

import type { Product, ProductCategory } from './product'

export interface WishlistItem {
  product_id: string
  name: string
  price: number
  image: string
  category: ProductCategory
  added_at: string
}

export interface WishlistState {
  items: WishlistItem[]
  initialized: boolean
}

export type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'HYDRATE'; payload: WishlistItem[] }

export interface WishlistContextType {
  items: WishlistItem[]
  initialized: boolean
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getWishlistCount: () => number
}

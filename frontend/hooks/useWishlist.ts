'use client'

import { useWishlistContext } from '@/context/WishlistContext'

/**
 * Hook to access wishlist functionality
 * Must be used within WishlistProvider
 */
export function useWishlist() {
  return useWishlistContext()
}

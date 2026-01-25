'use client'

import { useCartContext } from '@/context/CartContext'

/**
 * Hook to access cart functionality
 * Must be used within CartProvider
 */
export function useCart() {
  return useCartContext()
}

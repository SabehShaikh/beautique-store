'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { safeJsonParse, getEffectivePrice } from '@/lib/utils'
import type { WishlistItem, WishlistState, WishlistAction, WishlistContextType, Product } from '@/types'

const initialState: WishlistState = {
  items: [],
  initialized: false,
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      // Check if already in wishlist
      const exists = state.items.some(
        (item) => item.product_id === action.payload.product_id
      )
      if (exists) return state

      return { ...state, items: [...state.items, action.payload] }
    }

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter((item) => item.product_id !== action.payload),
      }

    case 'CLEAR_WISHLIST':
      return { ...state, items: [] }

    case 'HYDRATE':
      return { ...state, items: action.payload, initialized: true }

    default:
      return state
  }
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)

  // Hydrate wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST)
    const items = safeJsonParse<WishlistItem[]>(storedWishlist || '[]', [])
    dispatch({ type: 'HYDRATE', payload: items })
  }, [])

  // Persist wishlist to localStorage when items change
  useEffect(() => {
    if (state.initialized) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(state.items))
    }
  }, [state.items, state.initialized])

  const addToWishlist = useCallback((product: Product) => {
    // Use sale_price if available, otherwise use regular_price
    const effectivePrice = getEffectivePrice(product.regular_price, product.sale_price)
    const wishlistItem: WishlistItem = {
      product_id: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.images[0] || '',
      category: product.category,
      added_at: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem })
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId })
  }, [])

  const isInWishlist = useCallback(
    (productId: string) => {
      return state.items.some((item) => item.product_id === productId)
    },
    [state.items]
  )

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' })
  }, [])

  const getWishlistCount = useCallback(() => {
    return state.items.length
  }, [state.items])

  const value: WishlistContextType = {
    items: state.items,
    initialized: state.initialized,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
  }

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  )
}

export function useWishlistContext() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider')
  }
  return context
}

export { WishlistContext }

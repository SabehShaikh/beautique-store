'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { generateId, safeJsonParse, getEffectivePrice } from '@/lib/utils'
import type { CartItem, CartState, CartAction, CartContextType, Product } from '@/types'

const initialState: CartState = {
  items: [],
  initialized: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Check if item with same product, size, color exists
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product_id === action.payload.product_id &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      )

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...state.items]
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + action.payload.quantity,
        }
        return { ...state, items: updatedItems }
      }

      // Add new item
      return { ...state, items: [...state.items, action.payload] }
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'HYDRATE':
      return { ...state, items: action.payload, initialized: true }

    default:
      return state
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(STORAGE_KEYS.CART)
    const items = safeJsonParse<CartItem[]>(storedCart || '[]', [])
    dispatch({ type: 'HYDRATE', payload: items })
  }, [])

  // Persist cart to localStorage when items change
  useEffect(() => {
    if (state.initialized) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.items))
    }
  }, [state.items, state.initialized])

  const addToCart = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      // Use sale_price if available, otherwise use regular_price
      const effectivePrice = getEffectivePrice(product.regular_price, product.sale_price)
      const cartItem: CartItem = {
        id: generateId(),
        product_id: product.id,
        name: product.name,
        price: effectivePrice,
        image: product.images[0] || '',
        size,
        color,
        quantity,
      }
      dispatch({ type: 'ADD_TO_CART', payload: cartItem })
    },
    []
  )

  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId })
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const getCartTotal = useCallback(() => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [state.items])

  const getCartCount = useCallback(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }, [state.items])

  const isInCart = useCallback(
    (productId: string, size: string, color: string) => {
      return state.items.some(
        (item) =>
          item.product_id === productId &&
          item.size === size &&
          item.color === color
      )
    },
    [state.items]
  )

  const value: CartContextType = {
    items: state.items,
    initialized: state.initialized,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}

export { CartContext }

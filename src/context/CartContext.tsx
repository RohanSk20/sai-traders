'use client'

import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type { CartItem, Cart } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string } // product_id
  | { type: 'UPDATE_QUANTITY'; payload: { product_id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart }

interface CartContextType {
  cart: Cart
  addItem: (item: CartItem) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id &&
          item.variant_id === action.payload.variant_id
      )

      if (existingIndex >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + action.payload.quantity,
        }
        return { items: updatedItems, updatedAt: new Date().toISOString() }
      }

      return {
        items: [...state.items, action.payload],
        updatedAt: new Date().toISOString(),
      }
    }

    case 'REMOVE_ITEM': {
      return {
        items: state.items.filter((item) => item.product_id !== action.payload),
        updatedAt: new Date().toISOString(),
      }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          items: state.items.filter((item) => item.product_id !== action.payload.product_id),
          updatedAt: new Date().toISOString(),
        }
      }

      return {
        items: state.items.map((item) =>
          item.product_id === action.payload.product_id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        updatedAt: new Date().toISOString(),
      }
    }

    case 'CLEAR_CART': {
      return { items: [], updatedAt: new Date().toISOString() }
    }

    case 'LOAD_CART': {
      return action.payload
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'sai-traders-cart'

const initialCart: Cart = {
  items: [],
  updatedAt: new Date().toISOString(),
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Cart
        dispatch({ type: 'LOAD_CART', payload: parsed })
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Persist cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // Ignore storage errors
    }
  }, [cart])

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (product_id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: product_id })
  }

  const updateQuantity = (product_id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product_id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.sale_price ?? item.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

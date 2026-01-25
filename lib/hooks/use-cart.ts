'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import type { Product } from '@/lib/db/schema'

/**
 * Hook for managing shopping cart
 * Cart operations are just UI state - hasPendingChanges is only set when database writes happen
 */
export function useCart() {
  const cart = useCartStore()

  const addItem = (product: Product, quantity?: number) => {
    cart.addItem(product, quantity)
  }

  const removeItem = (productId: string) => {
    cart.removeItem(productId)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    cart.updateQuantity(productId, quantity)
  }

  const setPaymentMethod = (method: 'cash' | 'gcash' | 'utang') => {
    cart.setPaymentMethod(method)
  }

  const clearCart = () => {
    cart.clearCart()
  }

  return {
    // State
    items: cart.items,
    paymentMethod: cart.paymentMethod,
    subtotal: cart.subtotal,
    total: cart.total,

    // Actions (wrapped to mark pending changes)
    addItem,
    removeItem,
    updateQuantity,
    setPaymentMethod,
    clearCart
  }
}

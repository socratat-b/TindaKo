'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { useSyncStore } from '@/lib/stores/sync-store'
import type { Product } from '@/lib/db/schema'

/**
 * Hook for managing shopping cart
 * Automatically marks pending changes when cart is modified
 */
export function useCart() {
  const cart = useCartStore()
  const { setHasPendingChanges } = useSyncStore()

  const addItem = (product: Product, quantity?: number) => {
    cart.addItem(product, quantity)
    setHasPendingChanges(true)
  }

  const removeItem = (productId: string) => {
    cart.removeItem(productId)
    setHasPendingChanges(true)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    cart.updateQuantity(productId, quantity)
    setHasPendingChanges(true)
  }

  const setCustomer = (customerId: string | null) => {
    cart.setCustomer(customerId)
    setHasPendingChanges(true)
  }

  const setDiscount = (discount: number) => {
    cart.setDiscount(discount)
    setHasPendingChanges(true)
  }

  const setPaymentMethod = (method: 'cash' | 'gcash' | 'card') => {
    cart.setPaymentMethod(method)
    setHasPendingChanges(true)
  }

  const clearCart = () => {
    cart.clearCart()
    setHasPendingChanges(false)
  }

  return {
    // State
    items: cart.items,
    customerId: cart.customerId,
    discount: cart.discount,
    paymentMethod: cart.paymentMethod,
    subtotal: cart.subtotal,
    total: cart.total,

    // Actions (wrapped to mark pending changes)
    addItem,
    removeItem,
    updateQuantity,
    setCustomer,
    setDiscount,
    setPaymentMethod,
    clearCart
  }
}

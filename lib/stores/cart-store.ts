import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useSettingsStore } from './settings-store'
import type { Product, SaleItem } from '@/lib/db/schema'

interface CartItem extends SaleItem {
  stockQty: number
  barcode: string | null
}

interface CartState {
  items: CartItem[]
  paymentMethod: 'cash' | 'gcash' | 'utang'
  userId: string | null // Track which user owns this cart

  // Computed values
  subtotal: number
  total: number

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setPaymentMethod: (method: 'cash' | 'gcash' | 'utang') => void
  setUserId: (userId: string | null) => void
  clearCart: () => void
  syncCartWithProducts: (products: Product[]) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      paymentMethod: useSettingsStore.getState().defaultPaymentMethod,
      userId: null,
      subtotal: 0,
      total: 0,

      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find(item => item.productId === product.id)

        let newItems: CartItem[]

        if (existingItem) {
          // Update quantity of existing item
          const newQty = existingItem.quantity + quantity

          // Check if new quantity exceeds stock
          if (newQty > product.stockQty) {
            console.warn(`Cannot add more than ${product.stockQty} units of ${product.name}`)
            return
          }

          newItems = items.map(item =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: newQty,
                  total: newQty * item.unitPrice
                }
              : item
          )
        } else {
          // Add new item
          if (quantity > product.stockQty) {
            console.warn(`Cannot add more than ${product.stockQty} units of ${product.name}`)
            return
          }

          newItems = [
            ...items,
            {
              productId: product.id,
              productName: product.name,
              quantity,
              unitPrice: product.sellingPrice,
              total: quantity * product.sellingPrice,
              stockQty: product.stockQty,
              barcode: product.barcode
            }
          ]
        }

        const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
        const total = subtotal

        set({ items: newItems, subtotal, total })
      },

      removeItem: (productId) => {
        const newItems = get().items.filter(item => item.productId !== productId)
        const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
        const total = subtotal

        set({ items: newItems, subtotal, total })
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get()
        const item = items.find(i => i.productId === productId)

        if (!item) return

        // Check stock constraint
        if (quantity > item.stockQty) {
          console.warn(`Cannot set quantity to ${quantity}. Only ${item.stockQty} units available.`)
          return
        }

        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const newItems = items.map(i =>
          i.productId === productId
            ? { ...i, quantity, total: quantity * i.unitPrice }
            : i
        )

        const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
        const total = subtotal

        set({ items: newItems, subtotal, total })
      },

      setPaymentMethod: (paymentMethod) => {
        set({ paymentMethod })
      },

      setUserId: (userId) => {
        const currentUserId = get().userId

        // If userId changed, clear cart
        if (currentUserId && currentUserId !== userId) {
          console.log('User changed - clearing cart')
          set({
            items: [],
            paymentMethod: useSettingsStore.getState().defaultPaymentMethod,
            userId,
            subtotal: 0,
            total: 0
          })
        } else {
          set({ userId })
        }
      },

      clearCart: () => {
        set({
          items: [],
          paymentMethod: useSettingsStore.getState().defaultPaymentMethod,
          subtotal: 0,
          total: 0
        })
      },

      syncCartWithProducts: (products) => {
        const { items } = get()

        if (items.length === 0) return

        let hasStockAdjustments = false
        const adjustedProducts: string[] = []

        // Update cart items with fresh product data
        const updatedItems = items.map(cartItem => {
          const latestProduct = products.find(p => p.id === cartItem.productId)

          if (!latestProduct) {
            // Product was deleted, keep cart item as is but mark it
            return cartItem
          }

          // Adjust quantity if it exceeds available stock
          let adjustedQuantity = cartItem.quantity
          if (cartItem.quantity > latestProduct.stockQty) {
            adjustedQuantity = latestProduct.stockQty
            hasStockAdjustments = true
            adjustedProducts.push(latestProduct.name)
          }

          // Update with latest product data
          return {
            ...cartItem,
            quantity: adjustedQuantity,
            productName: latestProduct.name,
            unitPrice: latestProduct.sellingPrice,
            stockQty: latestProduct.stockQty,
            barcode: latestProduct.barcode,
            total: adjustedQuantity * latestProduct.sellingPrice
          }
        })

        // Filter out items with 0 quantity (out of stock)
        const filteredItems = updatedItems.filter(item => item.quantity > 0)

        const subtotal = filteredItems.reduce((sum, item) => sum + item.total, 0)
        const total = subtotal

        set({ items: filteredItems, subtotal, total })

        // Log stock adjustments for debugging
        if (hasStockAdjustments) {
          console.warn(`Cart quantities adjusted for: ${adjustedProducts.join(', ')}`)
        }
      }
    }),
    {
      name: 'tindako-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        paymentMethod: state.paymentMethod,
        userId: state.userId
      })
    }
  )
)

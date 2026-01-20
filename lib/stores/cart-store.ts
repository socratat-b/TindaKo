import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, SaleItem } from '@/lib/db/schema'

interface CartItem extends SaleItem {
  stockQty: number
  barcode: string | null
}

interface CartState {
  items: CartItem[]
  paymentMethod: 'cash' | 'gcash' | 'card'

  // Computed values
  subtotal: number
  total: number

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setPaymentMethod: (method: 'cash' | 'gcash' | 'card') => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      paymentMethod: 'cash',
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

      clearCart: () => {
        set({
          items: [],
          paymentMethod: 'cash',
          subtotal: 0,
          total: 0
        })
      }
    }),
    {
      name: 'tindako-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        paymentMethod: state.paymentMethod
      })
    }
  )
)

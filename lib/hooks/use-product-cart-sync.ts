'use client'

import { useEffect } from 'react'
import { useProductsStore } from '@/lib/stores/products-store'
import { useCartStore } from '@/lib/stores/cart-store'

/**
 * Hook for syncing cart items with latest product data
 * Ensures cart always shows current product names, prices, and stock
 */
export function useProductCartSync() {
  const { products } = useProductsStore()
  const syncCartWithProducts = useCartStore((state) => state.syncCartWithProducts)

  useEffect(() => {
    if (products.length > 0) {
      syncCartWithProducts(products)
    }
  }, [products, syncCartWithProducts])
}

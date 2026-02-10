import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Product, Category } from '@/lib/db/schema'

interface ProductsState {
  products: Product[]
  categories: Category[]
  isLoading: boolean
  
  // Actions
  loadProducts: (userId: string) => Promise<void>
  refreshProducts: (userId: string) => Promise<void>
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  categories: [],
  isLoading: true,
  
  loadProducts: async (userId: string) => {
    // Only show loading spinner on first load (no cached data)
    const { products: cached } = useProductsStore.getState()
    if (cached.length === 0) {
      set({ isLoading: true })
    }

    try {
      const [allProducts, allCategories] = await Promise.all([
        db.products.where('userId').equals(userId).toArray(),
        db.categories.where('userId').equals(userId).toArray(),
      ])

      const products = allProducts.filter((p) => !p.isDeleted)
      const categories = allCategories
        .filter((c) => !c.isDeleted)
        .sort((a, b) => a.sortOrder - b.sortOrder)

      set({ products, categories, isLoading: false })
    } catch (error) {
      console.error('[ProductsStore] Failed to load:', error)
      set({ isLoading: false })
    }
  },
  
  refreshProducts: async (userId: string) => {
    // Reload without setting isLoading (smoother UX)
    try {
      const [allProducts, allCategories] = await Promise.all([
        db.products.where('userId').equals(userId).toArray(),
        db.categories.where('userId').equals(userId).toArray(),
      ])

      const products = allProducts.filter((p) => !p.isDeleted)
      const categories = allCategories
        .filter((c) => !c.isDeleted)
        .sort((a, b) => a.sortOrder - b.sortOrder)

      set({ products, categories })
    } catch (error) {
      console.error('[ProductsStore] Failed to refresh:', error)
    }
  },
}))

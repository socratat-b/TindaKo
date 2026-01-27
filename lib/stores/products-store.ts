import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Product, Category } from '@/lib/db/schema'

interface ProductsState {
  products: Product[]
  categories: Category[]
  isLoading: boolean
  
  // Actions
  loadProducts: (storePhone: string) => Promise<void>
  refreshProducts: (storePhone: string) => Promise<void>
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  categories: [],
  isLoading: true,
  
  loadProducts: async (storePhone: string) => {
    set({ isLoading: true })

    try {
      const [allProducts, allCategories] = await Promise.all([
        db.products.where('storePhone').equals(storePhone).toArray(),
        db.categories.where('storePhone').equals(storePhone).toArray(),
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
  
  refreshProducts: async (storePhone: string) => {
    // Reload without setting isLoading (smoother UX)
    try {
      const [allProducts, allCategories] = await Promise.all([
        db.products.where('storePhone').equals(storePhone).toArray(),
        db.categories.where('storePhone').equals(storePhone).toArray(),
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

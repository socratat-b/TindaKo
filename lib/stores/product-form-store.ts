import { create } from 'zustand'
import type { Product } from '@/lib/db/schema'
import type { ProductFormData, CategoryFormData } from '@/lib/types'
import { PRESET_COLORS } from '@/lib/constants/colors'

interface ProductFormState {
  // Product form data
  formData: ProductFormData
  categoryFormData: CategoryFormData
  showCategoryForm: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setFormData: (data: Partial<ProductFormData>) => void
  setCategoryFormData: (data: Partial<CategoryFormData>) => void
  setShowCategoryForm: (show: boolean) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetForm: (defaultCategoryId?: string) => void
  initializeForm: (product: Product) => void
  resetCategoryForm: () => void
}

const initialFormData: ProductFormData = {
  name: '',
  barcode: '',
  categoryId: '',
  sellingPrice: '',
  stockQty: '0',
  lowStockThreshold: '10',
}

const initialCategoryFormData: CategoryFormData = {
  name: '',
  color: PRESET_COLORS[0],
}

export const useProductFormStore = create<ProductFormState>((set) => ({
  // Initial state
  formData: initialFormData,
  categoryFormData: initialCategoryFormData,
  showCategoryForm: false,
  isLoading: false,
  error: null,

  // Actions
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setCategoryFormData: (data) =>
    set((state) => ({
      categoryFormData: { ...state.categoryFormData, ...data },
    })),

  setShowCategoryForm: (show) => set({ showCategoryForm: show }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  resetForm: (defaultCategoryId = '') =>
    set({
      formData: { ...initialFormData, categoryId: defaultCategoryId },
      categoryFormData: initialCategoryFormData,
      showCategoryForm: false,
      error: null,
    }),

  initializeForm: (product) =>
    set({
      formData: {
        name: product.name,
        barcode: product.barcode || '',
        categoryId: product.categoryId,
        sellingPrice: product.sellingPrice.toString(),
        stockQty: product.stockQty.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
      },
      categoryFormData: initialCategoryFormData,
      showCategoryForm: false,
      error: null,
    }),

  resetCategoryForm: () =>
    set({
      categoryFormData: initialCategoryFormData,
      showCategoryForm: false,
      error: null,
    }),
}))

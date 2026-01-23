import { create } from 'zustand'
import type { QuickAddProductFormData, CategoryFormData } from '@/lib/types'
import { PRESET_COLORS } from '@/lib/constants/colors'

interface QuickAddProductState {
  // Product form data
  formData: QuickAddProductFormData
  categoryFormData: CategoryFormData
  showCategoryForm: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setFormData: (data: Partial<QuickAddProductFormData>) => void
  setCategoryFormData: (data: Partial<CategoryFormData>) => void
  setShowCategoryForm: (show: boolean) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetForm: (defaultCategoryId?: string) => void
  resetForNewProduct: (categoryId: string) => void
  resetCategoryForm: () => void
}

const initialFormData: QuickAddProductFormData = {
  name: '',
  categoryId: '',
  sellingPrice: '',
  stockQty: '0',
}

const initialCategoryFormData: CategoryFormData = {
  name: '',
  color: PRESET_COLORS[0],
}

export const useQuickAddProductStore = create<QuickAddProductState>((set) => ({
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

  resetForNewProduct: (categoryId) =>
    set({
      formData: {
        name: '',
        categoryId,
        sellingPrice: '',
        stockQty: '0',
      },
      error: null,
    }),

  resetCategoryForm: () =>
    set({
      categoryFormData: initialCategoryFormData,
      showCategoryForm: false,
      error: null,
    }),
}))

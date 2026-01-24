import { create } from 'zustand'
import type { AdjustmentFormData } from '@/lib/types'

interface AdjustmentFormState {
  // Form data
  formData: AdjustmentFormData
  isLoading: boolean
  error: string | null

  // Actions
  setFormData: (data: Partial<AdjustmentFormData>) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetForm: () => void
}

const initialFormData: AdjustmentFormData = {
  productId: '',
  type: 'in',
  quantity: '',
}

export const useAdjustmentFormStore = create<AdjustmentFormState>((set) => ({
  // Initial state
  formData: initialFormData,
  isLoading: false,
  error: null,

  // Actions
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  resetForm: () =>
    set({
      formData: initialFormData,
      error: null,
    }),
}))

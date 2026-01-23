import { create } from 'zustand'
import type { CustomerFormData } from '@/lib/types'

interface QuickAddCustomerState {
  // Form data
  formData: CustomerFormData
  error: string | null
  isLoading: boolean

  // Actions
  setFormData: (data: Partial<CustomerFormData>) => void
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
  reset: () => void
}

const initialFormData: CustomerFormData = {
  name: '',
  phone: '',
  address: '',
}

export const useQuickAddCustomerStore = create<QuickAddCustomerState>((set) => ({
  // Initial state
  formData: initialFormData,
  error: null,
  isLoading: false,

  // Actions
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setError: (error) => set({ error }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      formData: initialFormData,
      error: null,
      isLoading: false,
    }),
}))

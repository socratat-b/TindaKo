import { create } from 'zustand'

interface CheckoutState {
  // Form state
  amountPaid: string
  selectedCustomerId: string
  isProcessing: boolean
  isSuccess: boolean
  error: string | null
  isQuickAddOpen: boolean

  // Actions
  setAmountPaid: (amount: string) => void
  setSelectedCustomerId: (customerId: string) => void
  setIsProcessing: (processing: boolean) => void
  setIsSuccess: (success: boolean) => void
  setError: (error: string | null) => void
  setIsQuickAddOpen: (open: boolean) => void
  reset: () => void
}

const initialState = {
  amountPaid: '',
  selectedCustomerId: '',
  isProcessing: false,
  isSuccess: false,
  error: null,
  isQuickAddOpen: false,
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,

  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setSelectedCustomerId: (customerId) => set({ selectedCustomerId: customerId }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setIsSuccess: (success) => set({ isSuccess: success }),
  setError: (error) => set({ error }),
  setIsQuickAddOpen: (open) => set({ isQuickAddOpen: open }),
  reset: () => set(initialState),
}))

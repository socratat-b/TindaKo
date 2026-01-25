import { create } from 'zustand'
import type { UtangState } from '@/lib/types/utang'

export const useUtangStore = create<UtangState>((set) => ({
  // State
  searchQuery: '',
  isPaymentDialogOpen: false,
  isChargeDialogOpen: false,
  isCustomerFormOpen: false,
  selectedCustomerId: null,
  currentPage: 1,
  itemsPerPage: 10,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setIsPaymentDialogOpen: (open) => {
    set({ isPaymentDialogOpen: open })
    if (!open) set({ selectedCustomerId: null })
  },
  setIsChargeDialogOpen: (open) => {
    set({ isChargeDialogOpen: open })
    if (!open) set({ selectedCustomerId: null })
  },
  setIsCustomerFormOpen: (open) => set({ isCustomerFormOpen: open }),
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  setCurrentPage: (page) => set({ currentPage: page }),

  resetDialogs: () =>
    set({
      isPaymentDialogOpen: false,
      isChargeDialogOpen: false,
      isCustomerFormOpen: false,
      selectedCustomerId: null,
    }),
}))

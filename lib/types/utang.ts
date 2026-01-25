// Utang feature types
import type { Customer, UtangTransaction } from '@/lib/db/schema'

// Component Props
export interface UtangInterfaceProps {
  userId: string
}

export interface CustomersListProps {
  customers: Customer[]
  onRecordPayment: (customerId: string) => void
  onAddCharge: (customerId: string) => void
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

// Hook Parameters
export interface UseUtangParams {
  userId: string
}

// Store State
export interface UtangState {
  searchQuery: string
  isPaymentDialogOpen: boolean
  isChargeDialogOpen: boolean
  isCustomerFormOpen: boolean
  selectedCustomerId: string | null
  currentPage: number
  itemsPerPage: number

  // Actions
  setSearchQuery: (query: string) => void
  setIsPaymentDialogOpen: (open: boolean) => void
  setIsChargeDialogOpen: (open: boolean) => void
  setIsCustomerFormOpen: (open: boolean) => void
  setSelectedCustomerId: (id: string | null) => void
  setCurrentPage: (page: number) => void
  resetDialogs: () => void
}

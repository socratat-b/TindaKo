import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useUtangStore } from '@/lib/stores/utang-store'
import type { UseUtangParams } from '@/lib/types/utang'

export function useUtang({ userId }: UseUtangParams) {
  // Get state from store
  const {
    searchQuery,
    isPaymentDialogOpen,
    isChargeDialogOpen,
    isCustomerFormOpen,
    selectedCustomerId,
    currentPage,
    itemsPerPage,
    setSearchQuery,
    setIsPaymentDialogOpen,
    setIsChargeDialogOpen,
    setIsCustomerFormOpen,
    setSelectedCustomerId,
    setCurrentPage,
  } = useUtangStore()

  // Fetch all customers
  const customers = useLiveQuery(
    () =>
      db.customers
        .where('userId')
        .equals(userId)
        .filter((c) => !c.isDeleted)
        .sortBy('name'),
    [userId]
  )

  // Filter customers based on search
  const filteredCustomers = customers?.filter((customer) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    )
  })

  // Show all customers, not just those with outstanding balances
  // This way newly created customers appear immediately
  const outstandingCustomers = filteredCustomers || []

  // Calculate stats
  const totalOutstanding = customers?.reduce((sum, c) => sum + c.totalUtang, 0) || 0
  const customersWithDebt = customers?.filter((c) => c.totalUtang > 0).length || 0

  // Handlers
  const handleRecordPayment = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId)
    }
    setIsPaymentDialogOpen(true)
  }

  const handleAddCharge = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId)
    }
    setIsChargeDialogOpen(true)
  }

  const handleOpenCustomerForm = () => {
    setIsCustomerFormOpen(true)
  }

  return {
    // Data
    customers: customers || [],
    outstandingCustomers,
    totalOutstanding,
    customersWithDebt,

    // State
    searchQuery,
    isPaymentDialogOpen,
    isChargeDialogOpen,
    isCustomerFormOpen,
    selectedCustomerId,
    currentPage,
    itemsPerPage,

    // Actions
    setSearchQuery,
    setIsPaymentDialogOpen,
    setIsChargeDialogOpen,
    setIsCustomerFormOpen,
    setCurrentPage,
    handleRecordPayment,
    handleAddCharge,
    handleOpenCustomerForm,
  }
}

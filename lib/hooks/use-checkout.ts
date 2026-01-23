import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCheckoutStore } from '@/lib/stores/checkout-store'
import { db } from '@/lib/db'
import type { UseCheckoutParams } from '@/lib/types'

export function useCheckout({
  open,
  onOpenChange,
  onCheckout,
  userId,
  total,
  paymentMethod,
  clearCart,
}: UseCheckoutParams) {
  const {
    amountPaid,
    selectedCustomerId,
    isProcessing,
    isSuccess,
    error,
    isQuickAddOpen,
    setAmountPaid,
    setSelectedCustomerId,
    setIsProcessing,
    setIsSuccess,
    setError,
    setIsQuickAddOpen,
    reset,
  } = useCheckoutStore()

  // Fetch customers only on client side (fixes IndexedDB SSR error)
  const customers = useLiveQuery(
    () => {
      if (typeof window === 'undefined') return []
      return db.customers
        .where('userId')
        .equals(userId)
        .filter((c) => !c.isDeleted)
        .sortBy('name')
    },
    [userId]
  )

  const amountPaidNum = parseFloat(amountPaid) || 0
  const change = amountPaidNum - total
  const isUtangPayment = paymentMethod === 'utang'

  // Auto-fill amount for non-cash payments
  useEffect(() => {
    if (open) {
      if (paymentMethod === 'cash') {
        setAmountPaid('')
      } else if (paymentMethod === 'utang') {
        setAmountPaid('0')
      } else {
        setAmountPaid(total.toString())
      }
    }
  }, [paymentMethod, total, open, setAmountPaid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate utang payment requires customer selection
    if (isUtangPayment && !selectedCustomerId) {
      setError('Please select a customer for utang payment')
      return
    }

    // Validate amount paid for cash
    if (paymentMethod === 'cash' && amountPaidNum < total) {
      setError('Amount paid must be at least the total amount')
      return
    }

    setIsProcessing(true)

    try {
      // For utang, amount paid is 0 (full debt)
      // For gcash/card, amount paid equals total
      // For cash, use entered amount
      const finalAmountPaid = isUtangPayment ? 0 : paymentMethod === 'cash' ? amountPaidNum : total

      await onCheckout(finalAmountPaid, selectedCustomerId || null)

      setIsSuccess(true)

      // Clear cart and close dialog after a short delay
      setTimeout(() => {
        clearCart()
        reset()
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sale')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isProcessing && !isSuccess) {
      onOpenChange(newOpen)
      if (!newOpen) {
        reset()
      }
    }
  }

  const handleCustomerCreated = (customerId: string) => {
    setSelectedCustomerId(customerId)
  }

  return {
    // State
    amountPaid,
    selectedCustomerId,
    isProcessing,
    isSuccess,
    error,
    isQuickAddOpen,
    customers,
    amountPaidNum,
    change,
    isUtangPayment,

    // Actions
    setAmountPaid,
    setSelectedCustomerId,
    setIsQuickAddOpen,

    // Handlers
    handleSubmit,
    handleOpenChange,
    handleCustomerCreated,
  }
}

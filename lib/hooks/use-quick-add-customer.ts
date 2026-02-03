import { useEffect } from 'react'
import { useQuickAddCustomerStore } from '@/lib/stores/quick-add-customer-store'
import { createCustomer } from '@/lib/utils/customer-utils'
import { useSyncStore } from '@/lib/stores/sync-store'
import type { UseQuickAddCustomerParams } from '@/lib/types'

export function useQuickAddCustomer({
  open,
  onOpenChange,
  userId,
  onCustomerCreated,
}: UseQuickAddCustomerParams) {
  const {
    formData,
    error,
    isLoading,
    setFormData,
    setError,
    setIsLoading,
    reset,
  } = useQuickAddCustomerStore()

  const setHasPendingChanges = useSyncStore((state) => state.setHasPendingChanges)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await createCustomer({
        userId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      })

      if (result.success && result.customerId) {
        setHasPendingChanges(true)
        onCustomerCreated?.(result.customerId)
        reset()
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to create customer')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // State
    formData,
    error,
    isLoading,

    // Actions
    setFormData,

    // Handlers
    handleSubmit,
  }
}

import { useEffect } from 'react'
import { useAdjustmentFormStore } from '@/lib/stores/adjustment-form-store'
import { useSyncStore } from '@/lib/stores/sync-store'
import { createInventoryMovement } from '@/lib/actions/inventory'
import type { UseAdjustmentFormParams } from '@/lib/types'

export function useAdjustmentForm({
  storePhone,
  onOpenChange,
  open,
  initialProductId,
  mode = 'manual',
}: UseAdjustmentFormParams) {
  const { formData, isLoading, error, setFormData, setIsLoading, setError, resetForm } =
    useAdjustmentFormStore()

  const setHasPendingChanges = useSyncStore((state) => state.setHasPendingChanges)

  // Reset form when dialog opens, optionally with pre-selected product
  useEffect(() => {
    if (open) {
      resetForm()
      if (initialProductId) {
        setFormData({ productId: initialProductId, type: 'in' })
      } else if (mode === 'restock') {
        setFormData({ type: 'in' })
      }
    }
  }, [open, initialProductId, mode, resetForm, setFormData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const qty = parseInt(formData.quantity, 10)

    const result = await createInventoryMovement({
      storePhone,
      productId: formData.productId,
      type: formData.type,
      qty,
    })

    setIsLoading(false)

    if (result.success) {
      setHasPendingChanges(true)
      resetForm()
      onOpenChange(false)
    } else {
      setError(result.error || null)
    }
  }

  return {
    // State
    formData,
    isLoading,
    error,

    // Actions
    setFormData,
    handleSubmit,
  }
}

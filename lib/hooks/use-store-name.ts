import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { updateStoreNameAction } from '@/lib/actions/auth'
import { toast } from 'sonner'

/**
 * Hook for managing store name updates
 * Syncs between auth store, settings store, and database
 */
export function useStoreName() {
  const { phone, storeName: authStoreName, setAuth } = useAuthStore()
  const { storeName, updateSettings } = useSettingsStore()
  const [isUpdating, setIsUpdating] = useState(false)

  // Sync store name from auth to settings on mount
  useEffect(() => {
    if (authStoreName && storeName !== authStoreName) {
      updateSettings({ storeName: authStoreName })
    }
  }, [authStoreName, storeName, updateSettings])

  // Update store name locally (for responsive UI)
  const handleChange = useCallback(
    (newStoreName: string) => {
      updateSettings({ storeName: newStoreName })
    },
    [updateSettings]
  )

  // Save to database when user finishes editing
  const handleSave = useCallback(async () => {
    if (!phone || !storeName.trim() || storeName === authStoreName) return

    setIsUpdating(true)

    try {
      const result = await updateStoreNameAction(phone, storeName)

      if (result.success && result.storeName) {
        // Update auth store with new name
        setAuth(phone, result.storeName)
        toast.success('Store name updated')
      } else {
        toast.error(result.error || 'Failed to update store name')
        // Revert to auth store name on error
        if (authStoreName) {
          updateSettings({ storeName: authStoreName })
        }
      }
    } catch (error) {
      console.error('Failed to update store name:', error)
      toast.error('Failed to update store name')
      // Revert to auth store name on error
      if (authStoreName) {
        updateSettings({ storeName: authStoreName })
      }
    } finally {
      setIsUpdating(false)
    }
  }, [phone, storeName, authStoreName, setAuth, updateSettings])

  return {
    storeName,
    isUpdating,
    handleChange,
    handleSave,
  }
}

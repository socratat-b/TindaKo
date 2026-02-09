'use client'

import { useState } from 'react'
import { signOutAction } from '@/lib/actions/auth'
import { clearAllLocalData } from '@/lib/db'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCartStore } from '@/lib/stores/cart-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { useSyncStore } from '@/lib/stores/sync-store'

// Check if browser is online
function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { userId } = useAuth()
  const clearCart = useCartStore((state) => state.clearCart)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const resetSettings = useSettingsStore((state) => state.resetToDefaults)
  const hasPendingChanges = useSyncStore((state) => state.hasPendingChanges)
  const backup = useSyncStore((state) => state.backup)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  // Check online status when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setError(null)
      // Check online status
      setIsOffline(!isOnline())
    }

    onOpenChange(isOpen)
  }

  const handleLogout = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if online first - logout requires internet if there are pending changes
      const online = isOnline()

      if (!online && hasPendingChanges) {
        setError('Internet connection required to backup your changes. Please connect to the internet.')
        setIsLoading(false)
        return
      }

      // Only backup if there are pending changes (reuse Backup Now logic)
      if (hasPendingChanges) {
        await backup(userId)
      }

      // Step 1: Sign out from Supabase - fail early if this doesn't work
      const result = await signOutAction()
      if (!result.success) {
        setError(result.error || 'Failed to sign out. Please try again.')
        setIsLoading(false)
        return
      }

      // Step 2: Clear all local state (session is already gone)
      clearCart()
      clearAuth()
      resetSettings()
      await clearAllLocalData()
      localStorage.removeItem('lastLoggedInUserId')

      // Step 3: Redirect to login (client-side, session is already gone)
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to logout?
          </DialogDescription>
        </DialogHeader>

        {isOffline && hasPendingChanges ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <WifiOff className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <span className="block font-medium">No Internet Connection</span>
              <span className="block text-red-700 mt-1">
                Internet connection required to backup your changes. Please connect to the internet.
              </span>
            </div>
          </div>
        ) : hasPendingChanges ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Wifi className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <span className="block font-medium">Your data will be backed up</span>
              <span className="block text-blue-700 mt-1">
                All local changes will be automatically backed up to the cloud before logging out.
              </span>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant={hasPendingChanges ? 'default' : 'destructive'}
            onClick={handleLogout}
            disabled={isLoading || (isOffline && hasPendingChanges)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {hasPendingChanges ? 'Backing up & Logging out...' : 'Logging out...'}
              </>
            ) : (
              <>
                {hasPendingChanges ? (
                  <>
                    <Wifi className="mr-2 h-4 w-4" />
                    Backup & Logout
                  </>
                ) : (
                  'Logout'
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'
import { hasUnsyncedChanges, pushToCloud } from '@/lib/db/sync'
import { clearAllLocalData } from '@/lib/db'
import { isOnline } from '@/lib/auth/session-cache'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCartStore } from '@/lib/stores/cart-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Wifi, WifiOff, Loader2 } from 'lucide-react'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const router = useRouter()
  const { user } = useAuth()
  const clearCart = useCartStore((state) => state.clearCart)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // Check for unsynced changes when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && user) {
      setIsLoading(true)
      setError(null)

      try {
        // Check online status
        const online = await isOnline()
        setIsOffline(!online)

        // Check for unsynced changes
        const changes = await hasUnsyncedChanges(user.id)
        setHasChanges(changes)
      } catch (err) {
        console.error('Failed to check logout status:', err)
      } finally {
        setIsLoading(false)
      }
    }

    onOpenChange(isOpen)
  }

  const handleLogout = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if online first - logout requires internet
      const online = await isOnline()

      if (!online) {
        setError('Internet connection required to logout safely. Please connect to the internet.')
        setIsLoading(false)
        return
      }

      // Final check for unsynced changes before clearing data
      const hasUnsyncedData = await hasUnsyncedChanges(user.id)

      if (hasUnsyncedData) {
        // Auto-backup before logout
        console.log('Auto-backing up before logout...')
        await pushToCloud(user.id)
        console.log('Backup complete')
      }

      // Clear cart before logout
      clearCart()

      // Clear all local data to prevent leakage between users
      console.log('Clearing local data...')
      await clearAllLocalData()

      // Proceed with logout
      await logoutAction()
      router.push('/login')
    } catch (err) {
      console.error('Logout failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to logout')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logout</DialogTitle>
          <DialogDescription>
            {isOffline ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <WifiOff className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-900">
                  <p className="font-medium">No Internet Connection</p>
                  <p className="text-red-700 mt-1">
                    Internet connection required to logout safely. Please connect to the internet.
                  </p>
                </div>
              </div>
            ) : hasChanges ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium">You have unsaved changes</p>
                  <p className="text-amber-700 mt-1">
                    Your data will be automatically backed up to the cloud before logging out.
                  </p>
                </div>
              </div>
            ) : (
              'Are you sure you want to logout?'
            )}
          </DialogDescription>
        </DialogHeader>

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
            variant={hasChanges ? 'default' : 'destructive'}
            onClick={handleLogout}
            disabled={isLoading || isOffline}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {hasChanges ? 'Backing up & Logging out...' : 'Logging out...'}
              </>
            ) : (
              <>
                {hasChanges ? (
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

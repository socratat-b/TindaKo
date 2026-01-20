'use client'

import { useEffect } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useAuth } from '@/lib/hooks/use-auth'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { startPeriodicSync, stopPeriodicSync, setupSyncOnClose } = useSyncStore()

  useEffect(() => {
    // Only start sync if user is authenticated
    if (!user) {
      stopPeriodicSync()
      return
    }

    // Start periodic sync (every 5 minutes)
    startPeriodicSync(5 * 60 * 1000)

    // Setup sync on close/visibility change/focus
    const cleanupFn = setupSyncOnClose()

    // Cleanup on unmount
    return () => {
      stopPeriodicSync()
      if (cleanupFn) {
        cleanupFn()
      }
    }
  }, [user, startPeriodicSync, stopPeriodicSync, setupSyncOnClose])

  return <>{children}</>
}

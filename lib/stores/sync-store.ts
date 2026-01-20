import { create } from 'zustand'
import { syncAll } from '@/lib/db/sync'

type SyncStatus = 'idle' | 'syncing' | 'error'

interface SyncState {
  status: SyncStatus
  lastSyncTime: number | null
  error: string | null
  hasPendingChanges: boolean
  intervalId: NodeJS.Timeout | null

  // Actions
  sync: () => Promise<void>
  startPeriodicSync: (intervalMs?: number) => void
  stopPeriodicSync: () => void
  setupSyncOnClose: () => (() => void)
  setHasPendingChanges: (value: boolean) => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  lastSyncTime: null,
  error: null,
  hasPendingChanges: false,
  intervalId: null,

  sync: async () => {
    const { status } = get()

    // Prevent concurrent syncs
    if (status === 'syncing') {
      console.log('Sync already in progress')
      return
    }

    set({ status: 'syncing', error: null })

    try {
      await syncAll()
      set({
        status: 'idle',
        lastSyncTime: Date.now(),
        hasPendingChanges: false,
        error: null
      })
      console.log('Sync completed at', new Date().toISOString())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({
        status: 'error',
        error: errorMessage
      })
      console.error('Sync failed:', errorMessage)
    }
  },

  startPeriodicSync: (intervalMs = 5 * 60 * 1000) => {
    const { intervalId, sync } = get()

    // Clear existing interval if any
    if (intervalId) {
      clearInterval(intervalId)
    }

    // Run initial sync
    sync()

    // Setup periodic sync
    const newIntervalId = setInterval(() => {
      sync()
    }, intervalMs)

    set({ intervalId: newIntervalId })
    console.log(`Periodic sync started (interval: ${intervalMs}ms)`)
  },

  stopPeriodicSync: () => {
    const { intervalId } = get()

    if (intervalId) {
      clearInterval(intervalId)
      set({ intervalId: null })
      console.log('Periodic sync stopped')
    }
  },

  setupSyncOnClose: () => {
    // Sync before page unload (user closing tab/window)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { hasPendingChanges, sync } = get()

      if (hasPendingChanges) {
        // Trigger sync (navigator.sendBeacon could be used for more reliability)
        sync()

        // Show confirmation dialog if there are unsaved changes
        e.preventDefault()
        e.returnValue = ''
      }
    }

    // Sync when page is hidden (tab switched, minimized, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const { hasPendingChanges, sync } = get()
        if (hasPendingChanges) {
          sync()
        }
      }
    }

    // Sync on page focus (when user returns to the tab)
    const handleFocus = () => {
      const { lastSyncTime, sync } = get()
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      // Sync if it's been more than 5 minutes since last sync
      if (!lastSyncTime || now - lastSyncTime > fiveMinutes) {
        sync()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    console.log('Sync on close/visibility change/focus listeners setup')

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  },

  setHasPendingChanges: (value) => {
    set({ hasPendingChanges: value })
  }
}))

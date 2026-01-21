import { create } from 'zustand'
import { syncAll, SyncStats } from '@/lib/db/sync'

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success'

interface SyncState {
  status: SyncStatus
  lastSyncTime: number | null
  lastSyncStats: SyncStats | null
  error: string | null
  hasPendingChanges: boolean

  // Actions
  sync: (isInitialSync?: boolean) => Promise<void>
  setHasPendingChanges: (value: boolean) => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  lastSyncTime: null,
  lastSyncStats: null,
  error: null,
  hasPendingChanges: false,

  sync: async (isInitialSync = false) => {
    const { status } = get()

    // Prevent concurrent syncs
    if (status === 'syncing') {
      console.log('Sync already in progress')
      return
    }

    set({ status: 'syncing', error: null })

    try {
      const stats = await syncAll(isInitialSync)
      set({
        status: 'success',
        lastSyncTime: Date.now(),
        lastSyncStats: stats,
        hasPendingChanges: false,
        error: null
      })
      console.log('✅ Manual sync completed at', new Date().toISOString(), stats)

      // Reset status to idle after 3 seconds
      setTimeout(() => {
        const currentState = get()
        if (currentState.status === 'success') {
          set({ status: 'idle' })
        }
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      set({
        status: 'error',
        error: errorMessage
      })
      console.error('❌ Sync failed:', errorMessage)
      console.error('Full error:', error)
      if (errorStack) {
        console.error('Stack trace:', errorStack)
      }
    }
  },

  setHasPendingChanges: (value) => {
    set({ hasPendingChanges: value })
  }
}))

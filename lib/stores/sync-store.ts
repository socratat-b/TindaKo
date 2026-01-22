import { create } from 'zustand'
import { syncAll, pushToCloud, pullFromCloud, SyncStats } from '@/lib/db/sync'

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success'

interface SyncState {
  status: SyncStatus
  lastSyncTime: number | null
  lastSyncStats: SyncStats | null
  error: string | null
  hasPendingChanges: boolean

  // Actions
  backup: (userId?: string) => Promise<void> // Push-only (manual backup)
  restore: (userId?: string) => Promise<SyncStats> // Pull-only (auto-restore)
  sync: (isInitialSync?: boolean) => Promise<void> // Full sync (both push + pull, for future use)
  setHasPendingChanges: (value: boolean) => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  lastSyncTime: null,
  lastSyncStats: null,
  error: null,
  hasPendingChanges: false,

  backup: async (userId?: string) => {
    const { status } = get()

    // Prevent concurrent operations
    if (status === 'syncing') {
      console.log('Backup already in progress')
      return
    }

    set({ status: 'syncing', error: null })

    try {
      const stats = await pushToCloud(userId)
      set({
        status: 'success',
        lastSyncTime: Date.now(),
        lastSyncStats: stats,
        hasPendingChanges: false,
        error: null
      })
      console.log('✅ Backup completed at', new Date().toISOString(), stats)

      // Reset status to idle after 3 seconds
      setTimeout(() => {
        const currentState = get()
        if (currentState.status === 'success') {
          set({ status: 'idle' })
        }
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({
        status: 'error',
        error: errorMessage
      })
      console.error('❌ Backup failed:', errorMessage)
      console.error('Full error:', error)
    }
  },

  restore: async (userId?: string) => {
    const { status } = get()

    // Prevent concurrent operations
    if (status === 'syncing') {
      console.log('Restore already in progress')
      return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    }

    set({ status: 'syncing', error: null })

    try {
      const stats = await pullFromCloud(userId)
      set({
        status: 'success',
        lastSyncTime: Date.now(),
        lastSyncStats: stats,
        error: null
      })
      console.log('✅ Restore completed at', new Date().toISOString(), stats)

      // Reset status to idle after 3 seconds
      setTimeout(() => {
        const currentState = get()
        if (currentState.status === 'success') {
          set({ status: 'idle' })
        }
      }, 3000)

      return stats
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({
        status: 'error',
        error: errorMessage
      })
      console.error('❌ Restore failed:', errorMessage)
      console.error('Full error:', error)
      return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    }
  },

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
      console.log('✅ Full sync completed at', new Date().toISOString(), stats)

      // Reset status to idle after 3 seconds
      setTimeout(() => {
        const currentState = get()
        if (currentState.status === 'success') {
          set({ status: 'idle' })
        }
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({
        status: 'error',
        error: errorMessage
      })
      console.error('❌ Sync failed:', errorMessage)
      console.error('Full error:', error)
    }
  },

  setHasPendingChanges: (value) => {
    set({ hasPendingChanges: value })
  }
}))

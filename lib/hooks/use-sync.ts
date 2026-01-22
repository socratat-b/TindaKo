'use client'

import { useSyncStore } from '@/lib/stores/sync-store'

/**
 * Hook for accessing sync state and actions
 */
export function useSync() {
  const syncStore = useSyncStore()

  return {
    // State
    status: syncStore.status,
    lastSyncTime: syncStore.lastSyncTime,
    lastSyncStats: syncStore.lastSyncStats,
    error: syncStore.error,
    hasPendingChanges: syncStore.hasPendingChanges,
    isSyncing: syncStore.status === 'syncing',
    isSuccess: syncStore.status === 'success',

    // Actions
    backup: syncStore.backup, // Push-only (manual backup)
    restore: syncStore.restore, // Pull-only (auto-restore)
    sync: syncStore.sync, // Full sync (both push + pull)
    setHasPendingChanges: syncStore.setHasPendingChanges
  }
}

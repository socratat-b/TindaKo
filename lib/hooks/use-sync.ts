'use client'

import { useSyncStore } from '@/lib/stores/sync-store'

/**
 * Hook for accessing sync state and actions
 */
export function useSync() {
  const sync = useSyncStore()

  return {
    // State
    status: sync.status,
    lastSyncTime: sync.lastSyncTime,
    error: sync.error,
    hasPendingChanges: sync.hasPendingChanges,
    isSyncing: sync.status === 'syncing',

    // Actions
    sync: sync.sync,
    setHasPendingChanges: sync.setHasPendingChanges
  }
}

'use client'

import { useEffect, useRef } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { db } from '@/lib/db'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const { restore } = useSyncStore()
  const hasRestoredRef = useRef<string | null>(null)

  // Auto-restore from cloud ONCE per user login (not on every page navigation)
  useEffect(() => {
    if (!userId) {
      hasRestoredRef.current = null
      return
    }

    // Already restored for this user - skip
    if (hasRestoredRef.current === userId) {
      return
    }

    const pullDataIfNeeded = async () => {
      try {
        // Check if local DB has data
        const productsCount = await db.products.count()

        // Mark as restored immediately to prevent re-triggering
        hasRestoredRef.current = userId

        if (productsCount === 0) {
          // DB is empty - pull data from cloud
          await restore(userId)
          window.dispatchEvent(new CustomEvent('data-restored'))
          localStorage.setItem('lastLoggedInUserId', userId)
        }
      } catch (error) {
        console.error('[SyncProvider] Failed to pull data:', error)
        // Reset so it can retry on next render
        hasRestoredRef.current = null
      }
    }

    pullDataIfNeeded()
  }, [userId, restore])

  return <>{children}</>
}

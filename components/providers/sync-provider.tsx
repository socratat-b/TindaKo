'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { db } from '@/lib/db'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { restore } = useSyncStore()
  const pathname = usePathname()
  const lastSyncedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      // User logged out - reset everything
      lastSyncedUserIdRef.current = null
      return
    }

    // Only sync on dashboard pages (not login/signup)
    const isDashboardPage = pathname !== '/login' && pathname !== '/signup'
    if (!isDashboardPage) {
      return
    }

    // User logged in and on dashboard - check if we need to pull data
    const pullDataIfNeeded = async () => {
      try {
        // Check if we already pulled data for this user
        if (lastSyncedUserIdRef.current === user.id) {
          console.log('[SyncProvider] Data already pulled for this user')
          return
        }

        console.log('[SyncProvider] Checking data for user:', user.id)

        // Check if local DB is empty
        const productsCount = await db.products.count()
        console.log('[SyncProvider] Products in local DB:', productsCount)

        if (productsCount === 0) {
          // DB is empty - pull data from cloud
          console.log('[SyncProvider] Empty DB - pulling data from cloud')
          lastSyncedUserIdRef.current = user.id // Mark as syncing

          await restore(user.id)

          console.log('[SyncProvider] Data pulled successfully - notifying UI')
          window.dispatchEvent(new CustomEvent('data-restored'))

          localStorage.setItem('lastLoggedInUserId', user.id)
        } else {
          // DB has data
          console.log('[SyncProvider] DB has data - no pull needed')
          lastSyncedUserIdRef.current = user.id
        }
      } catch (error) {
        console.error('[SyncProvider] Failed to pull data:', error)
        lastSyncedUserIdRef.current = null // Reset so it retries
      }
    }

    pullDataIfNeeded()
  }, [user, pathname, restore])

  return <>{children}</>
}

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
        // ALWAYS check if local DB is empty first
        // This handles multiple logout → login cycles for the same account
        const productsCount = await db.products.count()

        // If DB is empty, we must pull data (even if ref is set)
        if (productsCount === 0) {
          // Check if already pulling (ref set + store status is 'syncing')
          const { status } = useSyncStore.getState()
          if (lastSyncedUserIdRef.current === user.id && status === 'syncing') {
            return
          }

          // DB is empty but ref is set = logout happened, reset it
          if (lastSyncedUserIdRef.current !== null) {
            lastSyncedUserIdRef.current = null
          }

          // DB is empty - pull data from cloud
          lastSyncedUserIdRef.current = user.id // Mark as pulling

          await restore(user.id)

          window.dispatchEvent(new CustomEvent('data-restored'))

          localStorage.setItem('lastLoggedInUserId', user.id)
        } else {
          // DB has data - mark as synced to prevent unnecessary pulls on navigation
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

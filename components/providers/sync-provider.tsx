'use client'

import { useEffect, useRef } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { db } from '@/lib/db'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { restore } = useSyncStore()
  const hasInitialSyncedRef = useRef(false)

  useEffect(() => {
    // Only trigger initial restore if user is authenticated and hasn't restored yet
    if (!user || hasInitialSyncedRef.current) {
      return
    }

    // Check if local database is empty (first login or after data clear)
    const checkAndRestoreInitial = async () => {
      try {
        // Check if any table has data
        const [categoriesCount, productsCount, salesCount] = await Promise.all([
          db.categories.count(),
          db.products.count(),
          db.sales.count()
        ])

        const isEmptyDatabase = categoriesCount === 0 && productsCount === 0 && salesCount === 0

        // Check if different user logged in
        const lastUserId = localStorage.getItem('lastLoggedInUserId')
        const isDifferentUser = lastUserId && lastUserId !== user.id

        if (isEmptyDatabase || isDifferentUser) {
          console.log('Auto-restoring from cloud for user:', user.id)
          await restore(user.id) // Pull-only restore from cloud
          localStorage.setItem('lastLoggedInUserId', user.id)
        }

        hasInitialSyncedRef.current = true
      } catch (error) {
        console.error('Initial restore check failed:', error)
      }
    }

    checkAndRestoreInitial()
  }, [user, restore])

  return <>{children}</>
}

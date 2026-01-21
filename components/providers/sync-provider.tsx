'use client'

import { useEffect, useRef } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { db } from '@/lib/db'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { sync } = useSyncStore()
  const hasInitialSyncedRef = useRef(false)

  useEffect(() => {
    // Only trigger initial sync if user is authenticated and hasn't synced yet
    if (!user || hasInitialSyncedRef.current) {
      return
    }

    // Check if local database is empty (first login or after data clear)
    const checkAndSyncInitial = async () => {
      try {
        // Check if any table has data
        const [categoriesCount, productsCount, salesCount] = await Promise.all([
          db.categories.count(),
          db.products.count(),
          db.sales.count()
        ])

        const isEmptyDatabase = categoriesCount === 0 && productsCount === 0 && salesCount === 0

        if (isEmptyDatabase) {
          console.log('Empty database detected - running initial sync to restore backup')
          await sync(true) // isInitialSync = true
        }

        hasInitialSyncedRef.current = true
      } catch (error) {
        console.error('Initial sync check failed:', error)
      }
    }

    checkAndSyncInitial()
  }, [user, sync])

  return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { db } from '@/lib/db'
import { seedProductCatalog } from '@/lib/db/seeders'

/**
 * AuthProvider - OFFLINE-FIRST
 * Immediately sets loading to false, no Supabase queries blocking the UI
 * Auth is checked by middleware, not client-side
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading } = useAuthStore()

  useEffect(() => {
    async function initOfflineFirst() {
      // IMMEDIATELY set loading to false - don't wait for anything
      setLoading(false)

      // Try to load profile from IndexedDB (offline-first)
      try {
        const profiles = await db.userProfile.toArray()
        if (profiles.length > 0) {
          const profile = profiles[0] // Get first profile
          setAuth(profile.id, profile.email, profile.storeName, profile.avatarUrl)
          console.log('[AuthProvider] Loaded profile from IndexedDB:', profile.id)
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to load profile from IndexedDB:', error)
      }

      // Seed product catalog in background (non-blocking)
      seedProductCatalog().catch((error) => {
        console.error('[AuthProvider] Failed to seed product catalog:', error)
      })
    }

    initOfflineFirst()
  }, [setAuth, setLoading])

  return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { db } from '@/lib/db'
import { seedProductCatalog } from '@/lib/db/seeders'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/db/schema'

/**
 * AuthProvider - OAuth with Offline-First
 * Fetches user profile from Supabase and syncs to IndexedDB
 * Auth session is checked by middleware
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading } = useAuthStore()

  useEffect(() => {
    async function initAuth() {
      try {
        // Step 1: Check IndexedDB first (offline-first)
        const localProfiles = await db.userProfile.toArray()
        if (localProfiles.length > 0) {
          const profile = localProfiles[0]
          setAuth(profile.id, profile.email, profile.storeName, profile.avatarUrl)
          console.log('[AuthProvider] Loaded profile from IndexedDB:', profile.id)
          setLoading(false)
        }

        // Step 2: Try to sync from Supabase (if online)
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // User is authenticated - fetch profile from Supabase
          const { data: storeProfile, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (storeProfile && !error) {
            // Save profile to IndexedDB for offline access
            const userProfile: UserProfile = {
              id: storeProfile.id,
              email: storeProfile.email,
              storeName: storeProfile.store_name,
              avatarUrl: storeProfile.avatar_url,
              provider: storeProfile.provider,
              createdAt: storeProfile.created_at,
              updatedAt: storeProfile.updated_at,
            }

            await db.userProfile.clear() // Clear old profiles
            await db.userProfile.add(userProfile)

            // Update auth store
            setAuth(userProfile.id, userProfile.email, userProfile.storeName, userProfile.avatarUrl)
            console.log('[AuthProvider] Synced profile from Supabase:', userProfile.id)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('[AuthProvider] Error initializing auth:', error)
        setLoading(false)
      }

      // Seed product catalog in background (non-blocking)
      seedProductCatalog().catch((error) => {
        console.error('[AuthProvider] Failed to seed product catalog:', error)
      })
    }

    initAuth()
  }, [setAuth, setLoading])

  return <>{children}</>
}

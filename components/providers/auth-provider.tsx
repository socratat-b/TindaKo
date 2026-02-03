'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/db'
import { seedProductCatalog } from '@/lib/db/seeders'

/**
 * AuthProvider - Initialize auth state from Supabase Auth
 * Following Next.js authentication patterns
 *
 * - Listens to Supabase auth state changes
 * - Syncs user profile from IndexedDB
 * - Session managed by Supabase (httpOnly cookies)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Helper to sync profile from Supabase to IndexedDB
    async function syncProfile(userId: string) {
      try {
        // Check IndexedDB first
        let profile = await db.userProfile.get(userId)

        if (!profile) {
          // Not in IndexedDB - fetch from Supabase
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('id', userId)
            .single()

          if (data && !error) {
            // Save to IndexedDB
            profile = {
              id: data.id,
              email: data.email,
              storeName: data.store_name,
              avatarUrl: data.avatar_url,
              provider: data.provider,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }

            await db.userProfile.put(profile)
            console.log('[AuthProvider] Profile synced from Supabase to IndexedDB')
          }
        }

        if (profile) {
          setAuth(profile.id, profile.email, profile.storeName, profile.avatarUrl)
        }

        return profile
      } catch (error) {
        console.error('[AuthProvider] Failed to sync profile:', error)
        return null
      }
    }

    // Initialize auth state from current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await syncProfile(session.user.id)
      }

      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event)

      if (session?.user) {
        // User logged in or token refreshed
        await syncProfile(session.user.id)
      } else {
        // User logged out
        clearAuth()
      }
    })

    // Seed product catalog on first app launch
    seedProductCatalog().catch((error) => {
      console.error('[AuthProvider] Failed to seed product catalog:', error)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setAuth, clearAuth, setLoading])

  return <>{children}</>
}

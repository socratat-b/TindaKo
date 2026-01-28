'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getSession } from '@/lib/auth/session'
import { seedProductCatalog } from '@/lib/db/seeders'

/**
 * AuthProvider - Initialize auth state from localStorage
 *
 * Phone-based auth uses localStorage for session persistence.
 * No Supabase Auth calls, no token refresh needed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth from localStorage session
    const session = getSession()

    if (session) {
      setAuth(session.phone, session.storeName)
    }

    setLoading(false)

    // Seed product catalog on first app launch (runs once)
    seedProductCatalog().catch((error) => {
      console.error('[AuthProvider] Failed to seed product catalog:', error)
    })
  }, [setAuth, setLoading])

  return <>{children}</>
}

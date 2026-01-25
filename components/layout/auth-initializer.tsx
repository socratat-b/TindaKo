'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'

/**
 * Initializes auth state on the client side
 * This component should be rendered once in the dashboard layout
 */
export function AuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    const initAuth = async () => {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser()

      if (user && !error) {
        setUser(user)
      }

      setLoading(false)

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    initAuth()
  }, [setUser, setLoading])

  return null
}

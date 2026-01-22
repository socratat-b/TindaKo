'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import {
  getCachedSession,
  cacheSession,
  refreshSessionIfNeeded,
  clearSessionCache,
} from '@/lib/auth/session-cache'
import type { CachedSession } from '@/lib/auth/session-cache'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, clear, setOffline } = useAuthStore()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    const supabase = createClient()

    // Initialize from cache if offline
    const initializeAuth = async () => {
      // Quick offline check to avoid unnecessary network calls
      const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine

      if (!browserOffline) {
        try {
          // Try online first
          const { data: { session } } = await supabase.auth.getSession()

          if (session) {
            setUser(session.user)
            setLoading(false)

            // Cache session for offline access
            const now = Date.now()
            const sessionCache: CachedSession = {
              userId: session.user.id,
              email: session.user.email ?? null,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: session.expires_at
                ? session.expires_at * 1000
                : now + 60 * 60 * 1000,
              cachedAt: now,
              maxOfflineExpiry: now + 30 * 24 * 60 * 60 * 1000, // 30 days
            }
            await cacheSession(sessionCache)
            return
          }
        } catch (err) {
          // Suppress network errors (expected when offline)
          const errorMsg = err instanceof Error ? err.message?.toLowerCase() : ''
          const errorCode = (err as any)?.cause?.code || ''
          const isNetworkError =
            errorMsg.includes('fetch') ||
            errorMsg.includes('network') ||
            errorCode === 'ENOTFOUND' ||
            errorCode === 'ETIMEDOUT' ||
            errorCode === 'ECONNREFUSED'

          if (!isNetworkError) {
            // Log unexpected errors
            console.error('Auth initialization error:', err)
          }
          // Fall through to cache for all errors
        }
      }

      // Offline fallback: Load from cache
      const cached = await getCachedSession()
      if (cached) {
        setUser({
          id: cached.userId,
          email: cached.email,
        } as any)
      }
      setLoading(false)
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session) {
        // Cache session for offline access
        const now = Date.now()
        const sessionCache: CachedSession = {
          userId: session.user.id,
          email: session.user.email ?? null,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at
            ? session.expires_at * 1000
            : now + 60 * 60 * 1000,
          cachedAt: now,
          maxOfflineExpiry: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        }
        await cacheSession(sessionCache)
      }

      if (event === 'SIGNED_OUT') {
        clearSessionCache()
        clear()
      }
    })

    // Background token refresh (every 5 minutes)
    const refreshInterval = setInterval(async () => {
      if (isOnline) {
        await refreshSessionIfNeeded()
      }
    }, 5 * 60 * 1000)

    // Refresh on tab focus/visibility change
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isOnline) {
        await refreshSessionIfNeeded()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [setUser, setLoading, clear, setOffline, isOnline])

  // Update offline status in store
  useEffect(() => {
    setOffline(!isOnline)
  }, [isOnline, setOffline])

  return <>{children}</>
}

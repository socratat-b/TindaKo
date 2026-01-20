import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isSessionValidOffline } from '@/lib/auth/session-cache'

// Cached session verification - PRIMARY security check
// Tries online first, falls back to cached session for offline access
export const verifySession = cache(async () => {
  const supabase = await createClient()

  // Try online verification first
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user && !error) {
      // Online: Valid session
      return {
        isAuth: true,
        userId: user.id,
        user,
        mode: 'online' as const,
        requiresRefresh: false,
      }
    }

    // Online but not authenticated
    if (error && !error.message?.includes('network')) {
      redirect('/login')
    }

    // Network error: fall through to offline check
  } catch {
    // Network error: fall through to offline check
  }

  // Offline fallback: Check cached session
  const validation = await isSessionValidOffline()

  if (!validation.isValid) {
    // No valid offline session
    redirect('/login')
  }

  // Valid offline session
  return {
    isAuth: true,
    userId: validation.session!.userId,
    user: {
      id: validation.session!.userId,
      email: validation.session!.email,
    },
    mode: 'offline' as const,
    requiresRefresh: validation.requiresRefresh,
  }
})

// Cached user data fetch
// Tries online first, falls back to cached session for offline access
export const getUser = cache(async () => {
  const supabase = await createClient()

  // Try online verification first
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Return only necessary fields (DTO pattern)
      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      }
    }
  } catch {
    // Network error: fall through to offline check
  }

  // Offline fallback: Check cached session
  const validation = await isSessionValidOffline()

  if (!validation.isValid || !validation.session) {
    return null
  }

  // Return cached user data
  return {
    id: validation.session.userId,
    email: validation.session.email,
    createdAt: undefined, // Not available in cache
  }
})

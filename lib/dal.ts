import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Cached session verification - PRIMARY security check
// Tries online first, falls back to session from cookies for offline access
export const verifySession = cache(async () => {
  const supabase = await createClient()

  // Try online verification first
  let networkError = false
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

    // Check if it's a network error
    if (error) {
      const errorMsg = error.message?.toLowerCase() || ''
      networkError =
        errorMsg.includes('network') ||
        errorMsg.includes('fetch') ||
        errorMsg.includes('enotfound') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('connection')

      if (!networkError) {
        // Auth error (not network): redirect to login
        redirect('/login')
      }
    }
  } catch (err) {
    // Check if it's a network error
    const errorMsg = err instanceof Error ? err.message?.toLowerCase() : ''
    const causeMsg = (err as any)?.cause?.message?.toLowerCase() || ''
    const errorCode = (err as any)?.cause?.code || ''

    networkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('enotfound') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('connection') ||
      causeMsg.includes('enotfound') ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ECONNREFUSED'

    if (!networkError) {
      // Non-network error, re-throw
      throw err
    }
  }

  // Network error: Try to get session from cookies (no network call)
  if (networkError) {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Found session in cookies (set by middleware)
        return {
          isAuth: true,
          userId: session.user.id,
          user: session.user,
          mode: 'offline' as const,
          requiresRefresh: false,
        }
      }
    } catch {
      // Failed to get session from cookies
    }
  }

  // No valid session found
  redirect('/login')
})

// Cached user data fetch
// Tries online first, falls back to session from cookies for offline access
export const getUser = cache(async () => {
  const supabase = await createClient()

  // Try online verification first
  let networkError = false
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user && !error) {
      // Return only necessary fields (DTO pattern)
      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      }
    }

    // Check if it's a network error
    if (error) {
      const errorMsg = error.message?.toLowerCase() || ''
      networkError =
        errorMsg.includes('network') ||
        errorMsg.includes('fetch') ||
        errorMsg.includes('enotfound') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('connection')
    }
  } catch (err) {
    // Check if it's a network error
    const errorMsg = err instanceof Error ? err.message?.toLowerCase() : ''
    const causeMsg = (err as any)?.cause?.message?.toLowerCase() || ''
    const errorCode = (err as any)?.cause?.code || ''

    networkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('enotfound') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('connection') ||
      causeMsg.includes('enotfound') ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ECONNREFUSED'
  }

  // Network error: Try to get session from cookies (no network call)
  if (networkError) {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Return user from session cookies
        return {
          id: session.user.id,
          email: session.user.email,
          createdAt: session.user.created_at,
        }
      }
    } catch {
      // Failed to get session from cookies
    }
  }

  // No user found
  return null
})

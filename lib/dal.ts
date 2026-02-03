import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Data Access Layer (DAL)
 * Centralized authentication and authorization logic following Next.js patterns
 */

/**
 * Verify the user's session
 * Uses React cache() to memoize during render pass
 * This should be called before any data access that requires authentication
 */
export const verifySession = cache(async () => {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return {
    isAuth: true,
    userId: user.id,
    email: user.email!,
  }
})

/**
 * Get the current user's full profile
 * Includes session verification via verifySession()
 */
export const getUser = cache(async () => {
  const session = await verifySession()

  if (!session) {
    return null
  }

  try {
    const supabase = await createClient()

    // Fetch user profile from stores table
    const { data, error } = await supabase
      .from('stores')
      .select('id, email, store_name, avatar_url, provider')
      .eq('id', session.userId)
      .single()

    if (error || !data) {
      console.error('[getUser] Failed to fetch user profile:', error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      storeName: data.store_name,
      avatarUrl: data.avatar_url,
      provider: data.provider,
    }
  } catch (error) {
    console.error('[getUser] Error:', error)
    return null
  }
})

/**
 * Get current user ID without redirect
 * Useful for optional auth checks
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
})

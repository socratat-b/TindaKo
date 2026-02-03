'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * OAuth Auth Actions
 * Following Next.js authentication patterns with Supabase Auth
 */

export type AuthResult = {
  success: boolean
  error?: string
  userId?: string
  storeName?: string
}

/**
 * Setup store profile for first-time OAuth users
 * Called after successful OAuth login if user profile doesn't exist
 */
export async function setupStoreAction(storeName: string): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate store name
  const trimmedStoreName = storeName.trim()
  if (!trimmedStoreName || trimmedStoreName.length < 2) {
    return { success: false, error: 'Store name must be at least 2 characters' }
  }

  const now = new Date().toISOString()

  try {
    // Get OAuth provider from user metadata
    const provider = user.app_metadata.provider as 'google' | 'facebook'
    const avatarUrl = user.user_metadata.avatar_url || null

    // Save to Supabase only (server-side)
    // IndexedDB will be synced by AuthProvider (client-side)
    const { error: dbError } = await supabase.from('stores').insert({
      id: user.id,
      email: user.email,
      store_name: trimmedStoreName,
      avatar_url: avatarUrl,
      provider,
    })

    if (dbError) {
      console.error('[setupStoreAction] Supabase error:', dbError)
      return { success: false, error: 'Failed to create store profile' }
    }

    revalidatePath('/', 'layout')
    return { success: true, userId: user.id, storeName: trimmedStoreName }
  } catch (error) {
    console.error('[setupStoreAction] Error:', error)
    return { success: false, error: 'Failed to setup store' }
  }
}

/**
 * Update store name
 * Called from settings page
 */
export async function updateStoreNameAction(storeName: string): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate store name
  const trimmedStoreName = storeName.trim()
  if (!trimmedStoreName || trimmedStoreName.length < 2) {
    return { success: false, error: 'Store name must be at least 2 characters' }
  }

  const now = new Date().toISOString()

  try {
    // Update Supabase only (server-side)
    // IndexedDB will be synced by client-side code
    const { error: dbError } = await supabase
      .from('stores')
      .update({
        store_name: trimmedStoreName,
        updated_at: now,
      })
      .eq('id', user.id)

    if (dbError) {
      console.error('[updateStoreNameAction] Supabase error:', dbError)
      return { success: false, error: 'Failed to update store name' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('[updateStoreNameAction] Error:', error)
    return { success: false, error: 'Failed to update store name' }
  }
}

/**
 * Logout action
 * Clears session and optionally backs up data
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('[logoutAction] Error:', error)
  }

  redirect('/login')
}

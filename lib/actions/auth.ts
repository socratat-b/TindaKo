'use server'

import { createClient } from '@/lib/supabase/server'
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
 * Sign out from Supabase (clears session cookies)
 * Returns result so caller can handle cleanup before redirect
 */
export async function signOutAction(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[signOutAction] Error:', error)
    return { success: false, error: 'Failed to sign out. Please try again.' }
  }

  return { success: true }
}


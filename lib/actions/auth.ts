/**
 * Auth actions for phone + PIN authentication
 * Client-side operations with IndexedDB
 */

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import { hashPin, verifyPin, isValidPin } from '@/lib/auth/pin'
import { saveSession, clearSession } from '@/lib/auth/session'
import { pullFromCloud } from '@/lib/db/sync'
import type { Store } from '@/lib/db/schema'

export type AuthResult = {
  success: boolean
  error?: string
  phone?: string
  storeName?: string
}

/**
 * Validate Philippine phone number format (09XXXXXXXXX)
 */
function isValidPhoneNumber(phone: string): boolean {
  return /^09[0-9]{9}$/.test(phone)
}

/**
 * Signup with phone, store name, and PIN
 * Saves to local IndexedDB and creates session
 */
export async function signupAction(
  phone: string,
  storeName: string,
  pin: string
): Promise<AuthResult> {
  try {
    // Validate phone format
    if (!isValidPhoneNumber(phone)) {
      return {
        success: false,
        error: 'Invalid phone number. Use format: 09XXXXXXXXX (11 digits)',
      }
    }

    // Validate PIN format
    if (!isValidPin(pin)) {
      return {
        success: false,
        error: 'PIN must be 4-6 digits',
      }
    }

    // Validate store name
    if (!storeName || storeName.trim().length === 0) {
      return {
        success: false,
        error: 'Store name is required',
      }
    }

    // Check if phone already exists
    const existingStore = await db.stores.where('phone').equals(phone).first()
    if (existingStore) {
      return {
        success: false,
        error: 'Phone number already registered',
      }
    }

    // Hash PIN
    const pinHash = await hashPin(pin)

    // Create store in IndexedDB
    const now = new Date().toISOString()
    const storeId = crypto.randomUUID()
    const store: Store = {
      id: storeId,
      phone,
      storeName: storeName.trim(),
      pinHash,
      createdAt: now,
      updatedAt: now,
    }

    await db.stores.add(store)

    // Save to Supabase for multi-device support
    try {
      const supabase = createClient()
      const { error: supabaseError } = await supabase.from('stores').insert({
        id: storeId,
        phone,
        store_name: store.storeName,
        pin_hash: pinHash,
        created_at: now,
        updated_at: now,
      })

      if (supabaseError) {
        console.error('[signupAction] Failed to save to cloud:', supabaseError)
        // Continue anyway - local account created successfully
      }
    } catch (cloudError) {
      console.error('[signupAction] Cloud save failed:', cloudError)
      // Continue anyway - local account created successfully
    }

    // Save session
    saveSession({
      phone,
      storeName: store.storeName,
      pinHash,
    })

    console.log('[signupAction] Account created:', phone)

    return {
      success: true,
      phone,
      storeName: store.storeName,
    }
  } catch (error) {
    console.error('[signupAction] Error:', error)
    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    }
  }
}

/**
 * Login with phone and PIN
 * Validates against local IndexedDB or Supabase (for new device)
 */
export async function loginAction(phone: string, pin: string): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!isValidPhoneNumber(phone)) {
      return {
        success: false,
        error: 'Invalid phone number',
      }
    }

    if (!isValidPin(pin)) {
      return {
        success: false,
        error: 'Invalid PIN',
      }
    }

    // Check local IndexedDB first
    const localStore = await db.stores.where('phone').equals(phone).first()

    if (localStore) {
      // Verify PIN
      const isValid = await verifyPin(pin, localStore.pinHash)

      if (!isValid) {
        return {
          success: false,
          error: 'Incorrect PIN',
        }
      }

      // Save session
      saveSession({
        phone: localStore.phone,
        storeName: localStore.storeName,
        pinHash: localStore.pinHash,
      })

      console.log('[loginAction] Logged in (local):', phone)

      return {
        success: true,
        phone: localStore.phone,
        storeName: localStore.storeName,
      }
    }

    // Not found locally - try Supabase (new device scenario)
    try {
      const supabase = createClient()
      const { data: remoteStore, error: supabaseError } = await supabase
        .from('stores')
        .select('*')
        .eq('phone', phone)
        .single()

      if (supabaseError || !remoteStore) {
        return {
          success: false,
          error: 'Phone number not found. Please sign up first.',
        }
      }

      // Verify PIN against remote hash
      const isValid = await verifyPin(pin, remoteStore.pin_hash)

      if (!isValid) {
        return {
          success: false,
          error: 'Incorrect PIN',
        }
      }

      // Save store to local IndexedDB
      const localStoreData: Store = {
        id: remoteStore.id,
        phone: remoteStore.phone,
        storeName: remoteStore.store_name,
        pinHash: remoteStore.pin_hash,
        createdAt: remoteStore.created_at,
        updatedAt: remoteStore.updated_at,
      }

      await db.stores.add(localStoreData)

      // Save session
      saveSession({
        phone: localStoreData.phone,
        storeName: localStoreData.storeName,
        pinHash: localStoreData.pinHash,
      })

      console.log('[loginAction] Logged in (new device, restoring from cloud):', phone)

      // Auto-restore data from cloud (runs in background)
      pullFromCloud(phone).catch((err) => {
        console.error('[loginAction] Failed to restore data:', err)
      })

      return {
        success: true,
        phone: localStoreData.phone,
        storeName: localStoreData.storeName,
      }
    } catch (cloudError) {
      console.error('[loginAction] Cloud lookup failed:', cloudError)
      return {
        success: false,
        error: 'Phone number not found. Please sign up first.',
      }
    }
  } catch (error) {
    console.error('[loginAction] Error:', error)
    return {
      success: false,
      error: 'Failed to log in. Please try again.',
    }
  }
}

/**
 * Logout - clear session and redirect to login
 * Note: IndexedDB data is cleared by logout-dialog before calling this
 */
export async function logoutAction(): Promise<void> {
  try {
    // Clear session
    clearSession()

    console.log('[logoutAction] Logged out, redirecting to login...')

    // Redirect to login page
    redirect('/login')
  } catch (error) {
    console.error('[logoutAction] Error:', error)
    // If error is not a redirect, rethrow
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error // This is a Next.js redirect, let it through
    }
    throw error
  }
}

/**
 * Update store name in both IndexedDB and Supabase
 */
export async function updateStoreNameAction(
  phone: string,
  newStoreName: string
): Promise<AuthResult> {
  try {
    if (!phone || !newStoreName.trim()) {
      return {
        success: false,
        error: 'Phone and store name are required',
      }
    }

    const now = new Date().toISOString()

    // Update in IndexedDB
    const localStore = await db.stores.where('phone').equals(phone).first()

    if (localStore) {
      await db.stores.update(localStore.id, {
        storeName: newStoreName.trim(),
        updatedAt: now,
      })
    } else {
      return {
        success: false,
        error: 'Store not found locally',
      }
    }

    // Update in Supabase
    try {
      const supabase = createClient()
      const { error: supabaseError } = await supabase
        .from('stores')
        .update({
          store_name: newStoreName.trim(),
          updated_at: now,
        })
        .eq('phone', phone)

      if (supabaseError) {
        console.error('[updateStoreNameAction] Supabase error:', supabaseError)
        // Don't fail the whole operation if Supabase update fails
        // The sync will pick it up later
      }
    } catch (supabaseError) {
      console.error('[updateStoreNameAction] Supabase error:', supabaseError)
      // Continue - local update succeeded
    }

    return {
      success: true,
      phone,
      storeName: newStoreName.trim(),
    }
  } catch (error) {
    console.error('[updateStoreNameAction] Error:', error)
    return {
      success: false,
      error: 'Failed to update store name',
    }
  }
}

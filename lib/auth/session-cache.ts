import { createClient } from '@/lib/supabase/client'

/**
 * Cached session structure stored in IndexedDB
 */
export interface CachedSession {
  userId: string // Primary identifier for offline access
  email: string | null // User email for display
  accessToken: string // JWT for RLS verification
  refreshToken: string // For token refresh when online
  expiresAt: number // Access token expiry timestamp (ms)
  cachedAt: number // When session was cached
  maxOfflineExpiry: number // Hard limit (30 days from login)
}

/**
 * Session validation result
 */
export interface SessionValidation {
  isValid: boolean
  session: CachedSession | null
  requiresRefresh: boolean // Token expired but within 30-day window
  reason?: string // Why invalid
}

// Constants
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const FIVE_MINUTES_MS = 5 * 60 * 1000
const EXPIRY_TOLERANCE_MS = 5 * 60 * 1000 // 5-min tolerance for clock skew

const CACHE_KEY = 'tindako_session_cache'
const ENCRYPTION_KEY_NAME = 'tindako_session_key'

/**
 * Get or generate encryption key for token encryption
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Check if key exists in IndexedDB
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME)

  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey)
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
    } catch {
      // Key corrupted, generate new one
    }
  }

  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  // Store key for future use
  const exportedKey = await crypto.subtle.exportKey('jwk', key)
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey))

  return key
}

/**
 * Encrypt sensitive data (tokens)
 */
async function encryptData(data: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedData = new TextEncoder().encode(data)

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  )

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encryptedData), iv.length)

  // Convert to base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt sensitive data (tokens)
 */
async function decryptData(encryptedBase64: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const encryptedData = combined.slice(12)

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    )

    return new TextDecoder().decode(decryptedData)
  } catch {
    throw new Error('Failed to decrypt session data')
  }
}

/**
 * Cache session to localStorage (encrypted)
 * Called after successful login/signup
 */
export async function cacheSession(session: CachedSession): Promise<void> {
  try {
    // Encrypt sensitive tokens
    const encryptedSession = {
      ...session,
      accessToken: await encryptData(session.accessToken),
      refreshToken: await encryptData(session.refreshToken),
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(encryptedSession))
  } catch (error) {
    console.error('Failed to cache session:', error)
    // Non-fatal: Continue without cache
  }
}

/**
 * Get cached session from localStorage (decrypted)
 */
export async function getCachedSession(): Promise<CachedSession | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const encryptedSession = JSON.parse(cached)

    // Decrypt tokens
    const session: CachedSession = {
      ...encryptedSession,
      accessToken: await decryptData(encryptedSession.accessToken),
      refreshToken: await decryptData(encryptedSession.refreshToken),
    }

    return session
  } catch (error) {
    console.error('Failed to retrieve cached session:', error)
    // Clear corrupted cache
    clearSessionCache()
    return null
  }
}

/**
 * Clear session cache (logout)
 * Clears localStorage and encryption key
 */
export function clearSessionCache(): void {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(ENCRYPTION_KEY_NAME)
}

/**
 * Validate cached session for offline use
 * Returns validation result with requiresRefresh flag
 */
export async function isSessionValidOffline(): Promise<SessionValidation> {
  const session = await getCachedSession()

  if (!session) {
    return {
      isValid: false,
      session: null,
      requiresRefresh: false,
      reason: 'No cached session',
    }
  }

  const now = Date.now()

  // Check for clock skew
  if (session.cachedAt > now + EXPIRY_TOLERANCE_MS) {
    console.warn('Clock skew detected: cachedAt is in the future')
  }

  // Check 30-day hard limit
  if (now > session.maxOfflineExpiry) {
    clearSessionCache()
    return {
      isValid: false,
      session: null,
      requiresRefresh: false,
      reason: '30-day offline limit exceeded',
    }
  }

  // Access token expired but within 30-day window
  if (now > session.expiresAt + EXPIRY_TOLERANCE_MS) {
    return {
      isValid: true,
      session,
      requiresRefresh: true,
      reason: 'Token expired, needs refresh',
    }
  }

  // Valid session
  return {
    isValid: true,
    session,
    requiresRefresh: false,
  }
}

/**
 * Test if we have internet connectivity to Supabase
 * Returns true if online, false if offline
 */
export async function isOnline(): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Try to get session with 3s timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    )

    const sessionPromise = supabase.auth.getSession()

    await Promise.race([sessionPromise, timeoutPromise])
    return true
  } catch {
    return false
  }
}

/**
 * Refresh session tokens if needed
 * Called by background refresh (AuthProvider)
 * Returns new session or null if refresh failed
 */
export async function refreshSessionIfNeeded(): Promise<CachedSession | null> {
  const cached = await getCachedSession()
  if (!cached) return null

  const now = Date.now()

  // Only refresh if token expires within 5 minutes
  if (now < cached.expiresAt - FIVE_MINUTES_MS) {
    return cached // No refresh needed
  }

  // Check if online
  if (!(await isOnline())) {
    return null // Cannot refresh offline
  }

  try {
    const supabase = await createClient()

    // Attempt refresh with retry logic (2 attempts)
    let refreshError: Error | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: cached.refreshToken,
      })

      if (error) {
        refreshError = error
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))) // Exponential backoff
        continue
      }

      if (data.session) {
        // Update cache with new tokens
        const newSession: CachedSession = {
          userId: data.session.user.id,
          email: data.session.user.email ?? null,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
            ? data.session.expires_at * 1000
            : now + 60 * 60 * 1000, // Fallback: 1 hour
          cachedAt: now,
          maxOfflineExpiry: cached.maxOfflineExpiry, // Preserve original 30-day limit
        }

        await cacheSession(newSession)
        return newSession
      }
    }

    // Refresh failed after retries
    console.error('Token refresh failed:', refreshError)

    // If refresh token is invalid, clear cache and force re-login
    if (refreshError && 'message' in refreshError &&
        (refreshError.message.includes('invalid') || refreshError.message.includes('expired'))) {
      clearSessionCache()
    }

    return null
  } catch (error) {
    console.error('Failed to refresh session:', error)
    return null
  }
}

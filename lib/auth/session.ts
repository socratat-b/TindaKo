/**
 * Local session management
 * Stores phone + pinHash in localStorage + cookie for middleware access
 */

const SESSION_KEY = 'tindako_session'
const COOKIE_NAME = 'tindako_auth'

export interface Session {
  phone: string
  storeName: string
  pinHash: string
}

/**
 * Save session to localStorage + cookie
 * Called after successful signup/login
 */
export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return

  try {
    // Save full session to localStorage (client-side access)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    console.log('[saveSession] Session saved:', session.phone)

    // Save phone to cookie (for middleware access)
    // Note: Only store phone, not sensitive pinHash
    document.cookie = `${COOKIE_NAME}=${session.phone}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
  } catch (error) {
    console.error('[saveSession] Failed to save session:', error)
  }
}

/**
 * Get current session from localStorage
 * Returns null if no session exists
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(SESSION_KEY)
    if (!data) return null

    const session = JSON.parse(data) as Session

    // Validate session structure
    if (!session.phone || !session.pinHash) {
      console.warn('[getSession] Invalid session data, clearing...')
      clearSession()
      return null
    }

    return session
  } catch (error) {
    console.error('[getSession] Failed to parse session:', error)
    clearSession()
    return null
  }
}

/**
 * Clear session from localStorage + cookie
 * Called on logout
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear localStorage
    localStorage.removeItem(SESSION_KEY)

    // Clear cookie
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`

    console.log('[clearSession] Session cleared')
  } catch (error) {
    console.error('[clearSession] Failed to clear session:', error)
  }
}

/**
 * Check if user is authenticated
 * Returns true if valid session exists
 */
export function isAuthenticated(): boolean {
  return getSession() !== null
}

/**
 * Get current phone from session
 * Returns null if no session
 */
export function getCurrentPhone(): string | null {
  const session = getSession()
  return session?.phone || null
}

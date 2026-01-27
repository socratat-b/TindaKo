/**
 * PIN hashing utilities using bcrypt
 * Handles 4-6 digit PIN encryption for local auth
 */

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Hash a PIN using bcrypt
 * @param pin - 4-6 digit PIN string
 * @returns Promise<string> - bcrypt hash
 */
export async function hashPin(pin: string): Promise<string> {
  if (!pin || pin.length < 4 || pin.length > 6) {
    throw new Error('PIN must be 4-6 digits')
  }

  if (!/^\d+$/.test(pin)) {
    throw new Error('PIN must contain only digits')
  }

  return bcrypt.hash(pin, SALT_ROUNDS)
}

/**
 * Verify a PIN against its hash
 * @param pin - Plain text PIN
 * @param hash - bcrypt hash to compare against
 * @returns Promise<boolean> - true if PIN matches
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!pin || !hash) {
    return false
  }

  try {
    return await bcrypt.compare(pin, hash)
  } catch (error) {
    console.error('[verifyPin] Error:', error)
    return false
  }
}

/**
 * Validate PIN format
 * @param pin - PIN to validate
 * @returns boolean - true if valid format
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin)
}

/**
 * Test: Multiple logout → login cycles for same account
 * Verifies that same account can logout and login multiple times
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { pullFromCloud } from '@/lib/db/sync'
import { createClient } from '@/lib/supabase/client'

const TEST_EMAIL = process.env.TEST_EMAIL || 'seller1@test.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123'
let TEST_USER_ID: string

describe('Multiple logout → login cycles (same account)', () => {
  beforeEach(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    if (error || !data.user) {
      throw new Error('Failed to login for test: ' + error?.message)
    }

    TEST_USER_ID = data.user.id
    await clearAllLocalData()
  })

  it('should handle 3 consecutive logout → login cycles', { timeout: 30000 }, async () => {
    // === CYCLE 1 ===
    console.log('=== CYCLE 1: Login ===')
    await pullFromCloud(TEST_USER_ID)
    let count = await db.products.count()
    expect(count).toBeGreaterThan(0)

    console.log('=== CYCLE 1: Logout ===')
    await clearAllLocalData()
    count = await db.products.count()
    expect(count).toBe(0)

    // === CYCLE 2 ===
    console.log('=== CYCLE 2: Login ===')
    await pullFromCloud(TEST_USER_ID)
    count = await db.products.count()
    expect(count).toBeGreaterThan(0)

    console.log('=== CYCLE 2: Logout ===')
    await clearAllLocalData()
    count = await db.products.count()
    expect(count).toBe(0)

    // === CYCLE 3 ===
    console.log('=== CYCLE 3: Login ===')
    await pullFromCloud(TEST_USER_ID)
    count = await db.products.count()
    expect(count).toBeGreaterThan(0)

    console.log('=== CYCLE 3: Logout ===')
    await clearAllLocalData()
    count = await db.products.count()
    expect(count).toBe(0)

    console.log('✅ All 3 cycles completed successfully')
  })
})

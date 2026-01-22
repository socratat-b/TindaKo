/**
 * Integration Test: Logout → Clear Data → Login → Pull Data → Populate IndexedDB
 *
 * Uses REAL Supabase account: admin@gmail.com (has 1 product: Coke)
 *
 * This tests the complete flow:
 * 1. User is logged in with data in IndexedDB
 * 2. User logs out → IndexedDB is cleared
 * 3. User logs in again → Data is pulled from REAL Supabase
 * 4. Data is POPULATED into IndexedDB
 * 5. Data can be queried from IndexedDB
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { pullFromCloud } from '@/lib/db/sync'
import { createClient } from '@/lib/supabase/client'

// Real Supabase account for testing
const TEST_EMAIL = 'admin@gmail.com'
const TEST_PASSWORD = 'tatadmin'
let TEST_USER_ID: string

describe('Logout → Login → Populate IndexedDB Flow (REAL DATA)', () => {
  beforeEach(async () => {
    // Login to get real user ID
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    if (error || !data.user) {
      throw new Error('Failed to login for test: ' + error?.message)
    }

    TEST_USER_ID = data.user.id

    // Clear IndexedDB before each test
    await clearAllLocalData()
  })

  it('should clear all data from IndexedDB on logout', async () => {
    // Step 1: Add test data to IndexedDB
    await db.products.add({
      id: 'test-product-1',
      userId: TEST_USER_ID,
      name: 'Test Product',
      sellingPrice: 10.0,
      stockQty: 100,
      categoryId: 'cat-1',
      isDeleted: false,
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    let count = await db.products.count()
    expect(count).toBe(1)

    // Step 2: Logout - clear all data
    await clearAllLocalData()

    // Step 3: Verify ALL tables are empty
    const [products, categories, customers, sales] = await Promise.all([
      db.products.count(),
      db.categories.count(),
      db.customers.count(),
      db.sales.count(),
    ])

    expect(products).toBe(0)
    expect(categories).toBe(0)
    expect(customers).toBe(0)
    expect(sales).toBe(0)
  })

  it('should populate IndexedDB from REAL Supabase after login', async () => {
    // Step 1: Ensure IndexedDB is empty (post-logout state)
    await clearAllLocalData()
    let productsCount = await db.products.count()
    expect(productsCount).toBe(0)

    // Step 2: Pull data from REAL Supabase (simulating login)
    console.log('Pulling data for user:', TEST_USER_ID)
    const stats = await pullFromCloud(TEST_USER_ID)

    // Step 3: Verify stats show data was pulled
    console.log('Pull stats:', stats)
    expect(stats.pulledCount).toBeGreaterThan(0)

    // Step 4: CRITICAL - Verify data is ACTUALLY in IndexedDB
    productsCount = await db.products.count()
    expect(productsCount).toBeGreaterThan(0)

    // Step 5: Verify we can QUERY the real data from IndexedDB
    const products = await db.products.toArray()
    console.log('Products in IndexedDB:', products)
    expect(products.length).toBeGreaterThan(0)
    expect(products[0].name).toBe('Coke') // Real product from admin@gmail.com
    expect(products[0].userId).toBe(TEST_USER_ID)
  })

  it('should complete full cycle: login → logout → login → data restored (REAL)', async () => {
    // === PHASE 1: First login - add local data ===
    await db.products.add({
      id: 'local-product',
      userId: TEST_USER_ID,
      name: 'Local Product',
      sellingPrice: 5.0,
      stockQty: 50,
      categoryId: 'cat-1',
      isDeleted: false,
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    let count = await db.products.count()
    expect(count).toBe(1)

    // === PHASE 2: Logout - clear all data ===
    await clearAllLocalData()
    count = await db.products.count()
    expect(count).toBe(0)

    // === PHASE 3: Login again - pull from REAL Supabase ===
    await pullFromCloud(TEST_USER_ID)

    // === PHASE 4: Verify data is restored in IndexedDB ===
    count = await db.products.count()
    expect(count).toBeGreaterThan(0)

    // === PHASE 5: Verify it's the Supabase data (not old local data) ===
    const products = await db.products.toArray()
    expect(products[0].name).toBe('Coke') // From REAL Supabase, NOT "Local Product"
    expect(products[0].userId).toBe(TEST_USER_ID)
  })

  it('should filter data by userId when querying IndexedDB', async () => {
    // Populate IndexedDB with REAL data
    await pullFromCloud(TEST_USER_ID)

    // Query by userId
    const userProducts = await db.products
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    expect(userProducts.length).toBeGreaterThan(0)
    expect(userProducts[0].userId).toBe(TEST_USER_ID)

    // Query by different userId should return nothing
    const otherUserProducts = await db.products
      .where('userId')
      .equals('fake-user-id')
      .toArray()

    expect(otherUserProducts).toHaveLength(0)
  })
})


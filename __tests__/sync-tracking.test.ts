/**
 * Test to verify that sync tracking works correctly for a fresh user
 * This test:
 * 1. Seeds default categories (should have syncedAt: null)
 * 2. Creates a product (should have syncedAt: null)
 * 3. Creates a sale (should have syncedAt: null)
 * 4. Verifies pending changes count
 * 5. Pushes to cloud
 * 6. Verifies syncedAt is set after push
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { seedDefaultCategories } from '@/lib/db/seeders'
import { pushToCloud } from '@/lib/db/sync'
import { createClient } from '@/lib/supabase/client'

const TEST_EMAIL = process.env.TEST_EMAIL || 'seller1@test.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123'

describe('Sync Tracking Test', () => {
  let TEST_USER_ID: string

  beforeEach(async () => {
    // Clear local data
    await clearAllLocalData()

    // Login to get user ID
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    if (authError || !authData.user) {
      throw new Error('Failed to login for test')
    }

    TEST_USER_ID = authData.user.id
    console.log('Test user ID:', TEST_USER_ID)
  })

  it('should track changes correctly for fresh user', { timeout: 30000 }, async () => {
    // Step 1: Seed default categories
    console.log('Seeding default categories...')
    await seedDefaultCategories(TEST_USER_ID)

    // Verify categories have syncedAt: null
    const categories = await db.categories
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    console.log('Categories created:', categories.length)
    console.log('Sample category:', {
      name: categories[0]?.name,
      syncedAt: categories[0]?.syncedAt,
      isDeleted: categories[0]?.isDeleted
    })

    const unsyncedCategories = categories.filter(c => c.syncedAt === null && !c.isDeleted)
    console.log('Unsynced categories:', unsyncedCategories.length)
    expect(unsyncedCategories.length).toBe(30) // Should have 30 default categories

    // Step 2: Create a product
    console.log('Creating product...')
    const categoryId = categories[0].id
    const productId = crypto.randomUUID()
    await db.products.add({
      id: productId,
      userId: TEST_USER_ID,
      name: 'Test Product',
      barcode: '123456',
      categoryId,
      sellingPrice: 10,
      stockQty: 100,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    const products = await db.products
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    console.log('Product created:', {
      name: products[0]?.name,
      syncedAt: products[0]?.syncedAt,
      isDeleted: products[0]?.isDeleted
    })

    const unsyncedProducts = products.filter(p => p.syncedAt === null && !p.isDeleted)
    expect(unsyncedProducts.length).toBe(1)

    // Step 3: Create a sale
    console.log('Creating sale...')
    const saleId = crypto.randomUUID()
    await db.sales.add({
      id: saleId,
      userId: TEST_USER_ID,
      items: [
        {
          id: productId,
          name: 'Test Product',
          quantity: 2,
          price: 10,
          subtotal: 20,
        },
      ],
      subtotal: 20,
      discount: 0,
      total: 20,
      amountPaid: 20,
      change: 0,
      paymentMethod: 'cash',
      customerId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    const sales = await db.sales
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    console.log('Sale created:', {
      total: sales[0]?.total,
      syncedAt: sales[0]?.syncedAt,
      isDeleted: sales[0]?.isDeleted
    })

    const unsyncedSales = sales.filter(s => s.syncedAt === null && !s.isDeleted)
    expect(unsyncedSales.length).toBe(1)

    // Step 4: Count total pending changes
    const totalPending = unsyncedCategories.length + unsyncedProducts.length + unsyncedSales.length
    console.log('Total pending changes:', totalPending)
    expect(totalPending).toBe(32) // 30 categories + 1 product + 1 sale

    // Step 5: Push to cloud
    console.log('Pushing to cloud...')
    const stats = await pushToCloud(TEST_USER_ID)
    console.log('Push stats:', stats)

    expect(stats.pushedCount).toBe(32)

    // Step 6: Verify syncedAt is set after push
    const categoriesAfterPush = await db.categories
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    const productsAfterPush = await db.products
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    const salesAfterPush = await db.sales
      .where('userId')
      .equals(TEST_USER_ID)
      .toArray()

    const unsyncedAfterPush = [
      ...categoriesAfterPush,
      ...productsAfterPush,
      ...salesAfterPush,
    ].filter(item => item.syncedAt === null && !item.isDeleted)

    console.log('Unsynced items after push:', unsyncedAfterPush.length)
    expect(unsyncedAfterPush.length).toBe(0) // All should be synced now
  })
})

/**
 * Unit Test: clearAllLocalData function
 *
 * Tests that the clearAllLocalData function properly clears all tables in IndexedDB
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'

describe('clearAllLocalData', () => {
  const testUserId = 'test-user-id'

  beforeEach(async () => {
    // Clear DB before each test
    await clearAllLocalData()
  })

  it('should clear all categories', async () => {
    // Add test data
    await db.categories.add({
      id: 'cat-1',
      userId: testUserId,
      name: 'Test Category',
      sortOrder: 1,
      isDeleted: false,
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const countBefore = await db.categories.count()
    expect(countBefore).toBe(1)

    // Clear all data
    await clearAllLocalData()

    // Verify cleared
    const countAfter = await db.categories.count()
    expect(countAfter).toBe(0)
  })

  it('should clear all products', async () => {
    await db.products.add({
      id: 'prod-1',
      userId: testUserId,
      name: 'Test Product',
      sellingPrice: 10.00,
      stockQty: 100,
      categoryId: 'cat-1',
      isDeleted: false,
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const countBefore = await db.products.count()
    expect(countBefore).toBe(1)

    await clearAllLocalData()

    const countAfter = await db.products.count()
    expect(countAfter).toBe(0)
  })

  it('should clear all tables in one call', async () => {
    // Add data to multiple tables
    await Promise.all([
      db.categories.add({
        id: 'cat-1',
        userId: testUserId,
        name: 'Category',
        sortOrder: 1,
        isDeleted: false,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      db.products.add({
        id: 'prod-1',
        userId: testUserId,
        name: 'Product',
        sellingPrice: 10.00,
        stockQty: 100,
        categoryId: 'cat-1',
        isDeleted: false,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      db.customers.add({
        id: 'cust-1',
        userId: testUserId,
        name: 'Customer',
        utangBalance: 0,
        isDeleted: false,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ])

    // Verify data exists
    const [catCount, prodCount, custCount] = await Promise.all([
      db.categories.count(),
      db.products.count(),
      db.customers.count(),
    ])

    expect(catCount).toBe(1)
    expect(prodCount).toBe(1)
    expect(custCount).toBe(1)

    // Clear all
    await clearAllLocalData()

    // Verify all cleared
    const [catCountAfter, prodCountAfter, custCountAfter] = await Promise.all([
      db.categories.count(),
      db.products.count(),
      db.customers.count(),
    ])

    expect(catCountAfter).toBe(0)
    expect(prodCountAfter).toBe(0)
    expect(custCountAfter).toBe(0)
  })

  it('should not throw error if database is already empty', async () => {
    // Ensure DB is empty
    await clearAllLocalData()

    // Should not throw when clearing empty DB
    await expect(clearAllLocalData()).resolves.not.toThrow()

    const count = await db.products.count()
    expect(count).toBe(0)
  })
})

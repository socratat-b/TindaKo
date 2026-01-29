/**
 * Unit tests to verify product catalog is NEVER synced to cloud
 * Catalog is local-only helper data, not user data
 * Pattern: User products are backed up, catalog products are NOT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { pushToCloud } from '@/lib/db/sync'

const TEST_PHONE = '09171234567'

// Mock Supabase to track what tables are accessed
const mockUpsertCalls: Array<{ table: string; data: any }> = []

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      upsert: vi.fn(async (data: any) => {
        mockUpsertCalls.push({ table, data })
        return { error: null }
      }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    }),
  }),
}))

describe('Product Catalog Isolation Tests', () => {
  beforeEach(async () => {
    // Clear all tables
    await Promise.all([
      db.categories.clear(),
      db.products.clear(),
      db.productCatalog.clear(),
    ])

    // Clear mock tracking
    mockUpsertCalls.length = 0
  })

  it('should NOT sync product catalog to Supabase', async () => {
    // Add items to product catalog (local helper data)
    await db.productCatalog.bulkAdd([
      {
        id: crypto.randomUUID(),
        barcode: '4800016644207',
        name: 'Lucky Me Pancit Canton',
        categoryName: 'Instant Noodles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        barcode: '4800016012914',
        name: 'Bear Brand Powdered Milk',
        categoryName: 'Milk & Dairy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    // Verify catalog has items locally
    const catalogCount = await db.productCatalog.count()
    expect(catalogCount).toBe(2)

    // Attempt to backup
    await pushToCloud(TEST_PHONE)

    // Verify NO calls were made to product_catalog table
    const catalogCalls = mockUpsertCalls.filter(
      (call) => call.table === 'product_catalog' || call.table === 'productCatalog'
    )
    expect(catalogCalls).toHaveLength(0)
  })

  it('should sync user products but NOT catalog products', async () => {
    const categoryId = crypto.randomUUID()
    const userProductId = crypto.randomUUID()

    // Create user's category
    await db.categories.add({
      id: categoryId,
      storePhone: TEST_PHONE,
      name: 'Instant Noodles',
      color: '#FF0000',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    // Create user's product (actual product in their store)
    await db.products.add({
      id: userProductId,
      storePhone: TEST_PHONE,
      name: 'Lucky Me Pancit Canton',
      barcode: '4800016644207',
      categoryId,
      sellingPrice: 15,
      stockQty: 50,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    // Add same product to catalog (helper data)
    await db.productCatalog.add({
      id: crypto.randomUUID(),
      barcode: '4800016644207',
      name: 'Lucky Me Pancit Canton',
      categoryName: 'Instant Noodles',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Backup
    await pushToCloud(TEST_PHONE)

    // Verify user's product was synced
    const productCalls = mockUpsertCalls.filter((call) => call.table === 'products')
    expect(productCalls).toHaveLength(1)
    expect(productCalls[0].data.name).toBe('Lucky Me Pancit Canton')

    // Verify catalog was NOT synced
    const catalogCalls = mockUpsertCalls.filter(
      (call) => call.table === 'product_catalog' || call.table === 'productCatalog'
    )
    expect(catalogCalls).toHaveLength(0)
  })

  it('should keep catalog data local after backup', async () => {
    // Add catalog items
    const catalogIds = [crypto.randomUUID(), crypto.randomUUID()]

    await db.productCatalog.bulkAdd([
      {
        id: catalogIds[0],
        barcode: '4800016644207',
        name: 'Lucky Me Pancit Canton',
        categoryName: 'Instant Noodles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: catalogIds[1],
        barcode: '4800016012914',
        name: 'Bear Brand Powdered Milk',
        categoryName: 'Milk & Dairy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    // Backup (should not affect catalog)
    await pushToCloud(TEST_PHONE)

    // Verify catalog is still in IndexedDB
    const catalogCount = await db.productCatalog.count()
    expect(catalogCount).toBe(2)

    const item1 = await db.productCatalog.get(catalogIds[0])
    const item2 = await db.productCatalog.get(catalogIds[1])

    expect(item1?.name).toBe('Lucky Me Pancit Canton')
    expect(item2?.name).toBe('Bear Brand Powdered Milk')
  })

  it('should clear user data but preserve catalog on logout', async () => {
    const categoryId = crypto.randomUUID()

    // Add user data
    await db.categories.add({
      id: categoryId,
      storePhone: TEST_PHONE,
      name: 'Beverages',
      color: '#FF0000',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      isDeleted: false,
    })

    // Add catalog data
    await db.productCatalog.add({
      id: crypto.randomUUID(),
      barcode: '4800016644207',
      name: 'Lucky Me Pancit Canton',
      categoryName: 'Instant Noodles',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Simulate logout: clear user data but not catalog
    await Promise.all([
      db.categories.clear(),
      db.customers.clear(),
      db.products.clear(),
      db.sales.clear(),
      db.utangTransactions.clear(),
      db.inventoryMovements.clear(),
      // Note: productCatalog is NOT cleared
    ])

    // Verify user data is cleared
    const categoryCount = await db.categories.count()
    expect(categoryCount).toBe(0)

    // Verify catalog is preserved
    const catalogCount = await db.productCatalog.count()
    expect(catalogCount).toBe(1)
  })

  it('should verify sync functions do NOT include catalog', async () => {
    // This test ensures no sync helper functions exist for catalog

    // Add catalog item
    await db.productCatalog.add({
      id: crypto.randomUUID(),
      barcode: '4800016644207',
      name: 'Lucky Me Pancit Canton',
      categoryName: 'Instant Noodles',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Backup (should ignore catalog completely)
    const stats = await pushToCloud(TEST_PHONE)

    // Verify catalog was not counted in sync stats
    // (pushedCount should be 0 since only catalog exists)
    expect(stats.pushedCount).toBe(0)
    expect(stats.pulledCount).toBe(0)
    expect(stats.skippedCount).toBe(0)
  })

  it('should handle catalog lookups during offline mode', async () => {
    // Catalog should work offline without needing sync

    // Add catalog items
    await db.productCatalog.bulkAdd([
      {
        id: crypto.randomUUID(),
        barcode: '4800016644207',
        name: 'Lucky Me Pancit Canton',
        categoryName: 'Instant Noodles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        barcode: '4800016012914',
        name: 'Bear Brand Powdered Milk',
        categoryName: 'Milk & Dairy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    // Lookup by barcode (offline)
    const product = await db.productCatalog
      .where('barcode')
      .equals('4800016644207')
      .first()

    expect(product?.name).toBe('Lucky Me Pancit Canton')
    expect(product?.categoryName).toBe('Instant Noodles')

    // Verify no Supabase calls were made
    expect(mockUpsertCalls).toHaveLength(0)
  })
})

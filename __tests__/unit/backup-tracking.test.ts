/**
 * Unit tests for backup offline change tracking
 * Tests syncedAt tracking, hasUnsyncedChanges, and offline change detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { hasUnsyncedChanges } from '@/lib/db/sync'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    }))
  })
}))

const TEST_PHONE = '09171234567'

describe('Backup Offline Change Tracking', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await Promise.all([
      db.categories.clear(),
      db.customers.clear(),
      db.products.clear(),
      db.sales.clear(),
      db.utangTransactions.clear(),
      db.inventoryMovements.clear(),
    ])
  })

  describe('hasUnsyncedChanges', () => {
    it('should return false when no data exists', async () => {
      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(false)
    })

    it('should return false when all items are synced', async () => {
      await db.categories.add({
        id: '1',
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(), // Synced
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(false)
    })

    it('should return true when category has unsynced changes', async () => {
      await db.categories.add({
        id: '1',
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null, // NOT synced
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(true)
    })

    it('should return true when product has unsynced changes', async () => {
      const categoryId = crypto.randomUUID()

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

      await db.products.add({
        id: crypto.randomUUID(),
        storePhone: TEST_PHONE,
        name: 'Coke',
        barcode: '123456',
        categoryId,
        sellingPrice: 25,
        stockQty: 100,
        lowStockThreshold: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null, // NOT synced
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(true)
    })

    it('should ignore deleted items when checking unsynced changes', async () => {
      await db.categories.add({
        id: '1',
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: true, // Deleted - should be ignored
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(false)
    })

    it('should only count items for the specified phone', async () => {
      // Add item for different phone
      await db.categories.add({
        id: '1',
        storePhone: '09999999999', // Different phone
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(false)
    })

    it('should detect unsynced changes across multiple tables', async () => {
      const categoryId = crypto.randomUUID()
      const customerId = crypto.randomUUID()

      // Synced category
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

      // Unsynced customer
      await db.customers.add({
        id: customerId,
        storePhone: TEST_PHONE,
        name: 'Juan Dela Cruz',
        phone: '09171234567',
        address: 'Manila',
        totalUtang: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null, // NOT synced
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(true)
    })

    it('should handle sale items correctly', async () => {
      const categoryId = crypto.randomUUID()
      const productId = crypto.randomUUID()

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

      await db.products.add({
        id: productId,
        storePhone: TEST_PHONE,
        name: 'Coke',
        barcode: '123456',
        categoryId,
        sellingPrice: 25,
        stockQty: 100,
        lowStockThreshold: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
        isDeleted: false,
      })

      // Unsynced sale
      await db.sales.add({
        id: crypto.randomUUID(),
        storePhone: TEST_PHONE,
        items: [
          {
            productId,
            productName: 'Coke',
            quantity: 2,
            unitPrice: 25,
            total: 50,
          },
        ],
        subtotal: 50,
        discount: 0,
        total: 50,
        amountPaid: 50,
        change: 0,
        paymentMethod: 'cash',
        customerId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null, // NOT synced
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(true)
    })
  })

  describe('syncedAt tracking', () => {
    it('should set syncedAt to null when creating new item', async () => {
      const id = crypto.randomUUID()

      await db.categories.add({
        id,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      const item = await db.categories.get(id)
      expect(item?.syncedAt).toBe(null)
    })

    it('should preserve syncedAt when updating unrelated field', async () => {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      await db.categories.add({
        id,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
        isDeleted: false,
      })

      // Update without changing syncedAt
      await db.categories.update(id, {
        name: 'Updated Name',
        updatedAt: new Date().toISOString(),
      })

      const item = await db.categories.get(id)
      expect(item?.syncedAt).toBe(now)
      expect(item?.name).toBe('Updated Name')
    })

    it('should reset syncedAt to null when making data changes', async () => {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      await db.categories.add({
        id,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
        isDeleted: false,
      })

      // Update and reset syncedAt
      await db.categories.update(id, {
        name: 'Updated Name',
        updatedAt: new Date().toISOString(),
        syncedAt: null, // Must explicitly set to null
      })

      const item = await db.categories.get(id)
      expect(item?.syncedAt).toBe(null)
    })
  })

  describe('offline change tracking edge cases', () => {
    it('should handle empty tables gracefully', async () => {
      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(false)
    })

    it('should handle mixed synced/unsynced items', async () => {
      // Synced item
      await db.categories.add({
        id: '1',
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
        isDeleted: false,
      })

      // Unsynced item
      await db.categories.add({
        id: '2',
        storePhone: TEST_PHONE,
        name: 'Snacks',
        color: '#00FF00',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(true)
    })

    it('should handle large number of items efficiently', async () => {
      // Create 100 synced items
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          db.categories.add({
            id: `cat-${i}`,
            storePhone: TEST_PHONE,
            name: `Category ${i}`,
            color: '#FF0000',
            sortOrder: i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
            isDeleted: false,
          })
        )
      }
      await Promise.all(promises)

      const result = await hasUnsyncedChanges(TEST_PHONE)
      expect(result).toBe(false)
    })
  })
})

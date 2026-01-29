/**
 * Integration tests for full backup workflow
 * Tests: offline changes → backup → restore → verify data integrity
 * Pattern: Offline-first → Supabase backup/restore only
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { pushToCloud, pullFromCloud, hasUnsyncedChanges } from '@/lib/db/sync'

const TEST_PHONE = '09171234567'

// Mock Supabase client with in-memory storage
const mockSupabaseStorage: Record<string, any[]> = {
  categories: [],
  customers: [],
  products: [],
  sales: [],
  utang_transactions: [],
  inventory_movements: [],
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      upsert: vi.fn(async (data: any) => {
        // Simulate upsert to mock storage
        const existingIndex = mockSupabaseStorage[table].findIndex(
          (item) => item.id === data.id
        )
        if (existingIndex >= 0) {
          mockSupabaseStorage[table][existingIndex] = data
        } else {
          mockSupabaseStorage[table].push(data)
        }
        return { error: null }
      }),
      select: vi.fn(() => ({
        eq: vi.fn((column: string, value: any) => ({
          eq: vi.fn((column2: string, value2: any) => {
            // Filter mock storage by store_phone and is_deleted
            const filtered = mockSupabaseStorage[table].filter(
              (item) => item.store_phone === value && item.is_deleted === value2
            )
            return Promise.resolve({ data: filtered, error: null })
          }),
        })),
      })),
    }),
  }),
}))

describe('Backup Workflow Integration Tests', () => {
  beforeEach(async () => {
    // Clear local IndexedDB
    await Promise.all([
      db.categories.clear(),
      db.customers.clear(),
      db.products.clear(),
      db.sales.clear(),
      db.utangTransactions.clear(),
      db.inventoryMovements.clear(),
    ])

    // Clear mock Supabase storage
    Object.keys(mockSupabaseStorage).forEach((key) => {
      mockSupabaseStorage[key] = []
    })
  })

  describe('Offline-first workflow', () => {
    it('should track offline changes and backup to cloud', async () => {
      // 1. Create data offline (syncedAt = null)
      const categoryId = crypto.randomUUID()
      await db.categories.add({
        id: categoryId,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null, // Offline change
        isDeleted: false,
      })

      // 2. Verify unsynced changes detected
      const hasPending = await hasUnsyncedChanges(TEST_PHONE)
      expect(hasPending).toBe(true)

      // 3. Push to cloud (backup)
      const pushStats = await pushToCloud(TEST_PHONE)
      expect(pushStats.pushedCount).toBe(1)

      // 4. Verify syncedAt is set after backup
      const category = await db.categories.get(categoryId)
      expect(category?.syncedAt).not.toBe(null)

      // 5. Verify no more pending changes
      const hasPendingAfter = await hasUnsyncedChanges(TEST_PHONE)
      expect(hasPendingAfter).toBe(false)

      // 6. Verify data is in mock cloud storage
      expect(mockSupabaseStorage.categories).toHaveLength(1)
      expect(mockSupabaseStorage.categories[0].name).toBe('Beverages')
    })

    it('should restore data from cloud to new device', async () => {
      // 1. Simulate data already in cloud (from previous backup)
      mockSupabaseStorage.categories.push({
        id: crypto.randomUUID(),
        store_phone: TEST_PHONE,
        name: 'Cloud Category',
        color: '#00FF00',
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        is_deleted: false,
      })

      // 2. Pull from cloud (restore on new device)
      const pullStats = await pullFromCloud(TEST_PHONE)
      expect(pullStats.pulledCount).toBe(1)

      // 3. Verify data is in local IndexedDB
      const categories = await db.categories.toArray()
      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Cloud Category')
      expect(categories[0].syncedAt).not.toBe(null)
    })

    it('should handle full offline → backup → restore cycle', async () => {
      // STEP 1: Create data offline
      const categoryId = crypto.randomUUID()
      const productId = crypto.randomUUID()
      const customerId = crypto.randomUUID()

      await db.categories.add({
        id: categoryId,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
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
        syncedAt: null,
        isDeleted: false,
      })

      await db.customers.add({
        id: customerId,
        storePhone: TEST_PHONE,
        name: 'Juan Dela Cruz',
        phone: '09171234567',
        address: 'Manila',
        totalUtang: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      // STEP 2: Verify pending changes
      const hasPending = await hasUnsyncedChanges(TEST_PHONE)
      expect(hasPending).toBe(true)

      // STEP 3: Backup to cloud
      const pushStats = await pushToCloud(TEST_PHONE)
      expect(pushStats.pushedCount).toBe(3) // 1 category + 1 product + 1 customer

      // STEP 4: Clear local data (simulate new device)
      await db.categories.clear()
      await db.products.clear()
      await db.customers.clear()

      // STEP 5: Restore from cloud
      const pullStats = await pullFromCloud(TEST_PHONE)
      expect(pullStats.pulledCount).toBe(3)

      // STEP 6: Verify data integrity
      const categories = await db.categories.toArray()
      const products = await db.products.toArray()
      const customers = await db.customers.toArray()

      expect(categories).toHaveLength(1)
      expect(products).toHaveLength(1)
      expect(customers).toHaveLength(1)

      expect(categories[0].name).toBe('Beverages')
      expect(products[0].name).toBe('Coke')
      expect(customers[0].name).toBe('Juan Dela Cruz')

      // All restored items should have syncedAt set
      expect(categories[0].syncedAt).not.toBe(null)
      expect(products[0].syncedAt).not.toBe(null)
      expect(customers[0].syncedAt).not.toBe(null)
    })

    it('should only sync data for the specified store phone', async () => {
      const phone1 = '09171234567'
      const phone2 = '09999999999'

      // Create data for two different phones
      await db.categories.add({
        id: crypto.randomUUID(),
        storePhone: phone1,
        name: 'Phone1 Category',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      await db.categories.add({
        id: crypto.randomUUID(),
        storePhone: phone2,
        name: 'Phone2 Category',
        color: '#00FF00',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      // Backup only phone1 data
      const pushStats = await pushToCloud(phone1)
      expect(pushStats.pushedCount).toBe(1)

      // Verify only phone1 data is in cloud
      expect(mockSupabaseStorage.categories).toHaveLength(1)
      expect(mockSupabaseStorage.categories[0].name).toBe('Phone1 Category')
    })

    it('should ignore deleted items during backup', async () => {
      const id1 = crypto.randomUUID()
      const id2 = crypto.randomUUID()

      // Active category
      await db.categories.add({
        id: id1,
        storePhone: TEST_PHONE,
        name: 'Active Category',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      // Deleted category
      await db.categories.add({
        id: id2,
        storePhone: TEST_PHONE,
        name: 'Deleted Category',
        color: '#00FF00',
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: true, // Soft deleted
      })

      // Backup
      const pushStats = await pushToCloud(TEST_PHONE)
      expect(pushStats.pushedCount).toBe(1) // Only active item

      // Verify only active item is in cloud
      expect(mockSupabaseStorage.categories).toHaveLength(1)
      expect(mockSupabaseStorage.categories[0].name).toBe('Active Category')
    })
  })

  describe('Complex data scenarios', () => {
    it('should handle sales with items array', async () => {
      const categoryId = crypto.randomUUID()
      const productId = crypto.randomUUID()
      const saleId = crypto.randomUUID()

      // Create dependencies
      await db.categories.add({
        id: categoryId,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
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
        syncedAt: null,
        isDeleted: false,
      })

      // Create sale with items
      await db.sales.add({
        id: saleId,
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
        syncedAt: null,
        isDeleted: false,
      })

      // Backup all data
      const pushStats = await pushToCloud(TEST_PHONE)
      expect(pushStats.pushedCount).toBe(3)

      // Clear and restore
      await db.categories.clear()
      await db.products.clear()
      await db.sales.clear()

      const pullStats = await pullFromCloud(TEST_PHONE)
      expect(pullStats.pulledCount).toBe(3)

      // Verify sale items are intact
      const sale = await db.sales.get(saleId)
      expect(sale?.items).toHaveLength(1)
      expect(sale?.items[0].productName).toBe('Coke')
      expect(sale?.items[0].quantity).toBe(2)
    })

    it('should handle utang transactions', async () => {
      const customerId = crypto.randomUUID()
      const txnId = crypto.randomUUID()

      await db.customers.add({
        id: customerId,
        storePhone: TEST_PHONE,
        name: 'Juan Dela Cruz',
        phone: '09171234567',
        address: 'Manila',
        totalUtang: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      await db.utangTransactions.add({
        id: txnId,
        storePhone: TEST_PHONE,
        customerId,
        saleId: null,
        type: 'charge',
        amount: 100,
        balanceAfter: 100,
        notes: 'Initial charge',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      const pushStats = await pushToCloud(TEST_PHONE)
      expect(pushStats.pushedCount).toBe(2)

      await db.customers.clear()
      await db.utangTransactions.clear()

      const pullStats = await pullFromCloud(TEST_PHONE)
      expect(pullStats.pulledCount).toBe(2)

      const txn = await db.utangTransactions.get(txnId)
      expect(txn?.type).toBe('charge')
      expect(txn?.amount).toBe(100)
    })

    it('should handle inventory movements', async () => {
      const categoryId = crypto.randomUUID()
      const productId = crypto.randomUUID()
      const movementId = crypto.randomUUID()

      await db.categories.add({
        id: categoryId,
        storePhone: TEST_PHONE,
        name: 'Beverages',
        color: '#FF0000',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
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
        syncedAt: null,
        isDeleted: false,
      })

      await db.inventoryMovements.add({
        id: movementId,
        storePhone: TEST_PHONE,
        productId,
        type: 'in',
        qty: 50,
        notes: 'Initial stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      const pushStats = await pushToCloud(TEST_PHONE)
      expect(pushStats.pushedCount).toBe(3)

      await db.categories.clear()
      await db.products.clear()
      await db.inventoryMovements.clear()

      const pullStats = await pullFromCloud(TEST_PHONE)
      expect(pullStats.pulledCount).toBe(3)

      const movement = await db.inventoryMovements.get(movementId)
      expect(movement?.type).toBe('in')
      expect(movement?.qty).toBe(50)
    })
  })
})

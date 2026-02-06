/**
 * Integration Test: POS Checkout Flow
 *
 * Tests the complete checkout process:
 * - Creating a sale
 * - Updating product stock
 * - Recording inventory movements
 * - Payment processing
 * - Atomic transactions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { processSale } from '@/lib/actions/pos'
import type { Product } from '@/lib/db/schema'

describe('POS - Checkout Flow', () => {
  const mockUserId = 'test-user-uuid-123'

  beforeEach(async () => {
    await clearAllLocalData()

    // Seed test data
    await db.categories.add({
      id: 'cat-1',
      userId: mockUserId,
      name: 'Beverages',
      color: '#3b82f6',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    await db.products.add({
      id: 'prod-1',
      userId: mockUserId,
      name: 'Coca Cola 1.5L',
      barcode: '4800888111111',
      categoryId: 'cat-1',
      sellingPrice: 50,
      stockQty: 100,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    await db.products.add({
      id: 'prod-2',
      userId: mockUserId,
      name: 'Sprite 1.5L',
      barcode: '4800888222222',
      categoryId: 'cat-1',
      sellingPrice: 45,
      stockQty: 50,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    await db.customers.add({
      id: 'cust-1',
      userId: mockUserId,
      name: 'Juan Dela Cruz',
      phone: '09171234567',
      address: 'Brgy. Test',
      totalUtang: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })
  })

  it('should complete cash sale and update stock', async () => {
    const saleId = await processSale({
      userId: mockUserId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Coca Cola 1.5L',
          quantity: 2,
          unitPrice: 50,
          total: 100,
        },
        {
          productId: 'prod-2',
          productName: 'Sprite 1.5L',
          quantity: 1,
          unitPrice: 45,
          total: 45,
        },
      ],
      subtotal: 145,
      discount: 0,
      total: 145,
      amountPaid: 200,
      paymentMethod: 'cash',
      customerId: null,
    })

    expect(saleId).toBeDefined()

    // Verify sale was created
    const sale = await db.sales.get(saleId)
    expect(sale).toBeDefined()
    expect(sale!.items).toHaveLength(2)
    expect(sale!.total).toBe(145)
    expect(sale!.paymentMethod).toBe('cash')
    expect(sale!.change).toBe(55)
    expect(sale!.syncedAt).toBeNull()

    // Verify stock was updated
    const product1 = await db.products.get('prod-1')
    expect(product1!.stockQty).toBe(98)

    const product2 = await db.products.get('prod-2')
    expect(product2!.stockQty).toBe(49)

    // Verify inventory movements were created
    const movements = await db.inventoryMovements
      .filter((m) => m.userId === mockUserId)
      .toArray()

    expect(movements).toHaveLength(2)
    expect(movements.find((m) => m.productId === 'prod-1')?.qty).toBe(2)
    expect(movements.find((m) => m.productId === 'prod-2')?.qty).toBe(1)
    expect(movements.every((m) => m.type === 'out')).toBe(true)
  })

  it('should handle GCash payment', async () => {
    const saleId = await processSale({
      userId: mockUserId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Coca Cola 1.5L',
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
      subtotal: 50,
      discount: 0,
      total: 50,
      amountPaid: 50,
      paymentMethod: 'gcash',
      customerId: null,
    })

    expect(saleId).toBeDefined()

    const sale = await db.sales.get(saleId)
    expect(sale!.paymentMethod).toBe('gcash')
    expect(sale!.change).toBe(0)
  })

  it('should handle utang (credit) payment', async () => {
    const saleId = await processSale({
      userId: mockUserId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Coca Cola 1.5L',
          quantity: 3,
          unitPrice: 50,
          total: 150,
        },
      ],
      subtotal: 150,
      discount: 0,
      total: 150,
      amountPaid: 0,
      paymentMethod: 'utang',
      customerId: 'cust-1',
    })

    expect(saleId).toBeDefined()

    // Verify sale
    const sale = await db.sales.get(saleId)
    expect(sale!.paymentMethod).toBe('utang')
    expect(sale!.customerId).toBe('cust-1')

    // Verify customer balance was updated
    const customer = await db.customers.get('cust-1')
    expect(customer!.totalUtang).toBe(150)

    // Verify utang transaction was created
    const transactions = await db.utangTransactions
      .filter((t) => t.customerId === 'cust-1')
      .toArray()

    expect(transactions).toHaveLength(1)
    expect(transactions[0].type).toBe('charge')
    expect(transactions[0].amount).toBe(150)
    expect(transactions[0].balanceAfter).toBe(150)
    expect(transactions[0].saleId).toBe(saleId)
  })

  it('should apply discount correctly', async () => {
    const saleId = await processSale({
      userId: mockUserId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Coca Cola 1.5L',
          quantity: 2,
          unitPrice: 50,
          total: 100,
        },
      ],
      subtotal: 100,
      discount: 10,
      total: 90,
      amountPaid: 100,
      paymentMethod: 'cash',
      customerId: null,
    })

    expect(saleId).toBeDefined()

    const sale = await db.sales.get(saleId)
    expect(sale!.subtotal).toBe(100)
    expect(sale!.discount).toBe(10)
    expect(sale!.total).toBe(90)
  })

  it('should fail if insufficient stock', async () => {
    await expect(
      processSale({
        userId: mockUserId,
        items: [
          {
            productId: 'prod-1',
            productName: 'Coca Cola 1.5L',
            quantity: 200,
            unitPrice: 50,
            total: 10000,
          },
        ],
        subtotal: 10000,
        discount: 0,
        total: 10000,
        amountPaid: 10000,
        paymentMethod: 'cash',
        customerId: null,
      })
    ).rejects.toThrow(/Insufficient stock/)

    // Verify no sale was created
    const sales = await db.sales.toArray()
    expect(sales).toHaveLength(0)

    // Verify stock was not changed
    const product = await db.products.get('prod-1')
    expect(product!.stockQty).toBe(100)
  })

  it('should fail if product not found', async () => {
    await expect(
      processSale({
        userId: mockUserId,
        items: [
          {
            productId: 'non-existent',
            productName: 'Ghost Product',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ],
        subtotal: 50,
        discount: 0,
        total: 50,
        amountPaid: 50,
        paymentMethod: 'cash',
        customerId: null,
      })
    ).rejects.toThrow(/not found/)
  })

  it('should maintain atomicity - all or nothing', async () => {
    // First, create a successful sale
    await processSale({
      userId: mockUserId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Coca Cola 1.5L',
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
      subtotal: 50,
      discount: 0,
      total: 50,
      amountPaid: 50,
      paymentMethod: 'cash',
      customerId: null,
    })

    // Now try a failed sale
    try {
      await processSale({
        userId: mockUserId,
        items: [
          {
            productId: 'prod-1',
            productName: 'Coca Cola 1.5L',
            quantity: 200,
            unitPrice: 50,
            total: 10000,
          },
        ],
        subtotal: 10000,
        discount: 0,
        total: 10000,
        amountPaid: 10000,
        paymentMethod: 'cash',
        customerId: null,
      })
    } catch (error) {
      // Expected to fail
    }

    // Verify only 1 sale exists (the successful one)
    const sales = await db.sales.toArray()
    expect(sales).toHaveLength(1)

    // Verify stock is correct (only 1 item sold)
    const product = await db.products.get('prod-1')
    expect(product!.stockQty).toBe(99)

    // Verify only 1 inventory movement
    const movements = await db.inventoryMovements.toArray()
    expect(movements).toHaveLength(1)
  })

  it('should mark data as unsynced after sale', async () => {
    const saleId = await processSale({
      userId: mockUserId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Coca Cola 1.5L',
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
      subtotal: 50,
      discount: 0,
      total: 50,
      amountPaid: 50,
      paymentMethod: 'cash',
      customerId: null,
    })

    expect(saleId).toBeDefined()

    // Verify all modified records have syncedAt = null
    const sale = await db.sales.get(saleId)
    expect(sale!.syncedAt).toBeNull()

    const product = await db.products.get('prod-1')
    expect(product!.syncedAt).toBeNull()

    const movements = await db.inventoryMovements.toArray()
    expect(movements.every((m) => m.syncedAt === null)).toBe(true)
  })
})

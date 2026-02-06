/**
 * Unit Test: POS Cart Operations
 *
 * Tests the cart functionality including:
 * - Adding items to cart
 * - Updating quantities
 * - Removing items
 * - Cart validation
 * - Stock availability checks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/lib/stores/cart-store'
import { db } from '@/lib/db'
import type { Product } from '@/lib/db/schema'

describe('POS - Cart Operations', () => {
  const mockUserId = 'test-user-uuid-123'

  beforeEach(async () => {
    // Clear database
    await db.products.clear()
    await db.categories.clear()

    // Reset cart store
    useCartStore.setState({
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      amountPaid: 0,
      change: 0,
      paymentMethod: 'cash',
      customerId: null,
    })

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
      sellingPrice: 50,
      stockQty: 5, // Low stock
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
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
    }

    act(() => {
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe('prod-1')
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.items[0].unitPrice).toBe(50)
    expect(result.current.subtotal).toBe(50)
    expect(result.current.total).toBe(50)
  })

  it('should increment quantity when adding same item', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
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
    }

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.subtotal).toBe(150)
    expect(result.current.total).toBe(150)
  })

  it('should not exceed available stock', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
      id: 'prod-2',
      userId: mockUserId,
      name: 'Sprite 1.5L',
      barcode: '4800888222222',
      categoryId: 'cat-1',
      sellingPrice: 50,
      stockQty: 5, // Only 5 in stock
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    }

    act(() => {
      // Try to add 10 items when only 5 available
      for (let i = 0; i < 10; i++) {
        result.current.addItem(product)
      }
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(5) // Should cap at available stock
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
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
    }

    act(() => {
      result.current.addItem(product)
      result.current.updateQuantity('prod-1', 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.subtotal).toBe(250)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
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
    }

    act(() => {
      result.current.addItem(product)
      result.current.removeItem('prod-1')
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
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
    }

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product) // 2 items = 100
    })

    expect(result.current.subtotal).toBe(100)
    expect(result.current.total).toBe(100)
  })

  it('should set payment method', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.setPaymentMethod('gcash')
    })

    expect(result.current.paymentMethod).toBe('gcash')

    act(() => {
      result.current.setPaymentMethod('utang')
    })

    expect(result.current.paymentMethod).toBe('utang')
  })

  it('should clear cart', () => {
    const { result } = renderHook(() => useCartStore())

    const product: Product = {
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
    }

    act(() => {
      result.current.addItem(product)
      result.current.setPaymentMethod('gcash')
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('should handle multiple different products', () => {
    const { result } = renderHook(() => useCartStore())

    const product1: Product = {
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
    }

    const product2: Product = {
      id: 'prod-2',
      userId: mockUserId,
      name: 'Sprite 1.5L',
      barcode: '4800888222222',
      categoryId: 'cat-1',
      sellingPrice: 50,
      stockQty: 5,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    }

    act(() => {
      result.current.addItem(product1)
      result.current.addItem(product1)
      result.current.addItem(product2)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items.find((i) => i.productId === 'prod-1')?.quantity).toBe(2)
    expect(result.current.items.find((i) => i.productId === 'prod-2')?.quantity).toBe(1)
    expect(result.current.subtotal).toBe(150) // 100 + 50
  })
})

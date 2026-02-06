/**
 * Unit Test: Multi-User Isolation for Products and Categories
 *
 * Tests that products and categories are properly isolated between different users:
 * - Category name uniqueness is scoped to user
 * - Product barcode uniqueness is scoped to user
 * - Users cannot see each other's data
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { createProduct, createCategory } from '@/lib/actions/products'
import type { Category, Product } from '@/lib/db/schema'

describe('Multi-User Isolation - Products & Categories', () => {
  const seller1UserId = 'seller-1'
  const seller2UserId = 'seller-2'
  let seller1CategoryId: string
  let seller2CategoryId: string

  beforeEach(async () => {
    // Clear DB before each test
    await clearAllLocalData()

    // Create categories for both sellers
    seller1CategoryId = await createCategory({
      name: 'Softdrinks',
      color: '#3b82f6',
      sortOrder: 1,
      userId: seller1UserId,
    })

    seller2CategoryId = await createCategory({
      name: 'Snacks',
      color: '#f97316',
      sortOrder: 1,
      userId: seller2UserId,
    })
  })

  describe('Category Isolation', () => {
    it('should allow duplicate category names across different users', async () => {
      // Seller 1 creates "Frozen Goods"
      const seller1FrozenId = await createCategory({
        name: 'Frozen Goods',
        color: '#06b6d4',
        sortOrder: 2,
        userId: seller1UserId,
      })

      expect(seller1FrozenId).toBeDefined()

      // Seller 2 should be able to create "Frozen Goods" too
      const seller2FrozenId = await createCategory({
        name: 'Frozen Goods',
        color: '#10b981',
        sortOrder: 2,
        userId: seller2UserId,
      })

      expect(seller2FrozenId).toBeDefined()
      expect(seller2FrozenId).not.toBe(seller1FrozenId)

      // Verify both exist in DB
      const seller1Categories = await db.categories
        .filter((c) => c.userId === seller1UserId && !c.isDeleted)
        .toArray()
      const seller2Categories = await db.categories
        .filter((c) => c.userId === seller2UserId && !c.isDeleted)
        .toArray()

      expect(seller1Categories.find((c) => c.name === 'Frozen Goods')).toBeDefined()
      expect(seller2Categories.find((c) => c.name === 'Frozen Goods')).toBeDefined()
    })

    it('should prevent duplicate category names within same user', async () => {
      // Seller 1 creates "Frozen Goods"
      await createCategory({
        name: 'Frozen Goods',
        color: '#06b6d4',
        sortOrder: 2,
        userId: seller1UserId,
      })

      // Seller 1 tries to create duplicate "Frozen Goods"
      await expect(
        createCategory({
          name: 'Frozen Goods',
          color: '#10b981',
          sortOrder: 3,
          userId: seller1UserId,
        })
      ).rejects.toThrow('A category with this name already exists')
    })

    it('should not show other users categories', async () => {
      // Seller 1 has "Softdrinks" (from beforeEach)
      const seller1Categories = await db.categories
        .filter((c) => c.userId === seller1UserId && !c.isDeleted)
        .toArray()

      // Seller 2 has "Snacks" (from beforeEach)
      const seller2Categories = await db.categories
        .filter((c) => c.userId === seller2UserId && !c.isDeleted)
        .toArray()

      expect(seller1Categories).toHaveLength(1)
      expect(seller1Categories[0].name).toBe('Softdrinks')

      expect(seller2Categories).toHaveLength(1)
      expect(seller2Categories[0].name).toBe('Snacks')
    })
  })

  describe('Product Isolation', () => {
    it('should allow duplicate barcodes across different users', async () => {
      const barcode = '4800016644207' // Coke 1.5L

      // Seller 1 creates product with barcode
      const seller1ProductId = await createProduct({
        name: 'Coca Cola 1.5L',
        barcode,
        categoryId: seller1CategoryId,
        sellingPrice: 50,
        stockQty: 24,
        lowStockThreshold: 10,
        userId: seller1UserId,
      })

      expect(seller1ProductId).toBeDefined()

      // Seller 2 should be able to use same barcode
      const seller2ProductId = await createProduct({
        name: 'Coca Cola 1.5L',
        barcode,
        categoryId: seller2CategoryId,
        sellingPrice: 48,
        stockQty: 12,
        lowStockThreshold: 5,
        userId: seller2UserId,
      })

      expect(seller2ProductId).toBeDefined()
      expect(seller2ProductId).not.toBe(seller1ProductId)

      // Verify both exist in DB
      const seller1Products = await db.products
        .filter((p) => p.userId === seller1UserId && !p.isDeleted)
        .toArray()
      const seller2Products = await db.products
        .filter((p) => p.userId === seller2UserId && !p.isDeleted)
        .toArray()

      expect(seller1Products.find((p) => p.barcode === barcode)).toBeDefined()
      expect(seller2Products.find((p) => p.barcode === barcode)).toBeDefined()
    })

    it('should prevent duplicate barcodes within same user', async () => {
      const barcode = '4800016644207'

      // Seller 1 creates product with barcode
      await createProduct({
        name: 'Coca Cola 1.5L',
        barcode,
        categoryId: seller1CategoryId,
        sellingPrice: 50,
        stockQty: 24,
        lowStockThreshold: 10,
        userId: seller1UserId,
      })

      // Seller 1 tries to create another product with same barcode
      await expect(
        createProduct({
          name: 'Sprite 1.5L',
          barcode,
          categoryId: seller1CategoryId,
          costPrice: 40,
          sellingPrice: 50,
          stockQty: 12,
          lowStockThreshold: 10,
          userId: seller1UserId,
        })
      ).rejects.toThrow('A product with this barcode already exists')
    })

    it('should not show other users products', async () => {
      // Seller 1 creates a product
      await createProduct({
        name: 'Coca Cola 1.5L',
        barcode: '4800016644207',
        categoryId: seller1CategoryId,
        sellingPrice: 50,
        stockQty: 24,
        lowStockThreshold: 10,
        userId: seller1UserId,
      })

      // Seller 2 creates a product
      await createProduct({
        name: 'Chippy',
        barcode: null,
        categoryId: seller2CategoryId,
        sellingPrice: 7,
        stockQty: 50,
        lowStockThreshold: 20,
        userId: seller2UserId,
      })

      // Seller 1 should only see their product
      const seller1Products = await db.products
        .filter((p) => p.userId === seller1UserId && !p.isDeleted)
        .toArray()

      // Seller 2 should only see their product
      const seller2Products = await db.products
        .filter((p) => p.userId === seller2UserId && !p.isDeleted)
        .toArray()

      expect(seller1Products).toHaveLength(1)
      expect(seller1Products[0].name).toBe('Coca Cola 1.5L')

      expect(seller2Products).toHaveLength(1)
      expect(seller2Products[0].name).toBe('Chippy')
    })
  })

  describe('Cross-User Scenarios', () => {
    it('should handle multiple sellers creating products simultaneously', async () => {
      // Simulate multiple sellers adding products at the same time
      const results = await Promise.all([
        // Seller 1 adds 3 products
        createProduct({
          name: 'Coke 1L',
          barcode: '111',
          categoryId: seller1CategoryId,
          sellingPrice: 40,
          stockQty: 10,
          lowStockThreshold: 5,
          userId: seller1UserId,
        }),
        createProduct({
          name: 'Sprite 1L',
          barcode: '222',
          categoryId: seller1CategoryId,
          sellingPrice: 40,
          stockQty: 10,
          lowStockThreshold: 5,
          userId: seller1UserId,
        }),
        createProduct({
          name: 'Royal 1L',
          barcode: '333',
          categoryId: seller1CategoryId,
          sellingPrice: 40,
          stockQty: 10,
          lowStockThreshold: 5,
          userId: seller1UserId,
        }),

        // Seller 2 adds 2 products (with same barcodes as Seller 1!)
        createProduct({
          name: 'Chippy',
          barcode: '111', // Same barcode as Seller 1's Coke
          categoryId: seller2CategoryId,
          costPrice: 5,
          sellingPrice: 7,
          stockQty: 20,
          lowStockThreshold: 10,
          userId: seller2UserId,
        }),
        createProduct({
          name: 'Piattos',
          barcode: '222', // Same barcode as Seller 1's Sprite
          categoryId: seller2CategoryId,
          sellingPrice: 20,
          stockQty: 15,
          lowStockThreshold: 8,
          userId: seller2UserId,
        }),
      ])

      // All creates should succeed
      expect(results).toHaveLength(5)
      expect(results.every((id) => typeof id === 'string')).toBe(true)

      // Verify correct counts
      const seller1Count = await db.products
        .filter((p) => p.userId === seller1UserId && !p.isDeleted)
        .count()
      const seller2Count = await db.products
        .filter((p) => p.userId === seller2UserId && !p.isDeleted)
        .count()

      expect(seller1Count).toBe(3)
      expect(seller2Count).toBe(2)
    })

    it('should seed 30 default categories per user independently', async () => {
      // Clear existing categories from beforeEach (seeder won't seed if categories exist)
      await clearAllLocalData()

      // Import the seeder
      const { seedDefaultCategories } = await import('@/lib/db/seeders')

      // Seed for both users
      await seedDefaultCategories(seller1UserId)
      await seedDefaultCategories(seller2UserId)

      // Each user should have 30 categories
      const seller1Categories = await db.categories
        .filter((c) => c.userId === seller1UserId && !c.isDeleted)
        .count()

      const seller2Categories = await db.categories
        .filter((c) => c.userId === seller2UserId && !c.isDeleted)
        .count()

      expect(seller1Categories).toBe(16) // 16 seeded
      expect(seller2Categories).toBe(16) // 16 seeded

      // Total categories in DB should be 32 (16 + 16)
      const totalCategories = await db.categories.filter((c) => !c.isDeleted).count()
      expect(totalCategories).toBe(32)
    })
  })
})

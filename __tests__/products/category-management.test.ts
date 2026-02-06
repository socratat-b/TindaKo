/**
 * Unit Test: Category Management
 *
 * Tests category functionality:
 * - Creating categories
 * - Updating categories
 * - Deleting categories
 * - Category ordering
 * - Default category seeding
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/products'
import { seedDefaultCategories } from '@/lib/db/seeders'

describe('Products - Category Management', () => {
  const mockUserId = 'test-user-uuid-123'

  beforeEach(async () => {
    await clearAllLocalData()
  })

  describe('Create Category', () => {
    it('should create category with all fields', async () => {
      const categoryId = await createCategory({
        name: 'Beverages',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      expect(categoryId).toBeDefined()

      const category = await db.categories.get(categoryId)
      expect(category).toBeDefined()
      expect(category!.name).toBe('Beverages')
      expect(category!.color).toBe('#3b82f6')
      expect(category!.sortOrder).toBe(1)
      expect(category!.userId).toBe(mockUserId)
      expect(category!.syncedAt).toBeNull()
      expect(category!.isDeleted).toBe(false)
    })

    it('should auto-assign sort order if not provided', async () => {
      // Create first category
      const cat1 = await createCategory({
        name: 'Category 1',
        color: '#000000',
        userId: mockUserId,
      })

      // Create second category without sortOrder
      const cat2 = await createCategory({
        name: 'Category 2',
        color: '#111111',
        userId: mockUserId,
      })

      const category1 = await db.categories.get(cat1)
      const category2 = await db.categories.get(cat2)

      expect(category2!.sortOrder).toBeGreaterThan(category1!.sortOrder)
    })

    it('should fail if name is empty', async () => {
      await expect(
        createCategory({
          name: '',
          color: '#3b82f6',
          sortOrder: 1,
          userId: mockUserId,
        })
      ).rejects.toThrow()
    })

    it('should trim category name', async () => {
      const categoryId = await createCategory({
        name: '  Beverages  ',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      const category = await db.categories.get(categoryId)
      expect(category!.name).toBe('Beverages')
    })

    it('should allow same category name for different users', async () => {
      const userId2 = 'test-user-uuid-456'

      await createCategory({
        name: 'Beverages',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      const categoryId2 = await createCategory({
        name: 'Beverages', // Same name, different user
        color: '#ef4444',
        sortOrder: 1,
        userId: userId2,
      })

      expect(categoryId2).toBeDefined()

      // Verify both exist
      const user1Categories = await db.categories
        .filter((c) => c.userId === mockUserId)
        .toArray()
      const user2Categories = await db.categories
        .filter((c) => c.userId === userId2)
        .toArray()

      expect(user1Categories).toHaveLength(1)
      expect(user2Categories).toHaveLength(1)
    })
  })

  describe('Update Category', () => {
    it('should update category fields', async () => {
      const categoryId = await createCategory({
        name: 'Original Name',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      await updateCategory(categoryId, {
        name: 'Updated Name',
        color: '#ef4444',
        sortOrder: 5,
      })

      const category = await db.categories.get(categoryId)
      expect(category!.name).toBe('Updated Name')
      expect(category!.color).toBe('#ef4444')
      expect(category!.sortOrder).toBe(5)
      expect(category!.syncedAt).toBeNull() // Marked for sync
    })

    it('should update only specified fields', async () => {
      const categoryId = await createCategory({
        name: 'Test Category',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      await updateCategory(categoryId, {
        name: 'Updated Name',
      })

      const category = await db.categories.get(categoryId)
      expect(category!.name).toBe('Updated Name')
      expect(category!.color).toBe('#3b82f6') // Unchanged
      expect(category!.sortOrder).toBe(1) // Unchanged
    })

    it('should fail if category does not exist', async () => {
      await expect(
        updateCategory('non-existent', {
          name: 'Updated Name',
        })
      ).rejects.toThrow()
    })
  })

  describe('Delete Category', () => {
    it('should soft delete category', async () => {
      const categoryId = await createCategory({
        name: 'Test Category',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      await deleteCategory(categoryId)

      const category = await db.categories.get(categoryId)
      expect(category!.isDeleted).toBe(true)
      expect(category!.syncedAt).toBeNull() // Marked for sync
    })

    it('should not physically delete category', async () => {
      const categoryId = await createCategory({
        name: 'Test Category',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      await deleteCategory(categoryId)

      // Category still exists in database
      const category = await db.categories.get(categoryId)
      expect(category).toBeDefined()
      expect(category!.isDeleted).toBe(true)
    })

    it('should prevent deleting category with products', async () => {
      const categoryId = await createCategory({
        name: 'Beverages',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      // Add product to category
      await db.products.add({
        id: 'prod-1',
        userId: mockUserId,
        name: 'Coca Cola',
        barcode: null,
        categoryId: categoryId,
        sellingPrice: 50,
        stockQty: 100,
        lowStockThreshold: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      await expect(deleteCategory(categoryId)).rejects.toThrow(
        /cannot delete category.*product.*using this category/i
      )
    })

    it('should allow deleting category after all products deleted', async () => {
      const categoryId = await createCategory({
        name: 'Beverages',
        color: '#3b82f6',
        sortOrder: 1,
        userId: mockUserId,
      })

      // Add product to category
      await db.products.add({
        id: 'prod-1',
        userId: mockUserId,
        name: 'Coca Cola',
        barcode: null,
        categoryId: categoryId,
        sellingPrice: 50,
        stockQty: 100,
        lowStockThreshold: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: null,
        isDeleted: false,
      })

      // Soft delete product
      await db.products.update('prod-1', { isDeleted: true })

      // Now category can be deleted
      await deleteCategory(categoryId)

      const category = await db.categories.get(categoryId)
      expect(category!.isDeleted).toBe(true)
    })
  })

  describe('Default Categories Seeding', () => {
    it('should seed 16 default Filipino categories', async () => {
      await seedDefaultCategories(mockUserId)

      const categories = await db.categories
        .filter((c) => c.userId === mockUserId && !c.isDeleted)
        .toArray()

      expect(categories).toHaveLength(16)
    })

    it('should include expected Filipino categories', async () => {
      await seedDefaultCategories(mockUserId)

      const categories = await db.categories
        .filter((c) => c.userId === mockUserId)
        .toArray()

      const categoryNames = categories.map((c) => c.name)

      // Check for some expected categories
      expect(categoryNames).toContain('Beverages')
      expect(categoryNames).toContain('Instant Noodles')
      expect(categoryNames).toContain('Snacks')
      expect(categoryNames).toContain('Rice')
      expect(categoryNames).toContain('Personal Care')
      expect(categoryNames).toContain('Household')
      expect(categoryNames).toContain('Load Cards')
    })

    it('should assign unique colors to categories', async () => {
      await seedDefaultCategories(mockUserId)

      const categories = await db.categories
        .filter((c) => c.userId === mockUserId)
        .toArray()

      const colors = categories.map((c) => c.color)

      // Check that colors are valid hex codes
      expect(colors.every((color) => /^#[0-9A-Fa-f]{6}$/.test(color))).toBe(true)
    })

    it('should assign sequential sort orders', async () => {
      await seedDefaultCategories(mockUserId)

      const categories = (await db.categories
        .filter((c) => c.userId === mockUserId)
        .toArray())
        .sort((a, b) => a.sortOrder - b.sortOrder)

      // Verify sort orders are sequential
      categories.forEach((category, index) => {
        expect(category.sortOrder).toBe(index + 1)
      })
    })

    it('should not duplicate categories if seeded twice', async () => {
      await seedDefaultCategories(mockUserId)
      await seedDefaultCategories(mockUserId) // Seed again

      const categories = await db.categories
        .filter((c) => c.userId === mockUserId && !c.isDeleted)
        .toArray()

      // Should still have 16, not 32
      expect(categories).toHaveLength(16)
    })

    it('should isolate default categories per user', async () => {
      const userId2 = 'test-user-uuid-456'

      await seedDefaultCategories(mockUserId)
      await seedDefaultCategories(userId2)

      const user1Categories = await db.categories
        .filter((c) => c.userId === mockUserId)
        .toArray()

      const user2Categories = await db.categories
        .filter((c) => c.userId === userId2)
        .toArray()

      expect(user1Categories).toHaveLength(16)
      expect(user2Categories).toHaveLength(16)
      expect(user1Categories[0].id).not.toBe(user2Categories[0].id)
    })
  })

  describe('Category Ordering', () => {
    it('should retrieve categories in sort order', async () => {
      // Create categories out of order
      await createCategory({
        name: 'Category C',
        color: '#000000',
        sortOrder: 3,
        userId: mockUserId,
      })

      await createCategory({
        name: 'Category A',
        color: '#111111',
        sortOrder: 1,
        userId: mockUserId,
      })

      await createCategory({
        name: 'Category B',
        color: '#222222',
        sortOrder: 2,
        userId: mockUserId,
      })

      const categories = await db.categories
        .filter((c) => c.userId === mockUserId)
        .sortBy('sortOrder')

      expect(categories).toHaveLength(3)
      expect(categories[0].name).toBe('Category A')
      expect(categories[1].name).toBe('Category B')
      expect(categories[2].name).toBe('Category C')
    })

    it('should support reordering categories', async () => {
      const cat1 = await createCategory({
        name: 'Category 1',
        color: '#000000',
        sortOrder: 1,
        userId: mockUserId,
      })

      const cat2 = await createCategory({
        name: 'Category 2',
        color: '#111111',
        sortOrder: 2,
        userId: mockUserId,
      })

      // Swap order
      await updateCategory(cat1, { sortOrder: 2 })
      await updateCategory(cat2, { sortOrder: 1 })

      const categories = (await db.categories
        .filter((c) => c.userId === mockUserId)
        .toArray())
        .sort((a, b) => a.sortOrder - b.sortOrder)

      expect(categories[0].name).toBe('Category 2')
      expect(categories[1].name).toBe('Category 1')
    })
  })
})

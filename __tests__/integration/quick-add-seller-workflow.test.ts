/**
 * Integration Test: Quick Add Seller Workflow
 *
 * Simulates a real seller's behavior when using the Quick Add feature:
 * 1. First-time user gets 30 default categories seeded
 * 2. Seller adds multiple products using Quick Add (minimal fields)
 * 3. Seller creates custom category on-the-fly
 * 4. Seller adds products to custom category
 * 5. Verifies data integrity and relationships
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { db, clearAllLocalData } from '@/lib/db'
import { seedDefaultCategories } from '@/lib/db/seeders'
import { createProduct, createCategory } from '@/lib/actions/products'

describe('Quick Add Seller Workflow', () => {
  const sellerId = 'seller-real-scenario'

  beforeEach(async () => {
    // Clear DB before each test
    await clearAllLocalData()
  })

  it('should complete full seller onboarding and quick add workflow', async () => {
    // STEP 1: First-time user - auto-seed 30 default categories
    await seedDefaultCategories(sellerId)

    const categories = await db.categories
      .filter((c) => c.userId === sellerId && !c.isDeleted)
      .toArray()

    expect(categories).toHaveLength(30)

    // Verify some expected categories
    const categoryNames = categories.map((c) => c.name)
    expect(categoryNames).toContain('Softdrinks & Juices')
    expect(categoryNames).toContain('Instant Noodles')
    expect(categoryNames).toContain('Meryenda (Snacks)')
    expect(categoryNames).toContain('Bath Soap & Shampoo')
    expect(categoryNames).toContain('Over-the-Counter Medicines')

    // STEP 2: Seller opens Quick Add and adds first product (Coca Cola)
    const softdrinksCategory = categories.find((c) => c.name === 'Softdrinks & Juices')
    expect(softdrinksCategory).toBeDefined()

    const cokeId = await createProduct({
      name: 'Coca Cola 1.5L',
      barcode: null, // Quick Add doesn't require barcode
      categoryId: softdrinksCategory!.id,
      sellingPrice: 50,
      stockQty: 24,
      lowStockThreshold: 10, // Default threshold
      userId: sellerId,
    })

    expect(cokeId).toBeDefined()

    // STEP 3: Seller clicks "Save & Add Another" - adds Sprite
    const spriteId = await createProduct({
      name: 'Sprite 1.5L',
      barcode: null,
      categoryId: softdrinksCategory!.id,
      sellingPrice: 50,
      stockQty: 12,
      lowStockThreshold: 10,
      userId: sellerId,
    })

    expect(spriteId).toBeDefined()
    expect(spriteId).not.toBe(cokeId)

    // STEP 4: Seller adds instant noodles
    const noodlesCategory = categories.find((c) => c.name === 'Instant Noodles')
    expect(noodlesCategory).toBeDefined()

    const pancitCantonId = await createProduct({
      name: 'Lucky Me Pancit Canton',
      barcode: null,
      categoryId: noodlesCategory!.id,
      sellingPrice: 12,
      stockQty: 100,
      lowStockThreshold: 10,
      userId: sellerId,
    })

    expect(pancitCantonId).toBeDefined()

    // STEP 5: Seller needs a custom category "Frozen Goods" (not in default 30)
    const frozenGoodsId = await createCategory({
      name: 'Frozen Goods',
      color: '#06b6d4',
      sortOrder: 31, // After default 30
      userId: sellerId,
    })

    expect(frozenGoodsId).toBeDefined()

    // Verify category count increased
    const categoriesAfterCustom = await db.categories
      .filter((c) => c.userId === sellerId && !c.isDeleted)
      .count()
    expect(categoriesAfterCustom).toBe(31) // 30 default + 1 custom

    // STEP 6: Seller adds product to custom category
    const iceCreamId = await createProduct({
      name: 'Ice Cream Sandwich',
      barcode: null,
      categoryId: frozenGoodsId,
      sellingPrice: 25,
      stockQty: 20,
      lowStockThreshold: 10,
      userId: sellerId,
    })

    expect(iceCreamId).toBeDefined()

    // STEP 7: Verify all products were created correctly
    const allProducts = await db.products
      .filter((p) => p.userId === sellerId && !p.isDeleted)
      .toArray()

    expect(allProducts).toHaveLength(4)

    // Verify product names (order may vary)
    const productNames = allProducts.map((p) => p.name)
    expect(productNames).toContain('Coca Cola 1.5L')
    expect(productNames).toContain('Sprite 1.5L')
    expect(productNames).toContain('Lucky Me Pancit Canton')
    expect(productNames).toContain('Ice Cream Sandwich')

    // STEP 8: Verify category relationships
    const softdrinksProducts = allProducts.filter(
      (p) => p.categoryId === softdrinksCategory!.id
    )
    const noodlesProducts = allProducts.filter((p) => p.categoryId === noodlesCategory!.id)
    const frozenProducts = allProducts.filter((p) => p.categoryId === frozenGoodsId)

    expect(softdrinksProducts).toHaveLength(2)
    expect(noodlesProducts).toHaveLength(1)
    expect(frozenProducts).toHaveLength(1)

    // STEP 9: Verify data integrity (all fields are correct)
    const coke = allProducts.find((p) => p.name === 'Coca Cola 1.5L')
    expect(coke).toMatchObject({
      userId: sellerId,
      name: 'Coca Cola 1.5L',
      barcode: null,
      categoryId: softdrinksCategory!.id,
      sellingPrice: 50,
      stockQty: 24,
      lowStockThreshold: 10,
      isDeleted: false,
    })
    expect(coke!.createdAt).toBeDefined()
    expect(coke!.updatedAt).toBeDefined()
    expect(coke!.syncedAt).toBeNull()
  })

  it('should handle rapid successive Quick Adds without race conditions', async () => {
    // Seed categories
    await seedDefaultCategories(sellerId)

    const categories = await db.categories
      .filter((c) => c.userId === sellerId && !c.isDeleted)
      .toArray()

    const snacksCategory = categories.find((c) => c.name === 'Meryenda (Snacks)')!

    // Simulate seller rapidly adding 10 products (Save & Add Another spam)
    const productPromises = Array.from({ length: 10 }, (_, i) =>
      createProduct({
        name: `Snack Item ${i + 1}`,
        barcode: null,
        categoryId: snacksCategory.id,
        sellingPrice: 5 + i,
        stockQty: 10 * (i + 1),
        lowStockThreshold: 10,
        userId: sellerId,
      })
    )

    const productIds = await Promise.all(productPromises)

    // All products should be created successfully
    expect(productIds).toHaveLength(10)
    expect(new Set(productIds).size).toBe(10) // All IDs are unique

    // Verify all products exist in DB
    const products = await db.products
      .filter((p) => p.userId === sellerId && !p.isDeleted)
      .toArray()

    expect(products).toHaveLength(10)
  })

  it('should handle seller workflow with validation errors', async () => {
    // Seed categories
    await seedDefaultCategories(sellerId)

    const categories = await db.categories
      .filter((c) => c.userId === sellerId && !c.isDeleted)
      .toArray()

    const softdrinksCategory = categories.find((c) => c.name === 'Softdrinks & Juices')!

    // SCENARIO 1: Seller tries to create duplicate category
    await expect(
      createCategory({
        name: 'Softdrinks & Juices', // Already exists
        color: '#000000',
        sortOrder: 31,
        userId: sellerId,
      })
    ).rejects.toThrow('A category with this name already exists')

    // SCENARIO 2: Seller creates product with barcode
    await createProduct({
      name: 'Coke 1L',
      barcode: 'COKE001',
      categoryId: softdrinksCategory.id,
      sellingPrice: 40,
      stockQty: 20,
      lowStockThreshold: 10,
      userId: sellerId,
    })

    // Seller tries to create another product with same barcode
    await expect(
      createProduct({
        name: 'Sprite 1L',
        barcode: 'COKE001', // Duplicate barcode
        categoryId: softdrinksCategory.id,
        costPrice: 40,
        sellingPrice: 40,
        stockQty: 15,
        lowStockThreshold: 10,
        userId: sellerId,
      })
    ).rejects.toThrow('A product with this barcode already exists')

    // Verify only 1 product was created
    const products = await db.products
      .filter((p) => p.userId === sellerId && !p.isDeleted)
      .count()
    expect(products).toBe(1)
  })

  it('should support seller adding products without initial stock (Quick Add feature)', async () => {
    // Seed categories
    await seedDefaultCategories(sellerId)

    const categories = await db.categories
      .filter((c) => c.userId === sellerId && !c.isDeleted)
      .toArray()

    const category = categories[0]

    // Quick Add allows stock = 0 (seller will update stock later via inventory)
    const productId = await createProduct({
      name: 'Out of Stock Item',
      barcode: null,
      categoryId: category.id,
      sellingPrice: 100,
      stockQty: 0, // Zero stock is valid
      lowStockThreshold: 10,
      userId: sellerId,
    })

    expect(productId).toBeDefined()

    const product = await db.products.get(productId)
    expect(product?.stockQty).toBe(0)
  })

  it('should maintain timestamps correctly during Quick Add workflow', async () => {
    // Seed categories
    await seedDefaultCategories(sellerId)

    const categories = await db.categories
      .filter((c) => c.userId === sellerId && !c.isDeleted)
      .toArray()

    const category = categories[0]

    // Add product
    const beforeCreate = new Date().toISOString()
    const productId = await createProduct({
      name: 'Test Product',
      barcode: null,
      categoryId: category.id,
      sellingPrice: 50,
      stockQty: 10,
      lowStockThreshold: 10,
      userId: sellerId,
    })
    const afterCreate = new Date().toISOString()

    const product = await db.products.get(productId)

    // Verify timestamps
    expect(product?.createdAt).toBeDefined()
    expect(product?.updatedAt).toBeDefined()
    expect(product?.syncedAt).toBeNull() // Not synced yet

    // Timestamps should be within test execution window
    expect(product!.createdAt >= beforeCreate).toBe(true)
    expect(product!.createdAt <= afterCreate).toBe(true)
    expect(product!.updatedAt >= beforeCreate).toBe(true)
    expect(product!.updatedAt <= afterCreate).toBe(true)

    // createdAt and updatedAt should be the same initially
    expect(product!.createdAt).toBe(product!.updatedAt)
  })

  it('should handle complete seller day 1 inventory setup', async () => {
    // Day 1: New seller sets up their sari-sari store inventory

    // 1. Auto-seed categories
    await seedDefaultCategories(sellerId)

    // 2. Add popular beverages
    const softdrinksCategory = (
      await db.categories
        .filter((c) => c.userId === sellerId && c.name === 'Softdrinks & Juices')
        .first()
    )!

    await Promise.all([
      createProduct({
        name: 'Coke Mismo',
        barcode: null,
        categoryId: softdrinksCategory.id,
        costPrice: 12,
        sellingPrice: 12,
        stockQty: 100,
        lowStockThreshold: 20,
        userId: sellerId,
      }),
      createProduct({
        name: 'Coke 1.5L',
        barcode: null,
        categoryId: softdrinksCategory.id,
        costPrice: 50,
        sellingPrice: 50,
        stockQty: 24,
        lowStockThreshold: 10,
        userId: sellerId,
      }),
      createProduct({
        name: 'Sprite 1.5L',
        barcode: null,
        categoryId: softdrinksCategory.id,
        costPrice: 50,
        sellingPrice: 50,
        stockQty: 12,
        lowStockThreshold: 5,
        userId: sellerId,
      }),
    ])

    // 3. Add instant noodles
    const noodlesCategory = (
      await db.categories
        .filter((c) => c.userId === sellerId && c.name === 'Instant Noodles')
        .first()
    )!

    await Promise.all([
      createProduct({
        name: 'Lucky Me Pancit Canton Original',
        barcode: null,
        categoryId: noodlesCategory.id,
        costPrice: 12,
        sellingPrice: 12,
        stockQty: 50,
        lowStockThreshold: 20,
        userId: sellerId,
      }),
      createProduct({
        name: 'Lucky Me Chicken',
        barcode: null,
        categoryId: noodlesCategory.id,
        sellingPrice: 10,
        stockQty: 30,
        lowStockThreshold: 15,
        userId: sellerId,
      }),
    ])

    // 4. Add snacks
    const snacksCategory = (
      await db.categories
        .filter((c) => c.userId === sellerId && c.name === 'Meryenda (Snacks)')
        .first()
    )!

    await Promise.all([
      createProduct({
        name: 'Chippy',
        barcode: null,
        categoryId: snacksCategory.id,
        sellingPrice: 7,
        stockQty: 40,
        lowStockThreshold: 15,
        userId: sellerId,
      }),
      createProduct({
        name: 'Piattos',
        barcode: null,
        categoryId: snacksCategory.id,
        sellingPrice: 17,
        stockQty: 20,
        lowStockThreshold: 10,
        userId: sellerId,
      }),
    ])

    // 5. Verify complete inventory
    const allProducts = await db.products
      .filter((p) => p.userId === sellerId && !p.isDeleted)
      .toArray()

    expect(allProducts).toHaveLength(7)

    // Verify by category
    const beverages = allProducts.filter((p) => p.categoryId === softdrinksCategory.id)
    const noodles = allProducts.filter((p) => p.categoryId === noodlesCategory.id)
    const snacks = allProducts.filter((p) => p.categoryId === snacksCategory.id)

    expect(beverages).toHaveLength(3)
    expect(noodles).toHaveLength(2)
    expect(snacks).toHaveLength(2)

    // Verify total stock value
    const totalStockValue = allProducts.reduce(
      (sum, p) => sum + p.sellingPrice * p.stockQty,
      0
    )
    expect(totalStockValue).toBeGreaterThan(0)
  })
})

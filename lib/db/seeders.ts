import { db } from '@/lib/db'
import type { Category, ProductCatalog } from './schema'
import { FILIPINO_PRODUCTS } from './seeds/filipino-products'

/**
 * Default categories for Filipino sari-sari stores (16 simplified categories)
 * Based on SM Supermarket, Puregold, and Robinsons Supermarket
 */
const DEFAULT_CATEGORIES = [
  // Food & Beverages
  { name: 'Beverages', color: '#3b82f6', sortOrder: 1 },
  { name: 'Instant Noodles', color: '#fbbf24', sortOrder: 2 },
  { name: 'Canned Goods', color: '#ef4444', sortOrder: 3 },
  { name: 'Coffee & Chocolate Drinks', color: '#78350f', sortOrder: 4 },
  { name: 'Condiments', color: '#a855f7', sortOrder: 5 },
  { name: 'Cooking Essentials', color: '#eab308', sortOrder: 6 },
  { name: 'Rice', color: '#22c55e', sortOrder: 7 },
  { name: 'Snacks', color: '#f97316', sortOrder: 8 },
  { name: 'Bread', color: '#d97706', sortOrder: 9 },
  { name: 'Dairy', color: '#fcd34d', sortOrder: 10 },

  // Personal Care & Household
  { name: 'Personal Care', color: '#ec4899', sortOrder: 11 },
  { name: 'Household', color: '#6b7280', sortOrder: 12 },
  { name: 'Frozen', color: '#06b6d4', sortOrder: 13 },

  // Others
  { name: 'Cigarettes', color: '#9ca3af', sortOrder: 14 },
  { name: 'Load Cards', color: '#8b5cf6', sortOrder: 15 },
  { name: 'School Supplies', color: '#3b82f6', sortOrder: 16 },
]

/**
 * Seeds default categories for new users
 * Only runs if user has no categories yet
 */
export async function seedDefaultCategories(userId: string): Promise<void> {
  try {
    // Check if user already has categories
    const existingCategories = await db.categories
      .filter((c) => c.userId === userId && !c.isDeleted)
      .count()

    if (existingCategories > 0) {
      return // User already has categories
    }

    const now = new Date().toISOString()

    // Create default categories
    const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
      id: crypto.randomUUID(),
      userId,
      name: cat.name,
      color: cat.color,
      sortOrder: cat.sortOrder,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
      isDeleted: false,
    }))

    await db.categories.bulkAdd(categories)
  } catch (error) {
    console.error('Failed to seed default categories:', error)
    throw error
  }
}

/**
 * Check if user needs onboarding (no categories and no products)
 */
export async function needsOnboarding(userId: string): Promise<boolean> {
  const [categoryCount, productCount] = await Promise.all([
    db.categories.filter((c) => c.userId === userId && !c.isDeleted).count(),
    db.products.filter((p) => p.userId === userId && !p.isDeleted).count(),
  ])

  return categoryCount === 0 && productCount === 0
}

/**
 * Seeds the centralized product catalog with common Filipino products
 * Only runs if catalog is empty (first app launch)
 * This catalog is shared across all users as a reference
 */
export async function seedProductCatalog(): Promise<void> {
  try {
    // Check if catalog already has products
    const existingCount = await db.productCatalog.count()

    if (existingCount > 0) {
      return // Catalog already seeded
    }

    console.log('[seedProductCatalog] Seeding product catalog with Filipino products...')

    const now = new Date().toISOString()

    // Create catalog entries
    const catalogItems: ProductCatalog[] = FILIPINO_PRODUCTS.map((product) => ({
      id: crypto.randomUUID(),
      barcode: product.barcode,
      name: product.name,
      categoryName: product.categoryName,
      createdAt: now,
      updatedAt: now,
    }))

    await db.productCatalog.bulkAdd(catalogItems)

    console.log(`[seedProductCatalog] Successfully seeded ${catalogItems.length} products`)
  } catch (error) {
    console.error('[seedProductCatalog] Failed to seed product catalog:', error)
    throw error
  }
}

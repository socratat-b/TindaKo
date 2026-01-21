import { db } from '@/lib/db'
import type { Category } from './schema'

/**
 * Default categories for Filipino sari-sari stores
 */
const DEFAULT_CATEGORIES = [
  { name: 'Inumin (Beverages)', color: '#3b82f6', sortOrder: 1 },
  { name: 'Meryenda (Snacks)', color: '#f97316', sortOrder: 2 },
  { name: 'Canned Goods', color: '#ef4444', sortOrder: 3 },
  { name: 'Pancit & Noodles', color: '#eab308', sortOrder: 4 },
  { name: 'Personal Care', color: '#ec4899', sortOrder: 5 },
  { name: 'Household Items', color: '#6b7280', sortOrder: 6 },
  { name: 'Pampalasa (Condiments)', color: '#a855f7', sortOrder: 7 },
  { name: 'Bigas & Grains', color: '#22c55e', sortOrder: 8 },
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

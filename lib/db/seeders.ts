import { db } from '@/lib/db'
import type { Category } from './schema'

/**
 * Default categories for Filipino sari-sari stores (30 comprehensive categories)
 * Based on DTI Philippines classifications and retail market analysis
 */
const DEFAULT_CATEGORIES = [
  // A. Beverages & Drinks
  { name: 'Softdrinks & Juices', color: '#3b82f6', sortOrder: 1 },
  { name: 'Bottled Water', color: '#06b6d4', sortOrder: 2 },
  { name: 'Coffee & Tea', color: '#78350f', sortOrder: 3 },
  { name: 'Energy Drinks', color: '#eab308', sortOrder: 4 },
  { name: 'Alcoholic Beverages', color: '#dc2626', sortOrder: 5 },

  // B. Food & Snacks
  { name: 'Meryenda (Snacks)', color: '#f97316', sortOrder: 6 },
  { name: 'Instant Noodles', color: '#fbbf24', sortOrder: 7 },
  { name: 'Bread & Pastries', color: '#d97706', sortOrder: 8 },
  { name: 'Canned Goods', color: '#ef4444', sortOrder: 9 },
  { name: 'Rice & Grains', color: '#22c55e', sortOrder: 10 },

  // C. Cooking Essentials
  { name: 'Pampalasa (Condiments)', color: '#a855f7', sortOrder: 11 },
  { name: 'Cooking Oil', color: '#eab308', sortOrder: 12 },
  { name: 'Salt & Sugar', color: '#9ca3af', sortOrder: 13 },
  { name: 'Sauces & Seasonings', color: '#dc2626', sortOrder: 14 },

  // D. Personal Care
  { name: 'Bath Soap & Shampoo', color: '#ec4899', sortOrder: 15 },
  { name: 'Toothpaste & Oral Care', color: '#06b6d4', sortOrder: 16 },
  { name: 'Skin Care & Cosmetics', color: '#f472b6', sortOrder: 17 },
  { name: 'Feminine Care', color: '#db2777', sortOrder: 18 },
  { name: 'Baby Products', color: '#fcd34d', sortOrder: 19 },

  // E. Household Items
  { name: 'Detergent & Cleaning', color: '#6b7280', sortOrder: 20 },
  { name: 'Paper Products', color: '#d1d5db', sortOrder: 21 },
  { name: 'Candles & Matches', color: '#fb923c', sortOrder: 22 },
  { name: 'Plastic & Kitchenware', color: '#94a3b8', sortOrder: 23 },

  // F. Health & Wellness
  { name: 'Over-the-Counter Medicines', color: '#10b981', sortOrder: 24 },
  { name: 'First Aid', color: '#dc2626', sortOrder: 25 },

  // G. Utilities & Others
  { name: 'Batteries & Bulbs', color: '#fbbf24', sortOrder: 26 },
  { name: 'Cellphone Load & E-pins', color: '#8b5cf6', sortOrder: 27 },
  { name: 'School Supplies', color: '#3b82f6', sortOrder: 28 },
  { name: 'Tobacco Products', color: '#6b7280', sortOrder: 29 },
  { name: 'Miscellaneous', color: '#9ca3af', sortOrder: 30 },
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

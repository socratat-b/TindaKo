import type { Category } from '@/lib/db/schema'

/**
 * Get category name by ID
 * @param categoryId - Category ID to look up
 * @param categories - Array of categories
 * @returns Category name or 'Uncategorized' if not found
 */
export function getCategoryName(categoryId: string, categories: Category[]): string {
  return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
}

/**
 * Get category color by ID
 * @param categoryId - Category ID to look up
 * @param categories - Array of categories
 * @returns Category color or default gray if not found
 */
export function getCategoryColor(categoryId: string, categories: Category[]): string {
  return categories.find((c) => c.id === categoryId)?.color || '#6b7280'
}

/**
 * Get category by ID
 * @param categoryId - Category ID to look up
 * @param categories - Array of categories
 * @returns Category object or undefined if not found
 */
export function getCategoryById(categoryId: string, categories: Category[]): Category | undefined {
  return categories.find((c) => c.id === categoryId)
}

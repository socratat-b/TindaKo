import type { Category } from '@/lib/db/schema'

// ============================================================================
// Shared Component Props
// ============================================================================

export interface CategoryFilterProps {
  categories: Category[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  showColorDots?: boolean
}

export interface CategoryBadgeProps {
  categoryId: string
  categories: Category[]
  variant?: 'default' | 'outline'
  className?: string
}

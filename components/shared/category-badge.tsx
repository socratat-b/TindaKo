'use client'

import { Badge } from '@/components/ui/badge'
import { getCategoryName, getCategoryColor } from '@/lib/utils/category-utils'
import type { CategoryBadgeProps } from '@/lib/types/shared'

export function CategoryBadge({
  categoryId,
  categories,
  variant = 'outline',
  className = 'text-xs',
}: CategoryBadgeProps) {
  const categoryName = getCategoryName(categoryId, categories)
  const categoryColor = getCategoryColor(categoryId, categories)

  return (
    <Badge
      variant={variant}
      className={className}
      style={{
        backgroundColor: `${categoryColor}20`,
        borderColor: categoryColor,
        color: categoryColor,
      }}
    >
      {categoryName}
    </Badge>
  )
}

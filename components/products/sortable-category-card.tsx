'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { Category } from '@/lib/db/schema'

interface SortableCategoryCardProps {
  category: Category
  productCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function SortableCategoryCard({
  category,
  productCount,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: SortableCategoryCardProps) {
  return (
    <Card className="p-3 mb-2">
      <div className="flex gap-2">
        {/* Up/Down Arrows */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex items-center justify-center h-4 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="flex items-center justify-center h-4 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Category Name and Product Count */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{category.name}</h3>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </Badge>
          </div>

          {/* Color Display */}
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded border shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              {category.color}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="flex-1 h-8 text-xs"
              type="button"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category)}
              disabled={productCount > 0}
              className="flex-1 h-8 text-xs"
              type="button"
            >
              Delete
            </Button>
          </div>
          {productCount > 0 && (
            <p className="text-[9px] text-muted-foreground text-center">
              Cannot delete: {productCount} {productCount === 1 ? 'product' : 'products'} using this category
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

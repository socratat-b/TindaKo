'use client'

import { useSortable } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GripVertical } from 'lucide-react'
import type { Category } from '@/lib/db/schema'

interface SortableCategoryCardProps {
  category: Category
  productCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function SortableCategoryCard({
  category,
  productCount,
  onEdit,
  onDelete,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: category.id })

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        x: transform?.x ?? 0,
        y: transform?.y ?? 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging
          ? '0 10px 30px -5px rgba(0, 0, 0, 0.15)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
    >
      <Card className="p-3">
      <div className="flex gap-2">
        {/* Drag Handle */}
        <div
          className="flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          {...attributes}
          {...listeners}
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Category Name and Product Count */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{category.name}</h3>
              {isDragging && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Dragging...
                </p>
              )}
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
    </motion.div>
  )
}

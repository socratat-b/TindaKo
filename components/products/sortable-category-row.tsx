'use client'

import { useSortable } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { GripVertical } from 'lucide-react'
import type { Category } from '@/lib/db/schema'

interface SortableCategoryRowProps {
  category: Category
  productCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

// Create a motion component for the table row
const MotionTableRow = motion.create(TableRow)

export function SortableCategoryRow({
  category,
  productCount,
  onEdit,
  onDelete,
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: category.id })

  return (
    <MotionTableRow
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        x: transform?.x ?? 0,
        y: transform?.y ?? 0,
        scale: isDragging ? 1.01 : 1,
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        layout: { type: 'spring', stiffness: 350, damping: 35 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.15 },
      }}
      style={{
        boxShadow: isDragging
          ? '0 5px 15px -3px rgba(0, 0, 0, 0.1)'
          : 'none',
      }}
    >
      <TableCell className="w-12">
        <div
          className="flex items-center justify-center cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {category.color}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant="secondary">{productCount}</Badge>
      </TableCell>
      <TableCell className="text-right">{category.sortOrder}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
            type="button"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(category)}
            disabled={productCount > 0}
            type="button"
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </MotionTableRow>
  )
}

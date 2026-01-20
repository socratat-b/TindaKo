'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CategoryFormDialog } from './category-form-dialog'
import { SortableCategoryCard } from './sortable-category-card'
import { SortableCategoryRow } from './sortable-category-row'
import { deleteCategory, updateCategoriesOrder } from '@/lib/actions/products'
import type { Category } from '@/lib/db/schema'

interface CategoriesListProps {
  categories: Category[]
  productCounts: Record<string, number>
  userId: string
  onRefresh: () => void
}

export function CategoriesList({
  categories,
  productCounts,
  userId,
  onRefresh,
}: CategoriesListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [localCategories, setLocalCategories] = useState<Category[]>([])

  // Sort categories - use local state for drag reordering, fallback to props
  const sortedCategories = useMemo(() => {
    // If local state exists but length doesn't match categories, it means add/delete happened
    // In that case, ignore local state and use fresh data from props
    if (localCategories.length > 0 && localCategories.length === categories.length) {
      return localCategories
    }
    // Otherwise, use categories from props and sort by sortOrder
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [categories, localCategories])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (helps with scrolling on mobile)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms press delay for touch devices
        tolerance: 5, // Allow 5px of movement during the delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex((cat) => cat.id === active.id)
      const newIndex = sortedCategories.findIndex((cat) => cat.id === over.id)

      // Move array positions AND update sortOrder property on each item
      const reorderedCategories = arrayMove(sortedCategories, oldIndex, newIndex).map(
        (cat, index) => ({
          ...cat,
          sortOrder: index, // Update the sortOrder property to match new position
        })
      )

      // Optimistically update the UI immediately (no await!)
      setLocalCategories(reorderedCategories)

      // Update sort orders in database (fire and forget)
      const updates = reorderedCategories.map((cat) => ({
        id: cat.id,
        sortOrder: cat.sortOrder,
      }))

      // Fire database update in the background - no blocking
      updateCategoriesOrder(updates).catch((error) => {
        // Only revert on error
        setLocalCategories([])
        alert(error instanceof Error ? error.message : 'Failed to update order')
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDelete = async (category: Category) => {
    const productCount = productCounts[category.id] || 0

    if (productCount > 0) {
      alert(
        `Cannot delete "${category.name}". ${productCount} product(s) are using this category.`
      )
      return
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      await deleteCategory(category.id)
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  const nextSortOrder =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.sortOrder)) + 1
      : 0

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 lg:space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Button
            onClick={() => {
              setEditingCategory(null)
              setIsFormOpen(true)
            }}
            className="h-9 w-full text-xs lg:h-10 lg:text-sm"
          >
            Add Category
          </Button>
        </motion.div>

        {/* Empty State */}
        {sortedCategories.length === 0 && (
          <Card className="p-6 lg:p-12">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-medium lg:text-lg">Setting up categories...</p>
              <p className="text-xs text-muted-foreground lg:text-sm">
                We&apos;re adding default categories for your sari-sari store
              </p>
            </div>
          </Card>
        )}

        {/* Mobile Card View */}
        <SortableContext
          items={sortedCategories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.div
            className="space-y-2 lg:hidden"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence mode="popLayout">
              {sortedCategories.map((category) => {
                const productCount = productCounts[category.id] || 0
                return (
                  <SortableCategoryCard
                    key={category.id}
                    category={category}
                    productCount={productCount}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )
              })}
            </AnimatePresence>
          </motion.div>
        </SortableContext>

        {/* Desktop Table View */}
        <SortableContext
          items={sortedCategories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="hidden rounded-md border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Sort Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-medium">Setting up categories...</p>
                        <p className="text-sm text-muted-foreground">
                          We&apos;re adding default categories for your sari-sari store
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {sortedCategories.map((category) => {
                      const productCount = productCounts[category.id] || 0
                      return (
                        <SortableCategoryRow
                          key={category.id}
                          category={category}
                          productCount={productCount}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      )
                    })}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </SortableContext>

        <CategoryFormDialog
          open={isFormOpen}
          onOpenChange={handleFormClose}
          category={editingCategory}
          userId={userId}
          onSuccess={onRefresh}
          nextSortOrder={nextSortOrder}
        />
      </div>
    </DndContext>
  )
}

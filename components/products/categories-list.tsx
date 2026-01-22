'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
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
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Sort categories by sortOrder
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [categories])

  // Drag and drop sensors - simple configuration
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  )

  // Desktop drag and drop handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedCategories.findIndex((cat) => cat.id === active.id)
    const newIndex = sortedCategories.findIndex((cat) => cat.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder the array
    const reorderedCategories = arrayMove(sortedCategories, oldIndex, newIndex)

    // Update sortOrder for ALL categories based on new positions (start at 1)
    const updates = reorderedCategories.map((cat, index) => ({
      id: cat.id,
      sortOrder: index + 1,
    }))

    try {
      await updateCategoriesOrder(updates)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update order')
      console.error('Drag and drop error:', error)
    }
  }

  // Mobile up/down handlers
  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newCategories = [...sortedCategories]
    // Swap with previous item
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp

    // Update sortOrder for ALL categories
    const updates = newCategories.map((cat, idx) => ({
      id: cat.id,
      sortOrder: idx + 1,
    }))

    try {
      await updateCategoriesOrder(updates)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to move category')
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === sortedCategories.length - 1) return

    const newCategories = [...sortedCategories]
    // Swap with next item
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp

    // Update sortOrder for ALL categories
    const updates = newCategories.map((cat, idx) => ({
      id: cat.id,
      sortOrder: idx + 1,
    }))

    try {
      await updateCategoriesOrder(updates)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to move category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDelete = (category: Category) => {
    const productCount = productCounts[category.id] || 0

    if (productCount > 0) {
      alert(
        `Cannot delete "${category.name}". ${productCount} product(s) are using this category.`
      )
      return
    }

    setDeletingCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return

    try {
      await deleteCategory(deletingCategory.id)
      setIsDeleteDialogOpen(false)
      setDeletingCategory(null)
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
      : 1 // Start sortOrder at 1

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

        {/* Mobile Card View - Up/Down Buttons */}
        <div className="lg:hidden">
          {sortedCategories.map((category, index) => {
            const productCount = productCounts[category.id] || 0
            return (
              <SortableCategoryCard
                key={category.id}
                category={category}
                productCount={productCount}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === sortedCategories.length - 1}
              />
            )
          })}
        </div>

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
                  sortedCategories.map((category) => {
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
                  })
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deletingCategory?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndContext>
  )
}

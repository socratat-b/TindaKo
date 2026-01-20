'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryFormDialog } from './category-form-dialog'
import { deleteCategory } from '@/lib/actions/products'
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

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </p>
        <Button
          onClick={() => {
            setEditingCategory(null)
            setIsFormOpen(true)
          }}
        >
          Add Category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={5} className="py-12 text-center">
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
                  <TableRow key={category.id}>
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
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={productCount > 0}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        category={editingCategory}
        userId={userId}
        onSuccess={onRefresh}
        nextSortOrder={nextSortOrder}
      />
    </div>
  )
}

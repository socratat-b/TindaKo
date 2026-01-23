'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProduct, createCategory } from '@/lib/actions/products'
import type { Category } from '@/lib/db/schema'
import { Zap, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface QuickAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  userId: string
  onSuccess: () => void
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#6b7280', // gray
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#d97706', // amber
  '#8b5cf6', // violet
  '#10b981', // emerald
]

export function QuickAddProductDialog({
  open,
  onOpenChange,
  categories,
  userId,
  onSuccess,
}: QuickAddProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  // Sort categories: custom categories (sortOrder=0) first, then by sortOrder
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sellingPrice: '',
    stockQty: '',
  })

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: PRESET_COLORS[0],
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Use the first category from the sorted list
      const firstCategoryId = sortedCategories[0]?.id || ''
      setFormData({
        name: '',
        categoryId: firstCategoryId,
        sellingPrice: '',
        stockQty: '0',
      })
      setCategoryFormData({
        name: '',
        color: PRESET_COLORS[0],
      })
      setShowCategoryForm(false)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, categories])

  const handleCategoryChange = (value: string) => {
    if (value === 'create-new') {
      setShowCategoryForm(true)
    } else {
      setFormData({ ...formData, categoryId: value })
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryFormData.name.trim()) {
      setError('Category name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // sortOrder = 0 to place custom categories at the top
      const sortOrder = 0
      const newCategoryId = await createCategory({
        name: categoryFormData.name,
        color: categoryFormData.color,
        sortOrder,
        userId,
      })

      // Auto-select the new category
      setFormData({ ...formData, categoryId: newCategoryId })
      setShowCategoryForm(false)
      setCategoryFormData({ name: '', color: PRESET_COLORS[0] })

      // Show success toast
      toast.success('Category created successfully', {
        description: `"${categoryFormData.name}" is now available`,
        duration: 3000,
      })

      // Refresh categories list
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false)
    setCategoryFormData({ name: '', color: PRESET_COLORS[0] })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Product name is required')
      }
      if (!formData.categoryId) {
        throw new Error('Category is required')
      }

      const sellingPrice = parseFloat(formData.sellingPrice)
      const stockQty = parseInt(formData.stockQty, 10)

      if (isNaN(sellingPrice) || sellingPrice < 0) {
        throw new Error('Invalid selling price')
      }
      if (isNaN(stockQty) || stockQty < 0) {
        throw new Error('Invalid stock quantity')
      }

      // Create product with minimal fields
      await createProduct({
        name: formData.name,
        barcode: null,
        categoryId: formData.categoryId,
        sellingPrice,
        stockQty,
        lowStockThreshold: 10, // Default threshold
        userId,
      })

      // Success feedback
      toast.success(`"${formData.name}" added successfully`, {
        description: saveAndAddAnother ? 'Ready to add another product' : 'Product has been saved',
        duration: 3000,
      })

      onSuccess()

      if (saveAndAddAnother) {
        // Reset form but keep category selection and dialog open
        setFormData({
          name: '',
          categoryId: formData.categoryId,
          sellingPrice: '',
          stockQty: '0',
        })
      } else {
        // Close dialog
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base lg:text-lg">
            <Zap className="h-4 w-4 text-yellow-500 lg:h-5 lg:w-5" />
            Quick Add Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3 lg:space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/10 p-2 text-xs text-destructive lg:p-3 lg:text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs lg:text-sm">
              Product Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Coca Cola 1.5L"
              disabled={isLoading}
              className="h-9 text-xs lg:h-10 lg:text-sm"
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs lg:text-sm">
              Category *
            </Label>

            <AnimatePresence mode="wait">
              {showCategoryForm ? (
                <motion.div
                  key="category-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 rounded-md border p-3"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="new-category-name" className="text-xs">
                      Category Name *
                    </Label>
                    <Input
                      id="new-category-name"
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, name: e.target.value })
                      }
                      placeholder="e.g. Frozen Goods"
                      disabled={isLoading}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setCategoryFormData({ ...categoryFormData, color })
                          }
                          disabled={isLoading}
                          className={`h-7 w-7 rounded-full border-2 transition-all ${
                            categoryFormData.color === color
                              ? 'scale-110 border-foreground'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelCategoryForm}
                      disabled={isLoading}
                      className="h-8 flex-1 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={isLoading || !categoryFormData.name.trim()}
                      className="h-8 flex-1 text-xs"
                    >
                      Create Category
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="category-select"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Select
                    value={formData.categoryId}
                    onValueChange={handleCategoryChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-9 w-full text-xs lg:h-10 lg:text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {sortedCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs lg:text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="create-new" className="text-xs lg:text-sm">
                        <div className="flex items-center gap-2 font-medium text-primary">
                          <Plus className="h-3 w-3" />
                          Create Custom Category
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs lg:text-sm">
              Selling Price *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              placeholder="0.00"
              disabled={isLoading}
              className="h-9 text-xs lg:h-10 lg:text-sm"
            />
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <Label htmlFor="stock" className="text-xs lg:text-sm">
              Initial Stock
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stockQty}
              onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
              placeholder="0"
              disabled={isLoading}
              className="h-9 text-xs lg:h-10 lg:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 lg:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 text-xs lg:h-10 lg:flex-1 lg:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading || showCategoryForm}
              className="h-9 text-xs lg:h-10 lg:flex-1 lg:text-sm"
            >
              {isLoading ? 'Adding...' : 'Save & Add Another'}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || showCategoryForm}
              className="h-9 text-xs lg:h-10 lg:flex-1 lg:text-sm"
            >
              {isLoading ? 'Adding...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

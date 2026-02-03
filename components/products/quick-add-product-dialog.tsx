'use client'

import { useEffect, useState } from 'react'
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
import { CameraBarcodeScanner } from '@/components/ui/camera-barcode-scanner'
import { useQuickAddProduct } from '@/lib/hooks/use-quick-add-product'
import { useFormattedNumberInput } from '@/lib/hooks/use-formatted-input'
import { PRESET_COLORS } from '@/lib/constants/colors'
import type { QuickAddProductDialogProps } from '@/lib/types'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { Zap, Plus } from 'lucide-react'

export function QuickAddProductDialog({
  open,
  onOpenChange,
  categories,
  userId,
  onSuccess,
}: QuickAddProductDialogProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const {
    formData,
    categoryFormData,
    showCategoryForm,
    isLoading,
    error,
    sortedCategories,
    setFormData,
    setCategoryFormData,
    handleCategoryChange,
    handleCreateCategory,
    handleCancelCategoryForm,
    handleSubmit,
  } = useQuickAddProduct({
    userId,
    onSuccess,
    onOpenChange,
    categories,
    open,
  })

  // Open camera scanner when dialog opens
  useEffect(() => {
    if (open) {
      setIsCameraOpen(true)
      setShowForm(false)
    }
  }, [open])

  // Handle barcode scan
  const handleBarcodeScanned = async (barcode: string) => {
    setIsCameraOpen(false)

    try {
      // Look up product in catalog (direct lookup - barcodes are verified)
      const catalogItem = await db.productCatalog
        .where('barcode')
        .equals(barcode)
        .first()

      if (catalogItem) {
        // Find or use first category that matches
        const matchingCategory = categories.find(
          (c) => c.name === catalogItem.categoryName
        )
        const categoryId = matchingCategory?.id || categories[0]?.id || ''

        // Pre-fill form with catalog data (use original barcode, not variant)
        setFormData({
          name: catalogItem.name,
          barcode: barcode, // Use scanned barcode
          categoryId,
          sellingPrice: '',
          stockQty: '',
        })

        toast.success('Product found in catalog!', {
          description: catalogItem.name,
        })
      } else {
        // Not in catalog, just set barcode
        setFormData({
          barcode,
          name: '',
          categoryId: categories[0]?.id || '',
          sellingPrice: '',
          stockQty: '',
        })

        toast.info('Product not in catalog', {
          description: `Barcode: ${barcode}\nFill in the details manually`,
        })
      }

      // Show form
      setShowForm(true)
    } catch (error) {
      console.error('Error looking up catalog:', error)
      toast.error('Failed to look up product')
      setShowForm(true)
    }
  }

  // Use formatted input for selling price
  const formattedSellingPrice = useFormattedNumberInput(formData.sellingPrice)

  // Sync formatted input with form store
  useEffect(() => {
    setFormData({ sellingPrice: formattedSellingPrice.rawValue })
  }, [formattedSellingPrice.rawValue, setFormData])

  // Update formatted input when sellingPrice changes externally (e.g., form reset)
  useEffect(() => {
    if (formData.sellingPrice !== formattedSellingPrice.rawValue) {
      formattedSellingPrice.setValue(formData.sellingPrice)
    }
  }, [formData.sellingPrice])

  return (
    <>
      {/* Camera Barcode Scanner */}
      <CameraBarcodeScanner
        isOpen={isCameraOpen}
        onScan={handleBarcodeScanned}
        onClose={() => {
          setIsCameraOpen(false)
          onOpenChange(false)
        }}
      />

      {/* Form Dialog */}
      <Dialog open={open && showForm} onOpenChange={onOpenChange}>
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
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="e.g. Coca Cola 1.5L"
              disabled={isLoading}
              className="h-9 text-xs lg:h-10 lg:text-sm"
              autoFocus
            />
          </div>

          {/* Barcode */}
          <div className="space-y-1.5">
            <Label htmlFor="barcode" className="text-xs lg:text-sm">
              Barcode <span className="text-muted-foreground">(Optional - adjust if needed)</span>
            </Label>
            <Input
              id="barcode"
              value={formData.barcode || ''}
              onChange={(e) => setFormData({ barcode: e.target.value })}
              placeholder="Scanned barcode..."
              disabled={isLoading}
              className="h-9 text-xs font-mono lg:h-10 lg:text-sm"
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
                        setCategoryFormData({ name: e.target.value })
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
                            setCategoryFormData({ color })
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
              type="text"
              inputMode="decimal"
              value={formattedSellingPrice.displayValue}
              onChange={formattedSellingPrice.handleChange}
              onBlur={formattedSellingPrice.handleBlur}
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
              onChange={(e) => setFormData({ stockQty: e.target.value })}
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
    </>
  )
}

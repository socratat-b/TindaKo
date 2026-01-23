'use client'

import { useState, useEffect } from 'react'
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
import { createProduct, updateProduct } from '@/lib/actions/products'
import type { Product, Category } from '@/lib/db/schema'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  userId: string
  onSuccess: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  userId,
  onSuccess,
}: ProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    categoryId: '',
    sellingPrice: '',
    stockQty: '',
    lowStockThreshold: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        categoryId: product.categoryId,
        sellingPrice: product.sellingPrice.toString(),
        stockQty: product.stockQty.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
      })
    } else {
      setFormData({
        name: '',
        barcode: '',
        categoryId: categories[0]?.id || '',
        sellingPrice: '',
        stockQty: '0',
        lowStockThreshold: '10',
      })
    }
    setError(null)
  }, [product, categories, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const sellingPrice = parseFloat(formData.sellingPrice)
      const stockQty = parseInt(formData.stockQty, 10)
      const lowStockThreshold = parseInt(formData.lowStockThreshold, 10)

      if (isNaN(sellingPrice) || sellingPrice < 0) {
        throw new Error('Invalid selling price')
      }
      if (isNaN(stockQty) || stockQty < 0) {
        throw new Error('Invalid stock quantity')
      }
      if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
        throw new Error('Invalid low stock threshold')
      }

      if (product) {
        await updateProduct(product.id, {
          name: formData.name,
          barcode: formData.barcode || null,
          categoryId: formData.categoryId,
          sellingPrice,
          stockQty,
          lowStockThreshold,
          userId,
        })
      } else {
        await createProduct({
          name: formData.name,
          barcode: formData.barcode || null,
          categoryId: formData.categoryId,
          sellingPrice,
          stockQty,
          lowStockThreshold,
          userId,
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base lg:text-lg">
            {product ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        {categories.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="rounded bg-yellow-500/10 p-3 lg:p-4">
              <p className="text-xs font-medium text-yellow-700 lg:text-sm">No categories available</p>
              <p className="mt-2 text-xs text-yellow-600 lg:text-sm">
                Please create at least one category first. Go to the Categories tab to
                add categories like Inumin, Meryenda, or Canned Goods.
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="h-9 w-full text-xs lg:h-10 lg:text-sm"
            >
              Got it
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            {error && (
              <div className="rounded bg-red-500/10 p-3 text-xs text-red-500 lg:text-sm">{error}</div>
            )}

          <div>
            <Label htmlFor="name" className="text-xs lg:text-sm">
              Product Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              className="h-9 text-xs lg:h-10 lg:text-sm"
            />
          </div>

          <div>
            <Label htmlFor="barcode" className="text-xs lg:text-sm">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="Optional"
              className="h-9 text-xs lg:h-10 lg:text-sm"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-xs lg:text-sm">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger className="h-9 text-xs lg:h-10 lg:text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sellingPrice" className="text-xs lg:text-sm">Selling Price *</Label>
            <Input
              id="sellingPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({ ...formData, sellingPrice: e.target.value })
              }
              required
              className="h-9 text-xs lg:h-10 lg:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div>
              <Label htmlFor="stockQty" className="text-xs lg:text-sm">Stock Quantity *</Label>
              <Input
                id="stockQty"
                type="number"
                min="0"
                value={formData.stockQty}
                onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                required
                className="h-9 text-xs lg:h-10 lg:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="lowStockThreshold" className="text-xs lg:text-sm">Low Stock Alert *</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: e.target.value })
                }
                required
                className="h-9 text-xs lg:h-10 lg:text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 flex-1 text-xs lg:h-10 lg:flex-none lg:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 flex-1 text-xs lg:h-10 lg:flex-none lg:text-sm"
            >
              {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

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
    costPrice: '',
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
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        stockQty: product.stockQty.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
      })
    } else {
      setFormData({
        name: '',
        barcode: '',
        categoryId: categories[0]?.id || '',
        costPrice: '',
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
      const costPrice = parseFloat(formData.costPrice)
      const sellingPrice = parseFloat(formData.sellingPrice)
      const stockQty = parseInt(formData.stockQty, 10)
      const lowStockThreshold = parseInt(formData.lowStockThreshold, 10)

      if (isNaN(costPrice) || costPrice < 0) {
        throw new Error('Invalid cost price')
      }
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
          costPrice,
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
          costPrice,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costPrice">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="sellingPrice">Selling Price *</Label>
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockQty">Stock Quantity *</Label>
              <Input
                id="stockQty"
                type="number"
                min="0"
                value={formData.stockQty}
                onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Alert *</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

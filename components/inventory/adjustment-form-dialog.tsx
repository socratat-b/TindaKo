'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpCircle, ArrowDownCircle, Settings, Search, X } from 'lucide-react'
import { CategoryFilter } from '@/components/shared/category-filter'
import { useAdjustmentForm } from '@/lib/hooks/use-adjustment-form'
import type { AdjustmentFormDialogProps } from '@/lib/types'

export function AdjustmentFormDialog({
  open,
  onOpenChange,
  storePhone,
  products,
  categories,
  initialProductId,
  mode = 'manual',
}: AdjustmentFormDialogProps) {
  const { formData, isLoading, error, setFormData, handleSubmit } = useAdjustmentForm({
    storePhone,
    onOpenChange,
    open,
    initialProductId,
    mode,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  const isRestockMode = mode === 'restock'

  const selectedProduct = products.find((p) => p.id === formData.productId)

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
  }

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filter by category
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === selectedCategoryId)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode?.toLowerCase().includes(query) ||
          getCategoryName(p.categoryId).toLowerCase().includes(query)
      )
    }

    return filtered
  }, [products, selectedCategoryId, searchQuery])

  // Reset filters when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedCategoryId('all')
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {isRestockMode && selectedProduct
              ? `Restock - ${selectedProduct.name}`
              : 'Adjust Stock'}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {isRestockMode
              ? 'Add items to increase stock level'
              : 'Add, remove, or adjust product stock levels'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection - Conditional based on mode */}
          <div className="space-y-2">
            {isRestockMode ? (
              <>
                {/* Read-only product display for restock mode */}
                {selectedProduct && (
                  <motion.div
                    className="rounded-lg bg-muted p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-bold md:text-xl">{selectedProduct.name}</h3>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {getCategoryName(selectedProduct.categoryId)}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span
                          className={`text-xl font-bold md:text-2xl ${
                            selectedProduct.stockQty === 0
                              ? 'text-red-600 dark:text-red-400'
                              : selectedProduct.stockQty <= selectedProduct.lowStockThreshold
                                ? 'text-orange-600 dark:text-orange-400'
                                : ''
                          }`}
                        >
                          {selectedProduct.stockQty}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground">Need at least:</span>
                        <span className="font-medium">{selectedProduct.lowStockThreshold}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                {/* Search and Filter for manual mode */}
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs md:text-sm">Search Product</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by name or barcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-9 pr-9 text-xs md:h-10 md:text-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <Label className="text-xs md:text-sm">Filter by Category</Label>
                    <CategoryFilter
                      categories={categories}
                      value={selectedCategoryId}
                      onValueChange={setSelectedCategoryId}
                      className="h-9 w-full text-xs md:h-10 md:text-sm"
                    />
                  </div>
                </div>

                {/* Product Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="productId" className="text-xs md:text-sm">
                    Select Product *
                  </Label>
                  <Select
                    name="productId"
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ productId: value })}
                    required
                  >
                    <SelectTrigger className="h-9 w-full text-xs md:h-10 md:text-sm">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent className="w-full max-w-[calc(100vw-2rem)] md:max-w-[calc(var(--radix-select-trigger-width))]">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id}
                            className="text-xs md:text-sm"
                          >
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="flex-1 truncate">{product.name}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                Stock: {product.stockQty}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-muted-foreground md:text-sm">
                          No products found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {searchQuery || selectedCategoryId !== 'all' ? (
                    <p className="text-[10px] text-muted-foreground md:text-xs">
                      Showing {filteredProducts.length} of {products.length} products
                    </p>
                  ) : null}
                </div>
                {selectedProduct && (
                  <motion.div
                    className="rounded-md bg-muted p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-1.5 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {getCategoryName(selectedProduct.categoryId)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span className="text-base font-bold">{selectedProduct.stockQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alert Level:</span>
                        <span className="font-medium">{selectedProduct.lowStockThreshold}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Movement Type - Hidden in restock mode */}
          {!isRestockMode && (
            <div className="space-y-2">
              <Label className="text-xs md:text-sm">What do you want to do? *</Label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                  <input
                    type="radio"
                    name="type"
                    value="in"
                    checked={formData.type === 'in'}
                    onChange={(e) => setFormData({ type: e.target.value as 'in' })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium md:text-sm">Add Stock</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
                      Add new items (from supplier or restock)
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                  <input
                    type="radio"
                    name="type"
                    value="out"
                    checked={formData.type === 'out'}
                    onChange={(e) => setFormData({ type: e.target.value as 'out' })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-medium md:text-sm">Remove Stock</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
                      Reduce items (damaged, expired, or lost)
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                  <input
                    type="radio"
                    name="type"
                    value="adjust"
                    checked={formData.type === 'adjust'}
                    onChange={(e) => setFormData({ type: e.target.value as 'adjust' })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium md:text-sm">Set Exact Count</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
                      Set the correct total (after manual counting)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-xs md:text-sm">
              {isRestockMode
                ? 'How many items to add? *'
                : formData.type === 'adjust'
                  ? 'New Total Quantity *'
                  : 'How many? *'}
            </Label>
            <Input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ quantity: e.target.value })}
              min="1"
              step="1"
              required
              className="h-9 text-xs md:h-10 md:text-sm"
              placeholder={formData.type === 'adjust' ? 'Enter new total' : 'Enter quantity'}
            />
            {selectedProduct && formData.quantity && (
              <motion.p
                className="text-[10px] text-muted-foreground md:text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {formData.type === 'in' &&
                  `New stock will be: ${selectedProduct.stockQty} + ${formData.quantity} = ${selectedProduct.stockQty + parseInt(formData.quantity)}`}
                {formData.type === 'out' &&
                  `New stock will be: ${selectedProduct.stockQty} - ${formData.quantity} = ${selectedProduct.stockQty - parseInt(formData.quantity)}`}
                {formData.type === 'adjust' && `New stock will be set to: ${formData.quantity}`}
              </motion.p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="rounded-md bg-destructive/10 p-2 text-xs text-destructive md:p-3 md:text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.productId || !formData.quantity}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              {isLoading
                ? 'Saving...'
                : isRestockMode
                  ? 'Add Stock'
                  : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

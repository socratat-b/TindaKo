'use client'

import { useState } from 'react'
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
import { ArrowUpCircle, ArrowDownCircle, Settings } from 'lucide-react'
import type { Product, Category } from '@/lib/db/schema'
import { createInventoryMovement } from '@/lib/actions/inventory'
import { useSyncStore } from '@/lib/stores/sync-store'

type AdjustmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  products: Product[]
  categories: Category[]
}

export function AdjustmentFormDialog({
  open,
  onOpenChange,
  userId,
  products,
  categories,
}: AdjustmentFormDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjust'>('in')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const setHasPendingChanges = useSyncStore((state) => state.setHasPendingChanges)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(undefined)

    const qty = parseInt(quantity, 10)

    const result = await createInventoryMovement({
      userId,
      productId: selectedProductId,
      type: movementType,
      qty,
      notes: notes || undefined,
    })

    setIsPending(false)

    if (result.success) {
      setHasPendingChanges(true)
      setSelectedProductId('')
      setMovementType('in')
      setQuantity('')
      setNotes('')
      setError(undefined)
      onOpenChange(false)
    } else {
      setError(result.error)
    }
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            New Inventory Adjustment
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Add, remove, or adjust product stock levels
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="productId" className="text-xs md:text-sm">
              Product *
            </Label>
            <Select
              name="productId"
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              required
            >
              <SelectTrigger className="h-9 text-xs md:h-10 md:text-sm">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.id}
                    className="text-xs md:text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{product.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Stock: {product.stockQty}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <motion.div
                className="rounded-md bg-muted p-2 text-[10px] md:text-xs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">
                    {getCategoryName(selectedProduct.categoryId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock:</span>
                  <span className="font-semibold">{selectedProduct.stockQty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock Alert:</span>
                  <span>{selectedProduct.lowStockThreshold}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Movement Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-xs md:text-sm">
              Adjustment Type *
            </Label>
            <Select
              name="type"
              value={movementType}
              onValueChange={(value) => setMovementType(value as 'in' | 'out' | 'adjust')}
              required
            >
              <SelectTrigger className="h-9 text-xs md:h-10 md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in" className="text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    <span>Stock In (Add)</span>
                  </div>
                </SelectItem>
                <SelectItem value="out" className="text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    <span>Stock Out (Remove)</span>
                  </div>
                </SelectItem>
                <SelectItem value="adjust" className="text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span>Adjust (Set new total)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              {movementType === 'in' &&
                'Add stock to the current quantity (e.g., receiving new inventory)'}
              {movementType === 'out' &&
                'Remove stock from the current quantity (e.g., damaged items)'}
              {movementType === 'adjust' &&
                'Set the stock to a specific quantity (e.g., after physical count)'}
            </p>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-xs md:text-sm">
              {movementType === 'adjust' ? 'New Total Quantity *' : 'Quantity *'}
            </Label>
            <Input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              required
              className="h-9 text-xs md:h-10 md:text-sm"
              placeholder={movementType === 'adjust' ? 'Enter new total' : 'Enter quantity'}
            />
            {selectedProduct && quantity && (
              <motion.p
                className="text-[10px] text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {movementType === 'in' &&
                  `New stock: ${selectedProduct.stockQty} + ${quantity} = ${selectedProduct.stockQty + parseInt(quantity)}`}
                {movementType === 'out' &&
                  `New stock: ${selectedProduct.stockQty} - ${quantity} = ${selectedProduct.stockQty - parseInt(quantity)}`}
                {movementType === 'adjust' && `New stock will be set to: ${quantity}`}
              </motion.p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs md:text-sm">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-xs md:text-sm"
              placeholder="Add notes about this adjustment..."
            />
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedProductId || !quantity}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              {isPending ? 'Creating...' : 'Create Adjustment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

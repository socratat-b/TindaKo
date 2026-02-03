'use client'

import { useState, useEffect } from 'react'
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
import { ArrowUpCircle, ArrowDownCircle, Edit3 } from 'lucide-react'
import { createInventoryMovement } from '@/lib/actions/inventory'
import { useSyncStore } from '@/lib/stores/sync-store'
import { toast } from 'sonner'
import { getCategoryName } from '@/lib/utils/category-utils'
import type { Product, Category } from '@/lib/db/schema'

interface QuickAdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  type: 'in' | 'out' | 'adjust'
  userId: string
  categories: Category[]
}

export function QuickAdjustDialog({
  open,
  onOpenChange,
  product,
  type,
  userId,
  categories,
}: QuickAdjustDialogProps) {
  const [quantity, setQuantity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setHasPendingChanges } = useSyncStore()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    // Validate remove operation
    if (type === 'out' && qty > product.stockQty) {
      setError(`Cannot remove ${qty} items. Only ${product.stockQty} in stock.`)
      return
    }

    setIsLoading(true)

    try {
      const result = await createInventoryMovement({
        productId: product.id,
        type,
        qty,
        userId,
      })

      if (!result.success) {
        setError(result.error || 'Failed to adjust inventory')
        return
      }

      setHasPendingChanges(true)

      const actionText = type === 'in' ? 'added' : type === 'out' ? 'removed' : 'adjusted'
      toast.success(`Stock ${actionText} successfully`)

      onOpenChange(false)
    } catch (err) {
      console.error('Failed to adjust inventory:', err)
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory')
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'in':
        return 'Add Stock'
      case 'out':
        return 'Remove Stock'
      case 'adjust':
        return 'Set Exact Count'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'in':
        return <ArrowUpCircle className="h-5 w-5 text-green-600" />
      case 'out':
        return <ArrowDownCircle className="h-5 w-5 text-red-600" />
      case 'adjust':
        return <Edit3 className="h-5 w-5 text-blue-600" />
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'in':
        return 'Add new items to increase stock level'
      case 'out':
        return 'Reduce items (damaged, expired, or lost)'
      case 'adjust':
        return 'Set the correct total after manual counting'
    }
  }

  const getNewStock = () => {
    const qty = parseInt(quantity)
    if (isNaN(qty)) return null

    switch (type) {
      case 'in':
        return product.stockQty + qty
      case 'out':
        return product.stockQty - qty
      case 'adjust':
        return qty
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <motion.div
            className="rounded-lg bg-muted p-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-sm font-bold md:text-base">{product.name}</h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {getCategoryName(product.categoryId, categories)}
            </p>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Current Stock:</span>
                <span
                  className={`text-lg font-bold md:text-xl ${
                    product.stockQty === 0
                      ? 'text-red-600 dark:text-red-400'
                      : product.stockQty <= product.lowStockThreshold
                        ? 'text-orange-600 dark:text-orange-400'
                        : ''
                  }`}
                >
                  {product.stockQty}
                </span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Alert Level:</span>
                <span className="font-medium">{product.lowStockThreshold}</span>
              </div>
            </div>
          </motion.div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-xs md:text-sm">
              {type === 'adjust' ? 'New Total Quantity *' : 'Quantity *'}
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
              autoFocus
              className="h-9 text-xs md:h-10 md:text-sm"
              placeholder={type === 'adjust' ? 'Enter new total' : 'Enter quantity'}
            />
            {quantity && getNewStock() !== null && (
              <motion.p
                className="text-[10px] text-muted-foreground md:text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {type === 'in' && `New stock: ${product.stockQty} + ${quantity} = ${getNewStock()}`}
                {type === 'out' && `New stock: ${product.stockQty} - ${quantity} = ${getNewStock()}`}
                {type === 'adjust' && `New stock: ${getNewStock()}`}
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 flex-1 text-xs md:h-10 md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !quantity}
              className="h-9 flex-1 text-xs md:h-10 md:text-sm"
            >
              {isLoading ? 'Saving...' : 'Confirm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

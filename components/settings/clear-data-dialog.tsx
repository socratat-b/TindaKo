'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { clearAllLocalData } from '@/lib/actions/settings'

interface ClearDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function ClearDataDialog({
  open,
  onOpenChange,
  userId,
}: ClearDataDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get counts for all tables
  const categoriesCount = useLiveQuery(
    () => db.categories.where('userId').equals(userId).filter(c => !c.isDeleted).count(),
    [userId]
  )
  const productsCount = useLiveQuery(
    () => db.products.where('userId').equals(userId).filter(p => !p.isDeleted).count(),
    [userId]
  )
  const salesCount = useLiveQuery(
    () => db.sales.where('userId').equals(userId).filter(s => !s.isDeleted).count(),
    [userId]
  )
  const customersCount = useLiveQuery(
    () => db.customers.where('userId').equals(userId).filter(c => !c.isDeleted).count(),
    [userId]
  )
  const utangTransactionsCount = useLiveQuery(
    () => db.utangTransactions.where('userId').equals(userId).filter(u => !u.isDeleted).count(),
    [userId]
  )
  const inventoryMovementsCount = useLiveQuery(
    () => db.inventoryMovements.where('userId').equals(userId).filter(i => !i.isDeleted).count(),
    [userId]
  )

  const totalItems = (categoriesCount || 0) + (productsCount || 0) + (salesCount || 0) +
                     (customersCount || 0) + (utangTransactionsCount || 0) + (inventoryMovementsCount || 0)

  const handleClearData = async () => {
    setError(null)
    setIsProcessing(true)

    try {
      const result = await clearAllLocalData()

      if (result.success) {
        // Reload the page to refresh all data
        window.location.reload()
      } else {
        setError(result.error || 'Failed to clear data')
      }
    } catch (err) {
      setError('An error occurred while clearing data')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Clear All Local Data
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <p>This action will permanently delete all local data:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {categoriesCount !== undefined && categoriesCount > 0 && (
                <li>{categoriesCount} categories</li>
              )}
              {productsCount !== undefined && productsCount > 0 && (
                <li>{productsCount} products</li>
              )}
              {salesCount !== undefined && salesCount > 0 && (
                <li>{salesCount} sales</li>
              )}
              {customersCount !== undefined && customersCount > 0 && (
                <li>{customersCount} customers</li>
              )}
              {utangTransactionsCount !== undefined && utangTransactionsCount > 0 && (
                <li>{utangTransactionsCount} utang transactions</li>
              )}
              {inventoryMovementsCount !== undefined && inventoryMovementsCount > 0 && (
                <li>{inventoryMovementsCount} inventory movements</li>
              )}
            </ul>
            {totalItems === 0 && (
              <p className="text-xs">No data to clear.</p>
            )}
            <p className="font-semibold text-destructive pt-2">
              This cannot be undone. Make sure you have backed up to cloud before proceeding.
            </p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleClearData}
            disabled={isProcessing || totalItems === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

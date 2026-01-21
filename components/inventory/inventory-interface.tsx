'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { InventoryMovementsList } from './inventory-movements-list'
import { AdjustmentFormDialog } from './adjustment-form-dialog'
import { LowStockAlerts } from './low-stock-alerts'
import { useSyncStore } from '@/lib/stores/sync-store'

type InventoryInterfaceProps = {
  userId: string
}

export default function InventoryInterface({ userId }: InventoryInterfaceProps) {
  const [activeTab, setActiveTab] = useState('adjustments')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)

  const hasPendingChanges = useSyncStore((state) => state.hasPendingChanges)

  // Fetch all inventory movements
  const movements = useLiveQuery(
    () =>
      db.inventoryMovements
        .where('userId')
        .equals(userId)
        .filter((m) => !m.isDeleted)
        .reverse()
        .sortBy('createdAt'),
    [userId]
  )

  // Fetch products for the adjustment form
  const products = useLiveQuery(
    () =>
      db.products
        .where('userId')
        .equals(userId)
        .filter((p) => !p.isDeleted)
        .sortBy('name'),
    [userId]
  )

  // Fetch low stock products
  const lowStockProducts = useLiveQuery(
    () =>
      db.products
        .where('userId')
        .equals(userId)
        .filter((p) => !p.isDeleted && p.stockQty <= p.lowStockThreshold)
        .sortBy('stockQty'),
    [userId]
  )

  // Fetch categories for display
  const categories = useLiveQuery(
    () =>
      db.categories
        .where('userId')
        .equals(userId)
        .filter((c) => !c.isDeleted)
        .toArray(),
    [userId]
  )

  // Filter movements based on search
  const filteredMovements = movements?.filter((movement) => {
    if (!searchQuery) return true
    const product = products?.find((p) => p.id === movement.productId)
    const productName = product?.name.toLowerCase() || ''
    const notes = movement.notes?.toLowerCase() || ''
    const search = searchQuery.toLowerCase()
    return productName.includes(search) || notes.includes(search)
  })

  const lowStockCount = lowStockProducts?.length || 0

  return (
    <motion.div
      className="flex h-full flex-col gap-3 p-3 md:gap-6 md:p-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Inventory Management</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Track stock movements and manage inventory levels
          </p>
        </div>

        <Button
          onClick={() => setIsAdjustmentDialogOpen(true)}
          className="h-9 gap-2 text-xs md:h-10 md:text-sm"
        >
          <Plus className="h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      {/* Pending Changes Indicator */}
      {hasPendingChanges && (
        <motion.div
          className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-800 md:p-3 md:text-sm dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          You have unsynced changes. Click &quot;Backup to cloud&quot; to sync.
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search movements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-xs md:h-10 md:text-sm"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="adjustments" className="text-xs md:text-sm">
            Adjustments
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">
            History
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="relative text-xs md:text-sm">
            Low Stock
            {lowStockCount > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-semibold text-destructive-foreground md:text-[10px]">
                {lowStockCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adjustments" className="mt-3 md:mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">
                  Manual Stock Adjustments
                </h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  Create manual adjustments to add, remove, or set inventory levels
                </p>
              </div>

              <InventoryMovementsList
                movements={filteredMovements?.filter((m) => m.type === 'adjust') || []}
                products={products || []}
                categories={categories || []}
                emptyMessage="No manual adjustments yet. Click 'New Adjustment' to create one."
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-3 md:mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">Movement History</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  All inventory movements including sales and adjustments
                </p>
              </div>

              <InventoryMovementsList
                movements={filteredMovements || []}
                products={products || []}
                categories={categories || []}
                emptyMessage="No inventory movements recorded yet."
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="mt-3 md:mt-6">
          <LowStockAlerts
            products={lowStockProducts || []}
            categories={categories || []}
            userId={userId}
          />
        </TabsContent>
      </Tabs>

      {/* Adjustment Form Dialog */}
      <AdjustmentFormDialog
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
        userId={userId}
        products={products || []}
        categories={categories || []}
      />
    </motion.div>
  )
}

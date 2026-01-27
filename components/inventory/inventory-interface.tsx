'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { InventoryMovementsList } from './inventory-movements-list'
import { AdjustmentFormDialog } from './adjustment-form-dialog'
import { LowStockAlerts } from './low-stock-alerts'
import { AllProductsList } from './all-products-list'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useInventoryList } from '@/lib/hooks/use-inventory-list'
import type { InventoryInterfaceProps } from '@/lib/types'

export default function InventoryInterface({ storePhone }: InventoryInterfaceProps) {
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)

  const hasPendingChanges = useSyncStore((state) => state.hasPendingChanges)

  const {
    activeTab,
    searchQuery,
    products,
    lowStockProducts,
    categories,
    filteredMovements,
    lowStockCount,
    allProductsPage,
    lowStockPage,
    historyPage,
    itemsPerPage,
    setActiveTab,
    setSearchQuery,
    setAllProductsPage,
    setLowStockPage,
    setHistoryPage,
  } = useInventoryList({ storePhone })

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
          Adjust Stock
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'inventory' | 'history')}
        className="flex-1"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="relative text-xs md:text-sm">
            Inventory
            {lowStockCount > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-semibold text-destructive-foreground md:text-[10px]">
                {lowStockCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-3 space-y-4 md:mt-6">
          {/* Search for All Products */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs md:h-10 md:text-sm"
            />
          </div>

          {/* Low Stock Alerts Section - Only show if there are alerts */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <div>
              <LowStockAlerts
                lowStockProducts={lowStockProducts}
                allProducts={products || []}
                categories={categories || []}
                storePhone={storePhone}
                currentPage={lowStockPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setLowStockPage}
              />
            </div>
          )}

          {/* All Products List */}
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">All Products</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  View current stock levels for all products
                </p>
              </div>

              <AllProductsList
                products={products || []}
                categories={categories || []}
                searchQuery={searchQuery}
                currentPage={allProductsPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setAllProductsPage}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-3 md:mt-6">
          {/* Search for History */}
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs md:h-10 md:text-sm"
            />
          </div>

          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">Stock History</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  All inventory movements including sales and adjustments
                </p>
              </div>

              <InventoryMovementsList
                movements={filteredMovements || []}
                products={products || []}
                categories={categories || []}
                emptyMessage="No inventory movements recorded yet."
                currentPage={historyPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setHistoryPage}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjustment Form Dialog */}
      <AdjustmentFormDialog
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
        storePhone={storePhone}
        products={products || []}
        categories={categories || []}
      />
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Package, ArrowUpCircle } from 'lucide-react'
import { useSettings } from '@/lib/hooks/use-settings'
import type { Product, Category } from '@/lib/db/schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdjustmentFormDialog } from './adjustment-form-dialog'

type LowStockAlertsProps = {
  products: Product[]
  categories: Category[]
  userId: string
}

export function LowStockAlerts({
  products,
  categories,
  userId,
}: LowStockAlertsProps) {
  const { showLowStockAlerts } = useSettings()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)

  // Don't show alerts if disabled in settings
  if (!showLowStockAlerts) {
    return null
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
  }

  const getStockStatus = (stockQty: number, threshold: number) => {
    if (stockQty === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' }
    }
    if (stockQty <= threshold * 0.5) {
      return { label: 'Critical', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200' }
    }
    return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' }
  }

  const handleRestock = (productId: string) => {
    setSelectedProductId(productId)
    setIsAdjustmentDialogOpen(true)
  }

  if (!products || products.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Package className="mb-3 h-12 w-12 text-green-600 dark:text-green-400" />
        <h3 className="text-base font-semibold md:text-lg">All Stock Levels Good!</h3>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          No products are currently below their low stock threshold.
        </p>
      </motion.div>
    )
  }

  // Sort by stock quantity (lowest first)
  const sortedProducts = [...products].sort((a, b) => a.stockQty - b.stockQty)

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold md:text-lg">Low Stock Alerts</h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {products.length} {products.length === 1 ? 'product' : 'products'} below
              threshold. Restock soon to avoid running out.
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-[100px] text-center">Stock</TableHead>
                  <TableHead className="w-[100px] text-center">Threshold</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product, index) => {
                  const status = getStockStatus(product.stockQty, product.lowStockThreshold)
                  const categoryName = getCategoryName(product.categoryId)

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{categoryName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`text-sm font-semibold ${
                            product.stockQty === 0
                              ? 'text-red-600 dark:text-red-400'
                              : product.stockQty <= product.lowStockThreshold * 0.5
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {product.stockQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {product.lowStockThreshold}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestock(product.id)}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                          Restock
                        </Button>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="grid gap-2 md:hidden">
          {sortedProducts.map((product, index) => {
            const status = getStockStatus(product.stockQty, product.lowStockThreshold)
            const categoryName = getCategoryName(product.categoryId)

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-0.5 h-2 w-2 rounded-full ${
                            product.stockQty === 0
                              ? 'bg-red-600'
                              : product.stockQty <= product.lowStockThreshold * 0.5
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-semibold">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {categoryName}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Stock: </span>
                          <span
                            className={`font-semibold ${
                              product.stockQty === 0
                                ? 'text-red-600'
                                : product.stockQty <= product.lowStockThreshold * 0.5
                                  ? 'text-orange-600'
                                  : 'text-yellow-600'
                            }`}
                          >
                            {product.stockQty}
                          </span>
                        </div>
                        <div className="text-muted-foreground">•</div>
                        <div>
                          <span className="text-muted-foreground">Threshold: </span>
                          <span className="font-medium">
                            {product.lowStockThreshold}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant="outline" className={`text-[9px] ${status.color}`}>
                        {status.label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestock(product.id)}
                        className="h-7 gap-1 text-[10px]"
                      >
                        <ArrowUpCircle className="h-3 w-3" />
                        Restock
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* Adjustment Dialog */}
      {selectedProductId && (
        <AdjustmentFormDialog
          open={isAdjustmentDialogOpen}
          onOpenChange={(open) => {
            setIsAdjustmentDialogOpen(open)
            if (!open) setSelectedProductId(null)
          }}
          userId={userId}
          products={products}
          categories={categories}
        />
      )}
    </>
  )
}

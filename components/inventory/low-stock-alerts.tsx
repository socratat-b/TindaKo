'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Package, ArrowUpCircle } from 'lucide-react'
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
import { Pagination } from '@/components/ui/pagination'
import { AdjustmentFormDialog } from './adjustment-form-dialog'
import type { LowStockAlertsProps } from '@/lib/types'

export function LowStockAlerts({
  lowStockProducts,
  allProducts,
  categories,
  categoryFilter,
  userId,
  currentPage,
  itemsPerPage,
  onPageChange,
}: LowStockAlertsProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280'
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

  // Filter by category
  const filteredLowStockProducts = lowStockProducts?.filter((product) => {
    return categoryFilter === 'all' || product.categoryId === categoryFilter
  })

  if (!filteredLowStockProducts || filteredLowStockProducts.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Package className="mb-3 h-12 w-12 text-green-600 dark:text-green-400" />
        <h3 className="text-base font-semibold md:text-lg">
          {categoryFilter === 'all' ? 'All Stock Levels Good!' : 'No Low Stock Items'}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          {categoryFilter === 'all'
            ? 'No products are currently below their low stock threshold.'
            : 'No products in this category are below their low stock threshold.'}
        </p>
      </motion.div>
    )
  }

  // Sort by stock quantity (lowest first)
  const sortedProducts = [...filteredLowStockProducts].sort((a, b) => a.stockQty - b.stockQty)

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

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
              {filteredLowStockProducts.length} {filteredLowStockProducts.length === 1 ? 'product' : 'products'} below
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
                {paginatedProducts.map((product, index) => {
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
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              backgroundColor: `${getCategoryColor(product.categoryId)}20`,
                              borderColor: getCategoryColor(product.categoryId),
                              color: getCategoryColor(product.categoryId),
                            }}
                          >
                            {categoryName}
                          </Badge>
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
          {paginatedProducts.map((product, index) => {
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
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">{product.name}</p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 text-[9px] ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>

                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          backgroundColor: `${getCategoryColor(product.categoryId)}20`,
                          borderColor: getCategoryColor(product.categoryId),
                          color: getCategoryColor(product.categoryId),
                        }}
                      >
                        {categoryName}
                      </Badge>

                      <div className="flex items-center gap-3 text-[10px]">
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

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestock(product.id)}
                        className="h-7 w-full gap-1 text-[10px]"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              totalItems={sortedProducts.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>

      {/* Adjustment Dialog - Restock Mode */}
      <AdjustmentFormDialog
        open={isAdjustmentDialogOpen}
        onOpenChange={(open) => {
          setIsAdjustmentDialogOpen(open)
          if (!open) setSelectedProductId(null)
        }}
        userId={userId}
        products={allProducts}
        categories={categories}
        initialProductId={selectedProductId || undefined}
        mode="restock"
      />
    </>
  )
}

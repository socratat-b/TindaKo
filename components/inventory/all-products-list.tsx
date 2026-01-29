'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Plus, Minus, Edit3 } from 'lucide-react'
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
import { getCategoryName } from '@/lib/utils/category-utils'
import { QuickAdjustDialog } from './quick-adjust-dialog'
import type { Product, Category } from '@/lib/db/schema'

interface AllProductsListProps {
  products: Product[]
  categories: Category[]
  searchQuery: string
  categoryFilter: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  storePhone: string
}

export function AllProductsList({
  products,
  categories,
  searchQuery,
  categoryFilter,
  currentPage,
  itemsPerPage,
  onPageChange,
  storePhone,
}: AllProductsListProps) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'adjust'>('in')
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false)

  const handleAdjustStock = (product: Product, type: 'in' | 'out' | 'adjust') => {
    setSelectedProduct(product)
    setAdjustmentType(type)
    setIsQuickAdjustOpen(true)
  }
  const getStockStatus = (stockQty: number, threshold: number) => {
    if (stockQty === 0) {
      return {
        label: 'Out of Stock',
        color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
      }
    }
    if (stockQty <= threshold) {
      return {
        label: 'Low Stock',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
      }
    }
    return {
      label: 'Good Stock',
      color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    }
  }

  // Filter products based on search query and category
  const filteredProducts = products.filter((product) => {
    // Category filter
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || product.categoryId === categoryFilter

    // Search filter
    if (!searchQuery) return matchesCategory
    const productName = product.name.toLowerCase()
    const categoryName = getCategoryName(product.categoryId, categories).toLowerCase()
    const search = searchQuery.toLowerCase()
    const matchesSearch = productName.includes(search) || categoryName.includes(search)

    return matchesCategory && matchesSearch
  })

  // Sort by stock status (out of stock first, then low stock, then good stock)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aStatus = getStockStatus(a.stockQty, a.lowStockThreshold)
    const bStatus = getStockStatus(b.stockQty, b.lowStockThreshold)

    // Priority: Out of Stock > Low Stock > Good Stock
    const priority = {
      'Out of Stock': 0,
      'Low Stock': 1,
      'Good Stock': 2,
    }

    return priority[aStatus.label as keyof typeof priority] - priority[bStatus.label as keyof typeof priority]
  })

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

  if (!products || products.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center gap-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Package className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-base font-semibold md:text-lg">No Products Yet</h3>
          <p className="text-xs text-muted-foreground md:text-sm">
            Add products to start tracking inventory
          </p>
        </div>
        <Button
          onClick={() => router.push('/products')}
          size="sm"
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Product
        </Button>
      </motion.div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Package className="mb-3 h-12 w-12 text-muted-foreground" />
        <h3 className="text-base font-semibold md:text-lg">No Results Found</h3>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Try adjusting your search query.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[100px] text-center">Stock</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product, index) => {
                const status = getStockStatus(product.stockQty, product.lowStockThreshold)

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <p className="font-medium text-sm">{product.name}</p>
                      {product.barcode && (
                        <p className="text-xs text-muted-foreground">{product.barcode}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getCategoryName(product.categoryId, categories)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm font-semibold ${
                          product.stockQty === 0
                            ? 'text-red-600 dark:text-red-400'
                            : product.stockQty <= product.lowStockThreshold
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {product.stockQty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustStock(product, 'in')}
                          className="h-8 gap-1 text-xs"
                          title="Add Stock"
                        >
                          <Plus className="h-3.5 w-3.5 text-green-600" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustStock(product, 'out')}
                          className="h-8 gap-1 text-xs"
                          title="Remove Stock"
                        >
                          <Minus className="h-3.5 w-3.5 text-red-600" />
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustStock(product, 'adjust')}
                          className="h-8 gap-1 text-xs"
                          title="Set Exact Count"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                          Set
                        </Button>
                      </div>
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
                        {product.barcode && (
                          <p className="text-[10px] text-muted-foreground">{product.barcode}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[9px] ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      {getCategoryName(product.categoryId, categories)}
                    </span>

                    <div className="flex items-center gap-3 text-[10px]">
                      <div>
                        <span className="text-muted-foreground">Stock: </span>
                        <span
                          className={`font-semibold ${
                            product.stockQty === 0
                              ? 'text-red-600'
                              : product.stockQty <= product.lowStockThreshold
                                ? 'text-orange-600'
                                : 'text-green-600'
                          }`}
                        >
                          {product.stockQty}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustStock(product, 'in')}
                        className="h-7 flex-1 gap-1 text-[10px]"
                      >
                        <Plus className="h-3 w-3 text-green-600" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustStock(product, 'out')}
                        className="h-7 flex-1 gap-1 text-[10px]"
                      >
                        <Minus className="h-3 w-3 text-red-600" />
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustStock(product, 'adjust')}
                        className="h-7 flex-1 gap-1 text-[10px]"
                      >
                        <Edit3 className="h-3 w-3 text-blue-600" />
                        Set
                      </Button>
                    </div>
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

      {/* Quick Adjust Dialog */}
      {selectedProduct && (
        <QuickAdjustDialog
          open={isQuickAdjustOpen}
          onOpenChange={setIsQuickAdjustOpen}
          product={selectedProduct}
          type={adjustmentType}
          storePhone={storePhone}
          categories={categories}
        />
      )}
    </>
  )
}

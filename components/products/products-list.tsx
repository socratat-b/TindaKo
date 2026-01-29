'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ProductFormDialog } from './product-form-dialog'
import { QuickAddProductDialog } from './quick-add-product-dialog'
import { AddProductOptionsDialog } from './add-product-options-dialog'
import { useProductsList } from '@/lib/hooks/use-products-list'
import { useFormatCurrency } from '@/lib/utils/currency'
import { Zap } from 'lucide-react'
import type { ProductsListProps } from '@/lib/types'

export function ProductsList({
  products,
  categories,
  storePhone,
  onRefresh,
  catalogData,
}: ProductsListProps) {
  const formatCurrency = useFormatCurrency()
  const router = useRouter()

  const {
    search,
    categoryFilter,
    editingProduct,
    isFormOpen,
    isQuickAddOpen,
    isOptionsDialogOpen,
    deletingProduct,
    isDeleteDialogOpen,
    filteredProducts,
    setSearch,
    setCategoryFilter,
    setIsQuickAddOpen,
    setIsOptionsDialogOpen,
    setIsDeleteDialogOpen,
    setIsFormOpen,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleFormClose,
    getCategoryName,
    getCategoryColor,
    getStockStatus,
  } = useProductsList({ products, categories, onRefresh })

  // Handle catalog data from URL (auto-open form dialog)
  useEffect(() => {
    if (catalogData && catalogData.fromCatalog) {
      // Open form dialog with catalog data
      setIsFormOpen(true)

      // Clear URL parameters after opening
      router.replace('/products')
    }
  }, [catalogData, setIsFormOpen, router])

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4"
      >
        <div className="flex flex-col gap-2 lg:flex-1 lg:flex-row">
          <Input
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs lg:h-10 lg:max-w-sm lg:text-sm"
          />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full text-xs lg:h-10 lg:w-45 lg:text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs lg:text-sm">
                All Categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs lg:text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setIsOptionsDialogOpen(true)}
          className="h-9 w-full gap-1.5 text-xs lg:h-10 lg:w-auto lg:text-sm"
          variant="default"
        >
          <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          <span>Add Product</span>
        </Button>
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="p-6 lg:p-12">
          <div className="flex flex-col items-center gap-2 text-center">
            {products.length === 0 ? (
              <>
                <p className="text-sm font-medium lg:text-lg">Welcome to TindaKo!</p>
                <p className="text-xs text-muted-foreground lg:text-sm">
                  Start by adding your first product. Click &quot;Add Product&quot; to get started.
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground lg:text-xs">
                  Tip: Add common items like Coke 1L, Lucky Me Pancit Canton, or Del Monte Sardinas
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground lg:text-sm">No products found matching your search.</p>
            )}
          </div>
        </Card>
      )}

      {/* Mobile Card View */}
      <div className="space-y-2 lg:hidden">
        {filteredProducts.map((product, index) => {
          const stockStatus = getStockStatus(product)
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
            >
              <Card className="p-3">
              <div className="space-y-2">
                {/* Product Name and Stock Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold break-words leading-tight">{product.name}</h3>
                    {product.barcode && (
                      <p className="text-[10px] font-mono text-muted-foreground break-all">{product.barcode}</p>
                    )}
                  </div>
                  <Badge variant={stockStatus.variant} className="text-[9px] shrink-0">
                    {stockStatus.label}
                  </Badge>
                </div>

                {/* Category Badge */}
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{
                    backgroundColor: getCategoryColor(product.categoryId) + '20',
                    borderColor: getCategoryColor(product.categoryId),
                    color: getCategoryColor(product.categoryId),
                  }}
                >
                  {getCategoryName(product.categoryId)}
                </Badge>

                {/* Pricing and Stock Info */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Price</p>
                    <p className="text-xs font-semibold">{formatCurrency(product.sellingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Stock</p>
                    <p className="text-xs font-medium">{product.stockQty}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1 h-8 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product)}
                    className="flex-1 h-8 text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden rounded-md border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {products.length === 0 ? (
                      <>
                        <p className="text-lg font-medium">Welcome to TindaKo!</p>
                        <p className="text-sm text-muted-foreground">
                          Start by adding your first product. Click &quot;Add Product&quot; to get started.
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Tip: Add common items like Coke 1L, Lucky Me Pancit Canton, or Del Monte Sardinas
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No products found matching your search.</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product)
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.barcode || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: getCategoryColor(product.categoryId) + '20',
                          borderColor: getCategoryColor(product.categoryId),
                          color: getCategoryColor(product.categoryId),
                        }}
                      >
                        {getCategoryName(product.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell className="text-right">{product.stockQty}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddProductOptionsDialog
        open={isOptionsDialogOpen}
        onOpenChange={setIsOptionsDialogOpen}
        onSelectQuickAdd={() => setIsQuickAddOpen(true)}
        onSelectManualAdd={() => setIsFormOpen(true)}
      />

      <QuickAddProductDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        categories={categories}
        storePhone={storePhone}
        onSuccess={onRefresh}
      />

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
        categories={categories}
        storePhone={storePhone}
        onSuccess={onRefresh}
        catalogData={catalogData}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

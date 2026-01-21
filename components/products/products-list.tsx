'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
import { ProductFormDialog } from './product-form-dialog'
import { deleteProduct } from '@/lib/actions/products'
import type { Product, Category } from '@/lib/db/schema'

interface ProductsListProps {
  products: Product[]
  categories: Category[]
  userId: string
  onRefresh: () => void
}

export function ProductsList({
  products,
  categories,
  userId,
  onRefresh,
}: ProductsListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || product.categoryId === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      await deleteProduct(product.id)
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown'
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280'
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQty === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const }
    }
    if (product.stockQty <= product.lowStockThreshold) {
      return { label: 'Low Stock', variant: 'secondary' as const }
    }
    return { label: 'In Stock', variant: 'default' as const }
  }

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
            <SelectTrigger className="h-9 w-full text-xs lg:h-10 lg:w-[180px] lg:text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditingProduct(null)
            setIsFormOpen(true)
          }}
          className="h-9 w-full text-xs lg:h-10 lg:w-auto lg:text-sm"
        >
          Add Product
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
                    <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                    {product.barcode && (
                      <p className="text-[10px] font-mono text-muted-foreground">{product.barcode}</p>
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
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Cost</p>
                    <p className="text-xs font-medium">₱{product.costPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Price</p>
                    <p className="text-xs font-semibold">₱{product.sellingPrice.toFixed(2)}</p>
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
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
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
                      ₱{product.costPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₱{product.sellingPrice.toFixed(2)}
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

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
        categories={categories}
        userId={userId}
        onSuccess={onRefresh}
      />
    </div>
  )
}

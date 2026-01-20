'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
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
        >
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
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
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <TableRow key={product.id}>
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
                  </TableRow>
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

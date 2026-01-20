'use client'

import { useEffect, useState, useMemo } from 'react'
import { db } from '@/lib/db'
import type { Product, Category } from '@/lib/db/schema'
import { useCart } from '@/lib/hooks/use-cart'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus, Package } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()

  // Load products and categories from Dexie
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [allProducts, allCategories] = await Promise.all([
          db.products.toArray(),
          db.categories.toArray(),
        ])

        const productsData = allProducts.filter((p) => !p.isDeleted)
        const categoriesData = allCategories
          .filter((c) => !c.isDeleted)
          .sort((a, b) => a.sortOrder - b.sortOrder)

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchQuery))

      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleAddToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert('Product is out of stock')
      return
    }
    addItem(product)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'all'
              ? 'No products found matching your search'
              : 'No products available. Add products to get started.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId)
            const isOutOfStock = product.stockQty <= 0
            const isLowStock =
              !isOutOfStock && product.stockQty <= product.lowStockThreshold

            return (
              <Card
                key={product.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  isOutOfStock ? 'opacity-50' : ''
                }`}
                onClick={() => !isOutOfStock && handleAddToCart(product)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    {!isOutOfStock && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {category && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        borderColor: category.color,
                      }}
                    >
                      {category.name}
                    </Badge>
                  )}

                  <div className="space-y-1">
                    <p className="text-lg font-bold text-emerald-600">
                      ₱{product.sellingPrice.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <span
                        className={
                          isOutOfStock
                            ? 'text-destructive font-medium'
                            : isLowStock
                              ? 'text-amber-600 font-medium'
                              : 'text-muted-foreground'
                        }
                      >
                        {isOutOfStock
                          ? 'Out of stock'
                          : `Stock: ${product.stockQty}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import type { Product, Category } from '@/lib/db/schema'
import { useCart } from '@/lib/hooks/use-cart'
import { useFormatCurrency } from '@/lib/utils/currency'
import { useSyncStore } from '@/lib/stores/sync-store'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus, Package, CloudDownload, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductGridProps {
  userId: string
}

export function ProductGrid({ userId }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const { addItem, items: cartItems } = useCart()
  const formatCurrency = useFormatCurrency()
  const { status: syncStatus } = useSyncStore()

  // Load products and categories from Dexie (filtered by userId)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [allProducts, allCategories] = await Promise.all([
          db.products.where('userId').equals(userId).toArray(),
          db.categories.where('userId').equals(userId).toArray(),
        ])

        const productsData = allProducts.filter((p) => !p.isDeleted)
        const categoriesData = allCategories
          .filter((c) => !c.isDeleted)
          .sort((a, b) => a.sortOrder - b.sortOrder)

        console.log('[ProductGrid] Loaded', productsData.length, 'products')
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Listen for data restore event to reload products
    const handleDataRestored = () => {
      console.log('[ProductGrid] Data restored event received - reloading')
      loadData()
    }

    // Listen for local data changes (products/categories added/updated)
    const handleLocalDataChanged = () => {
      console.log('[ProductGrid] Local data changed - reloading')
      loadData()
    }

    window.addEventListener('data-restored', handleDataRestored)
    window.addEventListener('local-data-changed', handleLocalDataChanged)

    return () => {
      window.removeEventListener('data-restored', handleDataRestored)
      window.removeEventListener('local-data-changed', handleLocalDataChanged)
    }
  }, [userId])

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

  // Show loading skeleton when syncing or initially loading with no data
  const showLoadingSkeleton = (isLoading && products.length === 0) || (syncStatus === 'syncing' && products.length === 0)

  if (showLoadingSkeleton) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md space-y-6"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex justify-center"
          >
            <CloudDownload className="w-20 h-20 text-primary" />
          </motion.div>

          {/* Main Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              Fetching Your Products
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Please wait while we download your data from the cloud...
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              className="w-3 h-3 rounded-full bg-primary"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              className="w-3 h-3 rounded-full bg-primary"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              className="w-3 h-3 rounded-full bg-primary"
            />
          </div>

          {/* Helper Text */}
          <p className="text-sm text-muted-foreground px-4">
            This usually takes just a few seconds. Your products, categories, and sales data are being loaded.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Filter - Fixed at top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-none flex flex-col lg:flex-row gap-2 mb-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full lg:w-[120px] h-9 text-sm">
            <SelectValue placeholder="Category" />
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
      </motion.div>

      {/* Product List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground px-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'No products found'
                : 'No products available'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {filteredProducts.map((product, index) => {
              const category = categories.find((c) => c.id === product.categoryId)

              // Calculate remaining stock after cart items
              const cartItem = cartItems.find(item => item.productId === product.id)
              const cartQty = cartItem?.quantity || 0
              const remainingStock = product.stockQty - cartQty

              const isOutOfStock = remainingStock <= 0
              const isLowStock =
                !isOutOfStock && remainingStock <= product.lowStockThreshold

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
                >
                  <Card
                    className={`p-2.5 cursor-pointer transition-all active:scale-[0.99] ${
                      isOutOfStock ? 'opacity-50' : ''
                    }`}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                  >
                  <div className="flex items-start gap-2.5">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                          {product.name}
                        </h3>
                        {category && (
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 px-1.5 shrink-0"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-base font-bold text-emerald-600">
                          {formatCurrency(product.sellingPrice)}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            isOutOfStock
                              ? 'text-destructive'
                              : isLowStock
                                ? 'text-amber-600'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {isOutOfStock
                            ? 'Out of stock'
                            : `${remainingStock} left`}
                        </p>
                      </div>
                    </div>

                    {/* Add Button */}
                    {!isOutOfStock && (
                      <Button
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

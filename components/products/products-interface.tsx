'use client'

import { useState, useMemo, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { seedDefaultCategories } from '@/lib/db/seeders'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductsList } from './products-list'
import { CategoriesList } from './categories-list'

interface ProductsInterfaceProps {
  userId: string
}

export default function ProductsInterface({ userId }: ProductsInterfaceProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSeeding, setIsSeeding] = useState(false)

  const products = useLiveQuery(
    () => db.products.filter((p) => !p.isDeleted).toArray(),
    [refreshKey]
  )

  const categories = useLiveQuery(
    () => db.categories.filter((c) => !c.isDeleted).toArray(),
    [refreshKey]
  )

  const productCounts = useMemo(() => {
    if (!products || !categories) return {}

    const counts: Record<string, number> = {}
    categories.forEach((cat) => {
      counts[cat.id] = products.filter((p) => p.categoryId === cat.id).length
    })
    return counts
  }, [products, categories])

  // Auto-seed default categories for new users
  useEffect(() => {
    if (categories && categories.length === 0 && !isSeeding) {
      setIsSeeding(true)
      seedDefaultCategories(userId)
        .then(() => {
          handleRefresh()
        })
        .catch((err) => {
          console.error('Failed to seed categories:', err)
        })
        .finally(() => {
          setIsSeeding(false)
        })
    }
  }, [categories, userId, isSeeding])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (!products || !categories) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products & Categories</h1>
        <p className="text-muted-foreground">
          Manage your inventory and product categories
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsList
            products={products}
            categories={categories}
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesList
            categories={categories}
            productCounts={productCounts}
            userId={userId}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

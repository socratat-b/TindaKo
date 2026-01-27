'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { seedDefaultCategories } from '@/lib/db/seeders'
import { ProductsList } from './products-list'
import type { ProductsInterfaceProps } from '@/lib/types'

export default function ProductsInterface({ storePhone }: ProductsInterfaceProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSeeding, setIsSeeding] = useState(false)

  const products = useLiveQuery(
    () => db.products.where('storePhone').equals(storePhone).filter((p) => !p.isDeleted).toArray(),
    [storePhone, refreshKey]
  )

  const categories = useLiveQuery(
    () => db.categories.where('storePhone').equals(storePhone).filter((c) => !c.isDeleted).toArray(),
    [storePhone, refreshKey]
  )

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  // Auto-seed default categories for new users
  useEffect(() => {
    if (categories && categories.length === 0 && !isSeeding) {
      const seedCategories = async () => {
        setIsSeeding(true)
        try {
          await seedDefaultCategories(storePhone)
          handleRefresh()
        } catch (err) {
          console.error('Failed to seed categories:', err)
        } finally {
          setIsSeeding(false)
        }
      }
      seedCategories()
    }
  }, [categories, storePhone, isSeeding, handleRefresh])

  if (!products || !categories) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-3 lg:space-y-6 lg:p-0">
      <div>
        <h1 className="text-xl font-bold lg:text-3xl">Products</h1>
        <p className="text-xs text-muted-foreground lg:text-sm">
          Manage your product inventory
        </p>
      </div>

      <ProductsList
        products={products}
        categories={categories}
        storePhone={storePhone}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

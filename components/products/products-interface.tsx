'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { seedDefaultCategories } from '@/lib/db/seeders'
import { ProductsList } from './products-list'

interface ProductsInterfaceProps {
  userId: string
}

export default function ProductsInterface({ userId }: ProductsInterfaceProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSeeding, setIsSeeding] = useState(false)

  const products = useLiveQuery(
    () => db.products.where('userId').equals(userId).filter((p) => !p.isDeleted).toArray(),
    [userId, refreshKey]
  )

  const categories = useLiveQuery(
    () => db.categories.where('userId').equals(userId).filter((c) => !c.isDeleted).toArray(),
    [userId, refreshKey]
  )

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
        userId={userId}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

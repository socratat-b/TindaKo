'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const ProductsInterface = dynamic(() => import('@/components/products/products-interface'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 p-3 md:p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 md:w-64" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 flex-shrink-0" />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  ),
})

interface ProductsClientProps {
  userId: string
}

export default function ProductsClient({ userId }: ProductsClientProps) {
  return <ProductsInterface userId={userId} />
}

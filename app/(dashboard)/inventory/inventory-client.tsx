'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const InventoryInterface = dynamic(
  () => import('@/components/inventory/inventory-interface'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 p-3 md:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-9 w-full md:w-48" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    ),
  }
)

type InventoryClientProps = {
  userId: string
}

export default function InventoryClient({ userId }: InventoryClientProps) {
  return <InventoryInterface userId={userId} />
}

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import POS interface (Dexie requires client-side)
const POSInterface = dynamic(() => import('@/components/pos/pos-interface'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-3 p-3 md:flex-row md:gap-4 md:p-6">
      {/* Product Grid Skeleton */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>

      {/* Cart Skeleton */}
      <div className="w-full space-y-3 md:w-96">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-64" />
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-12" />
        </div>
      </div>
    </div>
  ),
})

interface POSClientProps {
  userId: string
}

export default function POSClient({ userId }: POSClientProps) {
  return <POSInterface userId={userId} />
}

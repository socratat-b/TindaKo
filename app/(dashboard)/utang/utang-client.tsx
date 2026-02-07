'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const UtangInterface = dynamic(
  () => import('@/components/utang/utang-interface'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 p-3 md:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-full md:w-64" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>

        {/* Table Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    ),
  }
)

interface UtangClientProps {
  userId: string
}

export default function UtangClient({ userId }: UtangClientProps) {
  return <UtangInterface userId={userId} />
}

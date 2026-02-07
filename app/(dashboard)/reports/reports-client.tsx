'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

interface ReportsClientProps {
  userId: string
}

const ReportsInterface = dynamic(
  () => import('@/components/reports/reports-interface'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 p-3 md:p-6">
        {/* Header & Date Filter Skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-full md:w-80" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>

        {/* Payment Breakdown Skeleton */}
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Transactions Table Skeleton */}
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

export default function ReportsClient({ userId }: ReportsClientProps) {
  return <ReportsInterface userId={userId} />
}

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const UtangInterface = dynamic(
  () => import('@/components/utang/utang-interface'),
  {
    ssr: false,
    loading: () => (
      <div className="p-3 md:p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-full md:w-64" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
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

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import Settings interface (Dexie requires client-side)
const SettingsInterface = dynamic(() => import('@/components/settings/settings-interface'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-3 md:p-6">
      {/* Header Skeleton */}
      <Skeleton className="h-8 w-32" />

      {/* Settings Sections Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border p-4 md:p-6">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
})

interface SettingsClientProps {
  userId: string
}

export default function SettingsClient({ userId }: SettingsClientProps) {
  return <SettingsInterface userId={userId} />
}

'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import Settings interface (Dexie requires client-side)
const SettingsInterface = dynamic(() => import('@/components/settings/settings-interface'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface SettingsClientProps {
  userId: string
}

export default function SettingsClient({ userId }: SettingsClientProps) {
  return <SettingsInterface userId={userId} />
}

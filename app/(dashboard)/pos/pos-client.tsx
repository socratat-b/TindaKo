'use client'

import dynamic from 'next/dynamic'

// Dynamically import POS interface (Dexie requires client-side)
const POSInterface = dynamic(() => import('@/components/pos/pos-interface'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <p className="text-muted-foreground">Loading POS...</p>
    </div>
  ),
})

interface POSClientProps {
  storePhone: string
}

export default function POSClient({ storePhone }: POSClientProps) {
  return <POSInterface storePhone={storePhone} />
}

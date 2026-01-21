'use client'

import dynamic from 'next/dynamic'

const InventoryInterface = dynamic(
  () => import('@/components/inventory/inventory-interface'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading inventory...</p>
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

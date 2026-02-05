'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import InventoryClient from './inventory-client'

export default function InventoryPage() {
  const { userId } = useAuth()
  return <InventoryClient userId={userId || ''} />
}

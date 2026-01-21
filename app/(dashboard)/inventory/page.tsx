import { getUser } from '@/lib/dal'
import InventoryClient from './inventory-client'

export const metadata = {
  title: 'Inventory | TindaKo',
  description: 'Manage inventory movements and track stock levels',
}

export default async function InventoryPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-destructive">Unable to load user session</p>
      </div>
    )
  }

  return <InventoryClient userId={user.id} />
}

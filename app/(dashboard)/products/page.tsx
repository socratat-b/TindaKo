import { getUser } from '@/lib/dal'
import ProductsClient from './products-client'

export default async function ProductsPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-destructive">Unable to load user session</p>
      </div>
    )
  }

  return <ProductsClient userId={user.id} />
}

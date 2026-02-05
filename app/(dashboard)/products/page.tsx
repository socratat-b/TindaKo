'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import ProductsClient from './products-client'

export default function ProductsPage() {
  const { userId } = useAuth()
  return <ProductsClient userId={userId || ''} />
}

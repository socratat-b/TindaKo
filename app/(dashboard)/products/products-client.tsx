'use client'

import dynamic from 'next/dynamic'

const ProductsInterface = dynamic(() => import('@/components/products/products-interface'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
      <p className="text-muted-foreground">Loading products...</p>
    </div>
  ),
})

interface ProductsClientProps {
  userId: string
}

export default function ProductsClient({ userId }: ProductsClientProps) {
  return <ProductsInterface userId={userId} />
}

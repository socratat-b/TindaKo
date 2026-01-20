'use client'

import { useState } from 'react'
import { useCart } from '@/lib/hooks/use-cart'
import { useSyncStore } from '@/lib/stores/sync-store'
import { processSale } from '@/lib/actions/pos'
import { ProductGrid } from './product-grid'
import { CartDisplay } from './cart-display'
import { CheckoutDialog } from './checkout-dialog'
import { BarcodeScanner } from './barcode-scanner'

interface POSInterfaceProps {
  userId: string
}

export default function POSInterface({ userId }: POSInterfaceProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const cart = useCart()
  const { setHasPendingChanges } = useSyncStore()

  const handleCheckout = async (amountPaid: number) => {
    try {
      await processSale({
        items: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discount,
        total: cart.total,
        amountPaid,
        paymentMethod: cart.paymentMethod,
        customerId: cart.customerId,
        userId,
      })

      // Mark that we have pending changes to sync
      setHasPendingChanges(true)
    } catch (error) {
      console.error('Checkout failed:', error)
      throw error
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Barcode Scanner */}
      <BarcodeScanner />

      {/* Main POS Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Product Grid - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 overflow-auto">
          <ProductGrid />
        </div>

        {/* Cart - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <CartDisplay onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onCheckout={handleCheckout}
      />
    </div>
  )
}

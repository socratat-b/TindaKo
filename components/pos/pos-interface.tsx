'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/hooks/use-cart'
import { useSettings } from '@/lib/hooks/use-settings'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useProductCartSync } from '@/lib/hooks/use-product-cart-sync'
import { processSale } from '@/lib/actions/pos'
import { ProductGrid } from './product-grid'
import { CartDisplay } from './cart-display'
import { CheckoutDialog } from './checkout-dialog'
import { BarcodeScanner } from './barcode-scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { POSInterfaceProps } from '@/lib/types'

export default function POSInterface({ userId }: POSInterfaceProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const { enableBarcodeScanner } = useSettings()
  const cart = useCart()
  const { setHasPendingChanges } = useSyncStore()

  // Sync cart with latest product data
  useProductCartSync()

  const handleCheckout = async (amountPaid: number, customerId: string | null) => {
    try {
      await processSale({
        items: cart.items,
        subtotal: cart.subtotal,
        discount: 0,
        total: cart.total,
        amountPaid,
        paymentMethod: cart.paymentMethod,
        customerId,
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
    <>
      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden lg:flex h-[calc(100vh-10rem)] flex-col gap-4 relative">
        {/* Subtle background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-amber-50/30 pointer-events-none rounded-lg -z-10" />
        {/* Barcode Scanner */}
        {enableBarcodeScanner && <BarcodeScanner />}

        {/* Main POS Layout */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {/* Product Grid - Takes 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="col-span-2 overflow-hidden"
          >
            <ProductGrid userId={userId} />
          </motion.div>

          {/* Cart - Takes 1 column on large screens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="col-span-1 overflow-hidden"
          >
            <CartDisplay onCheckout={() => setCheckoutOpen(true)} />
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout - Tabs */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-7.5rem)] overflow-hidden relative">
        {/* Subtle background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-amber-50/30 pointer-events-none rounded-lg -z-10" />
        {/* Barcode Scanner */}
        {enableBarcodeScanner && (
          <div className="flex-none mb-3">
            <BarcodeScanner />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
          >
            <TabsList className="grid w-full grid-cols-2 flex-none mb-2.5">
              <TabsTrigger value="products" className="text-sm">
                <Package className="h-4 w-4 mr-1.5" />
                Products
              </TabsTrigger>
              <TabsTrigger value="cart" className="text-sm">
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Cart
                {cart.items.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                    {cart.items.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="products" className="flex-1 overflow-hidden m-0">
            <ProductGrid userId={userId} />
          </TabsContent>

          <TabsContent value="cart" className="flex-1 overflow-hidden m-0">
            <CartDisplay
              onCheckout={() => {
                setCheckoutOpen(true)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onCheckout={handleCheckout}
        userId={userId}
      />
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/hooks/use-cart'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useProductCartSync } from '@/lib/hooks/use-product-cart-sync'
import { processSale } from '@/lib/actions/pos'
import { ProductGrid } from './product-grid'
import { CartDisplay } from './cart-display'
import { CheckoutDialog } from './checkout-dialog'
import { ShoppingCart, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { POSInterfaceProps } from '@/lib/types'

export default function POSInterface({ userId }: POSInterfaceProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
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
      <div className="hidden lg:flex h-[calc(100vh-10rem)] flex-col gap-4">
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

      {/* Mobile Layout - Custom Tabs with framer-motion */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-7.5rem)] overflow-hidden">
        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-none mb-2.5"
        >
          <div className="grid w-full grid-cols-2 bg-muted rounded-lg p-[3px] h-9">
            {(['products', 'cart'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-background rounded-md shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab === 'products' ? (
                    <Package className="h-4 w-4" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  {tab === 'products' ? 'Products' : 'Cart'}
                  {tab === 'cart' && cart.items.length > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-xs">
                      {cart.items.length}
                    </Badge>
                  )}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content - both stay mounted, animate opacity */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            animate={{ opacity: activeTab === 'products' ? 1 : 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute inset-0 overflow-hidden"
            style={{ pointerEvents: activeTab === 'products' ? 'auto' : 'none' }}
          >
            <ProductGrid userId={userId} />
          </motion.div>
          <motion.div
            animate={{ opacity: activeTab === 'cart' ? 1 : 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute inset-0 overflow-hidden"
            style={{ pointerEvents: activeTab === 'cart' ? 'auto' : 'none' }}
          >
            <CartDisplay
              onCheckout={() => {
                setCheckoutOpen(true)
              }}
            />
          </motion.div>
        </div>
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

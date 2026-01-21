'use client'

import { motion } from 'framer-motion'
import { useCart } from '@/lib/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react'

interface CartDisplayProps {
  onCheckout: () => void
}

export function CartDisplay({ onCheckout }: CartDisplayProps) {
  const {
    items,
    subtotal,
    total,
    paymentMethod,
    removeItem,
    updateQuantity,
    setPaymentMethod,
    clearCart,
  } = useCart()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const isEmpty = items.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-none p-2.5 border-b bg-card rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            <h2 className="text-base font-semibold">Cart</h2>
            {items.length > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {items.length}
              </Badge>
            )}
          </div>
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-destructive hover:text-destructive h-7 text-sm px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2.5 bg-card">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add products to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const remainingStock = item.stockQty - item.quantity
              const isLowStock = remainingStock <= 5 && remainingStock > 0

              return (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
                  className="p-2.5 border rounded-lg bg-background"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ₱{item.unitPrice.toFixed(2)} each
                      </p>
                      <p className={`text-xs mt-0.5 font-medium ${
                        remainingStock === 0
                          ? 'text-destructive'
                          : isLowStock
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      }`}>
                        {remainingStock === 0
                          ? 'Out of stock'
                          : `${remainingStock} more available`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stockQty}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-base font-bold">₱{item.total.toFixed(2)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart Footer - Fixed at bottom */}
      {!isEmpty && (
        <div className="flex-none p-2.5 border-t bg-card rounded-b-lg space-y-2.5">
          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">Total</span>
            <span className="text-2xl font-bold text-emerald-600">₱{total.toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <Button onClick={onCheckout} className="w-full h-11 text-base font-semibold">
            Checkout
          </Button>
        </div>
      )}
    </div>
  )
}

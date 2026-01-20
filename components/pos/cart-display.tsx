'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/hooks/use-cart'
import { db } from '@/lib/db'
import type { Customer } from '@/lib/db/schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingCart, Trash2, Minus, Plus, User } from 'lucide-react'

interface CartDisplayProps {
  onCheckout: () => void
}

export function CartDisplay({ onCheckout }: CartDisplayProps) {
  const {
    items,
    subtotal,
    discount,
    total,
    customerId,
    paymentMethod,
    removeItem,
    updateQuantity,
    setCustomer,
    setDiscount,
    setPaymentMethod,
    clearCart,
  } = useCart()

  const [customers, setCustomers] = useState<Customer[]>([])

  // Load customers from Dexie
  useEffect(() => {
    const loadCustomers = async () => {
      const allCustomers = await db.customers.toArray()
      const customersData = allCustomers
        .filter((c) => !c.isDeleted)
        .sort((a, b) => a.name.localeCompare(b.name))
      setCustomers(customersData)
    }

    loadCustomers()
  }, [])

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const isEmpty = items.length === 0

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-semibold">Cart</h2>
            {items.length > 0 && (
              <Badge variant="secondary">{items.length} items</Badge>
            )}
          </div>
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add products to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.productId} className="p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ₱{item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stockQty}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold">₱{item.total.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Cart Footer - Customer, Discount, Totals, Checkout */}
      {!isEmpty && (
        <div className="p-4 border-t space-y-3">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Customer (Optional)
            </label>
            <Select
              value={customerId || 'none'}
              onValueChange={(value) =>
                setCustomer(value === 'none' ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Walk-in Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.totalUtang > 0 && (
                      <span className="text-amber-600 ml-2">
                        (₱{customer.totalUtang.toFixed(2)} utang)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discount */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Discount</label>
            <Input
              type="number"
              min="0"
              max={subtotal}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-₱{discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600">₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button onClick={onCheckout} className="w-full" size="lg">
            Checkout
          </Button>
        </div>
      )}
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCart } from '@/lib/hooks/use-cart'
import { useFormatCurrency } from '@/lib/utils/currency'
import { db } from '@/lib/db'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle2, UserPlus, AlertCircle } from 'lucide-react'
import { QuickAddCustomerDialog } from './quick-add-customer-dialog'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: (amountPaid: number, customerId: string | null) => Promise<void>
  userId: string
}

export function CheckoutDialog({
  open,
  onOpenChange,
  onCheckout,
  userId,
}: CheckoutDialogProps) {
  const { total, paymentMethod, clearCart } = useCart()
  const formatCurrency = useFormatCurrency()
  const [amountPaid, setAmountPaid] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  // Fetch customers only on client side (fixes IndexedDB SSR error)
  const customers = useLiveQuery(
    () => {
      if (typeof window === 'undefined') return []
      return db.customers
        .where('userId')
        .equals(userId)
        .filter((c) => !c.isDeleted)
        .sortBy('name')
    },
    [userId]
  )

  const amountPaidNum = parseFloat(amountPaid) || 0
  const change = amountPaidNum - total
  const isUtangPayment = paymentMethod === 'utang'

  // Auto-fill amount for non-cash payments
  useEffect(() => {
    if (open) {
      if (paymentMethod === 'cash') {
        setAmountPaid('')
      } else if (paymentMethod === 'utang') {
        setAmountPaid('0')
      } else {
        setAmountPaid(total.toString())
      }
    }
  }, [paymentMethod, total, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate utang payment requires customer selection
    if (isUtangPayment && !selectedCustomerId) {
      setError('Please select a customer for utang payment')
      return
    }

    // Validate amount paid for cash
    if (paymentMethod === 'cash' && amountPaidNum < total) {
      setError('Amount paid must be at least the total amount')
      return
    }

    setIsProcessing(true)

    try {
      // For utang, amount paid is 0 (full debt)
      // For gcash/card, amount paid equals total
      // For cash, use entered amount
      const finalAmountPaid = isUtangPayment ? 0 : paymentMethod === 'cash' ? amountPaidNum : total

      await onCheckout(finalAmountPaid, selectedCustomerId || null)

      setIsSuccess(true)

      // Clear cart and close dialog after a short delay
      setTimeout(() => {
        clearCart()
        setIsSuccess(false)
        setAmountPaid('')
        setSelectedCustomerId('')
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sale')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isProcessing && !isSuccess) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setAmountPaid('')
        setSelectedCustomerId('')
        setError(null)
      }
    }
  }

  const handleCustomerCreated = (customerId: string) => {
    setSelectedCustomerId(customerId)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Complete Sale</DialogTitle>
            <DialogDescription className="text-sm">
              {isSuccess
                ? 'Sale completed successfully!'
                : 'Review and complete the transaction'}
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="h-14 w-14 text-emerald-600 mb-3" />
              <p className="text-lg font-semibold">Payment Successful!</p>
              <p className="text-sm text-muted-foreground">
                Receipt generated
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Sale Summary */}
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold text-base">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="secondary" className="capitalize text-xs h-5">
                    {paymentMethod}
                  </Badge>
                </div>
              </div>

              {/* Payment Input (Cash only) */}
              {paymentMethod === 'cash' && (
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="amountPaid" className="text-sm">Amount Paid</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      min={total}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={total.toFixed(2)}
                      required
                      autoFocus
                      className="h-11 text-base"
                    />
                  </div>

                  {amountPaidNum > 0 && (
                    <div
                      className={`p-3 rounded-lg ${
                        change >= 0
                          ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900'
                          : 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-900'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Change</span>
                        <span
                          className={`text-lg font-bold ${
                            change >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }`}
                        >
                          {formatCurrency(Math.max(0, change))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Selection (for Utang payment method) */}
              {isUtangPayment && (
                <div className="space-y-2 p-3 rounded-lg border-2 border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/50">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                        Utang Payment
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Customer will be charged {formatCurrency(total)} for utang
                      </p>
                    </div>
                  </div>

                  <Label htmlFor="customerId" className="text-sm font-semibold">
                    Select Customer *
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCustomerId}
                      onValueChange={setSelectedCustomerId}
                      required
                    >
                      <SelectTrigger className="flex-1 h-10 text-sm">
                        <SelectValue placeholder="Choose customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers && customers.length > 0 ? (
                          customers.map((customer) => (
                            <SelectItem
                              key={customer.id}
                              value={customer.id}
                              className="text-sm"
                            >
                              {customer.name}
                              {customer.phone && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({customer.phone})
                                </span>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-center text-muted-foreground">
                            No customers yet. Click + to add.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsQuickAddOpen(true)}
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isProcessing}
                  className="flex-1 h-11 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isProcessing ||
                    (paymentMethod === 'cash' && amountPaidNum < total) ||
                    (isUtangPayment && !selectedCustomerId)
                  }
                  className="flex-1 h-11 text-sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Sale'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Add Customer Dialog */}
      <QuickAddCustomerDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        userId={userId}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  )
}

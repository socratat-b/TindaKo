'use client'

import { useState } from 'react'
import { useCart } from '@/lib/hooks/use-cart'
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
import { Loader2, CheckCircle2 } from 'lucide-react'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: (amountPaid: number) => Promise<void>
}

export function CheckoutDialog({
  open,
  onOpenChange,
  onCheckout,
}: CheckoutDialogProps) {
  const { total, paymentMethod, clearCart } = useCart()
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountPaidNum = parseFloat(amountPaid) || 0
  const change = amountPaidNum - total

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate amount paid for cash
    if (paymentMethod === 'cash' && amountPaidNum < total) {
      setError('Amount paid must be at least the total amount')
      return
    }

    setIsProcessing(true)

    try {
      // For non-cash payments, amount paid equals total
      const finalAmountPaid =
        paymentMethod === 'cash' ? amountPaidNum : total

      await onCheckout(finalAmountPaid)

      setIsSuccess(true)

      // Clear cart and close dialog after a short delay
      setTimeout(() => {
        clearCart()
        setIsSuccess(false)
        setAmountPaid('')
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
        setError(null)
      }
    }
  }

  return (
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
                <span className="font-semibold text-base">₱{total.toFixed(2)}</span>
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
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Change</span>
                      <span
                        className={`text-lg font-bold ${
                          change >= 0 ? 'text-emerald-600' : 'text-destructive'
                        }`}
                      >
                        ₱{Math.max(0, change).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

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
                  (paymentMethod === 'cash' && amountPaidNum < total)
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
  )
}

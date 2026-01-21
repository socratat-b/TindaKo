'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Phone } from 'lucide-react'
import type { Customer } from '@/lib/db/schema'
import { recordPayment } from '@/lib/utils/utang-utils'
import { useSyncStore } from '@/lib/stores/sync-store'

type PaymentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  customers: Customer[]
  selectedCustomerId?: string | null
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  userId,
  customers,
  selectedCustomerId,
}: PaymentFormDialogProps) {
  const [customerId, setCustomerId] = useState(selectedCustomerId || '')
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setHasPendingChanges = useSyncStore((state) => state.setHasPendingChanges)

  // Update customerId when selectedCustomerId prop changes
  useEffect(() => {
    if (selectedCustomerId) {
      setCustomerId(selectedCustomerId)
    }
  }, [selectedCustomerId])

  const selectedCustomer = customers.find((c) => c.id === customerId)
  const currentBalance = selectedCustomer?.totalUtang || 0

  // Auto-fill amount when payment type changes to full
  useEffect(() => {
    if (paymentType === 'full' && currentBalance > 0) {
      setAmount(currentBalance.toFixed(2))
    } else if (paymentType === 'partial') {
      setAmount('')
    }
  }, [paymentType, currentBalance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await recordPayment({
        userId,
        customerId,
        amount: parseFloat(amount),
        notes: notes || undefined,
      })

      if (result.success) {
        setHasPendingChanges(true)
        setCustomerId('')
        setPaymentType('partial')
        setAmount('')
        setNotes('')
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to record payment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate new balance preview
  const amountNum = parseFloat(amount) || 0
  const newBalance = currentBalance - amountNum

  // Validation: check if payment exceeds balance
  const exceedsBalance = amountNum > currentBalance
  const isValidAmount = amountNum > 0 && !exceedsBalance

  // Filter customers with debt for the dropdown
  const customersWithDebt = customers.filter((c) => c.totalUtang > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Record Payment</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Record a customer payment to reduce their balance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customerId" className="text-xs md:text-sm">
              Customer *
            </Label>
            <Select value={customerId} onValueChange={setCustomerId} required>
              <SelectTrigger className="h-9 text-xs md:h-10 md:text-sm">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="w-[calc(100vw-2rem)] md:w-full">
                {customersWithDebt.length === 0 ? (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    No customers with outstanding balances
                  </div>
                ) : (
                  customersWithDebt.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.id}
                      className="text-xs md:text-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-medium">{customer.name}</span>
                          {customer.phone && (
                            <span className="ml-2 text-[10px] text-muted-foreground">
                              {customer.phone}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-destructive">
                          ₱{customer.totalUtang.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedCustomer && (
              <motion.div
                className="rounded-md bg-muted p-2 text-[10px] md:text-xs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedCustomer.phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-semibold text-destructive">
                    ₱{currentBalance.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Payment Type Selection */}
          {selectedCustomer && (
            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Payment Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentType === 'partial' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('partial')}
                  className="h-9 text-xs md:h-10 md:text-sm"
                >
                  Partial Payment
                </Button>
                <Button
                  type="button"
                  variant={paymentType === 'full' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('full')}
                  className="h-9 text-xs md:h-10 md:text-sm"
                >
                  Full Payment
                </Button>
              </div>
              {paymentType === 'full' && (
                <motion.p
                  className="text-[10px] text-muted-foreground md:text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Full balance of ₱{currentBalance.toFixed(2)} will be paid
                </motion.p>
              )}
            </div>
          )}

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs md:text-sm">
              Payment Amount *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                max={currentBalance}
                required
                disabled={!customerId || paymentType === 'full'}
                readOnly={paymentType === 'full'}
                className={`h-9 pl-9 text-xs md:h-10 md:text-sm ${
                  exceedsBalance && amount ? 'border-destructive' : ''
                } ${paymentType === 'full' ? 'bg-muted cursor-not-allowed' : ''}`}
                placeholder={paymentType === 'full' ? 'Auto-filled' : '0.00'}
              />
            </div>
            {exceedsBalance && amount && (
              <motion.p
                className="text-[10px] text-destructive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Payment cannot exceed current balance of ₱{currentBalance.toFixed(2)}
              </motion.p>
            )}
            {isValidAmount && (
              <motion.div
                className="rounded-md bg-green-50 p-2 text-[10px] dark:bg-green-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Balance:</span>
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    ₱{newBalance.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs md:text-sm">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-xs md:text-sm"
              placeholder="Add notes about this payment..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="rounded-md bg-destructive/10 p-2 text-xs text-destructive md:p-3 md:text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !customerId || !isValidAmount}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

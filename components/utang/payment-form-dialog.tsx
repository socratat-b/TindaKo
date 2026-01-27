'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useFormattedNumberInput } from '@/lib/hooks/use-formatted-input'
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
import { useFormatCurrency } from '@/lib/utils/currency'

type PaymentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  storePhone: string
  customers: Customer[]
  selectedCustomerId?: string | null
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  storePhone,
  customers,
  selectedCustomerId,
}: PaymentFormDialogProps) {
  const formatCurrency = useFormatCurrency()
  const [customerId, setCustomerId] = useState(selectedCustomerId || '')
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial')
  const formattedAmount = useFormattedNumberInput('')
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
      formattedAmount.setValue(currentBalance)
    } else if (paymentType === 'partial') {
      formattedAmount.reset()
    }
  }, [paymentType, currentBalance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await recordPayment({
        storePhone,
        customerId,
        amount: parseFloat(formattedAmount.rawValue),
        notes: notes || undefined,
      })

      if (result.success) {
        setHasPendingChanges(true)

        // Success toast
        const formattedAmountValue = new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
        }).format(parseFloat(formattedAmount.rawValue))

        toast.success('Payment recorded', {
          description: `${formattedAmountValue} payment recorded for ${selectedCustomer?.name}`,
          duration: 3000,
        })

        setCustomerId('')
        setPaymentType('partial')
        formattedAmount.reset()
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
  const amountNum = parseFloat(formattedAmount.rawValue) || 0
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

          {/* Customer Selection - Read-only if pre-selected, dropdown if not */}
          <div className="space-y-2">
            <Label htmlFor="customerId" className="text-xs md:text-sm">
              Customer *
            </Label>

            {selectedCustomerId ? (
              // Read-only customer display when pre-selected
              <motion.div
                className="w-full rounded-lg border-2 border-primary/20 bg-primary/5 p-5 md:p-6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground md:text-sm mb-1">
                          Customer
                        </p>
                        <p className="font-bold text-lg md:text-xl">{selectedCustomer?.name}</p>
                      </div>
                      {selectedCustomer?.phone && (
                        <div>
                          <p className="text-xs text-muted-foreground md:text-sm mb-1">
                            Phone
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium text-base md:text-lg">
                              {selectedCustomer.phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground md:text-sm mb-1">
                        Current Balance
                      </p>
                      <p className="text-2xl font-bold text-destructive md:text-3xl">
                        {formatCurrency(currentBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Dropdown selector when no customer pre-selected
              <>
                <Select value={customerId} onValueChange={setCustomerId} required>
                  <SelectTrigger className="h-9 w-full text-xs md:h-10 md:text-sm">
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
                              {formatCurrency(customer.totalUtang)}
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
                        {formatCurrency(currentBalance)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </>
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
                  Full balance of {formatCurrency(currentBalance)} will be paid
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
                type="text"
                inputMode="decimal"
                id="amount"
                value={formattedAmount.displayValue}
                onChange={formattedAmount.handleChange}
                onBlur={formattedAmount.handleBlur}
                required
                disabled={!customerId || paymentType === 'full'}
                readOnly={paymentType === 'full'}
                className={`h-9 pl-9 text-xs md:h-10 md:text-sm ${
                  exceedsBalance && formattedAmount.rawValue ? 'border-destructive' : ''
                } ${paymentType === 'full' ? 'bg-muted cursor-not-allowed' : ''}`}
                placeholder={paymentType === 'full' ? 'Auto-filled' : '0.00'}
              />
            </div>
            {exceedsBalance && formattedAmount.rawValue && (
              <motion.p
                className="text-[10px] text-destructive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Payment cannot exceed current balance of {formatCurrency(currentBalance)}
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
                    {formatCurrency(newBalance)}
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

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
import { Plus, Phone } from 'lucide-react'
import type { Customer } from '@/lib/db/schema'
import { recordManualCharge } from '@/lib/utils/utang-utils'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useFormatCurrency } from '@/lib/utils/currency'

type ChargeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  storePhone: string
  customers: Customer[]
  selectedCustomerId?: string | null
}

export function ChargeFormDialog({
  open,
  onOpenChange,
  storePhone,
  customers,
  selectedCustomerId,
}: ChargeFormDialogProps) {
  const formatCurrency = useFormatCurrency()
  const [customerId, setCustomerId] = useState(selectedCustomerId || '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await recordManualCharge({
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

        toast.success('Charge added', {
          description: `${formattedAmountValue} charge added to ${selectedCustomer?.name}`,
          duration: 3000,
        })

        setCustomerId('')
        formattedAmount.reset()
        setNotes('')
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to add charge')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charge')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCustomer = customers.find((c) => c.id === customerId)
  const currentBalance = selectedCustomer?.totalUtang || 0

  // Calculate new balance preview
  const amountNum = parseFloat(formattedAmount.rawValue) || 0
  const newBalance = currentBalance + amountNum

  const isValidAmount = amountNum > 0
  const isValidNotes = notes.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Add Manual Charge</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Add a charge to a customer&apos;s account outside of a sale
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
                      <p className={`text-2xl font-bold md:text-3xl ${
                        currentBalance > 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
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
                    {customers.length === 0 ? (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        No customers available
                      </div>
                    ) : (
                      customers.map((customer) => (
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
                            <span
                              className={`text-xs font-semibold ${
                                customer.totalUtang > 0
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            >
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
                      <span
                        className={`font-semibold ${
                          currentBalance > 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
                        {formatCurrency(currentBalance)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Charge Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs md:text-sm">
              Charge Amount *
            </Label>
            <div className="relative">
              <Plus className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                inputMode="decimal"
                id="amount"
                value={formattedAmount.displayValue}
                onChange={formattedAmount.handleChange}
                onBlur={formattedAmount.handleBlur}
                required
                disabled={!customerId}
                className="h-9 pl-9 text-xs md:h-10 md:text-sm"
                placeholder="0.00"
              />
            </div>
            {isValidAmount && (
              <motion.div
                className="rounded-md bg-red-50 p-2 text-[10px] dark:bg-red-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Balance:</span>
                  <span className="font-semibold text-destructive">
                    {formatCurrency(newBalance)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Notes (Required for manual charges) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs md:text-sm">
              Reason for Charge *
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              required
              className="resize-none text-xs md:text-sm"
              placeholder="Explain the reason for this charge (e.g., 'Previous unpaid debt from last month')"
            />
            <p className="text-[10px] text-muted-foreground">
              Notes are required for manual charges to maintain a clear audit trail
            </p>
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
              disabled={isLoading || !customerId || !isValidAmount || !isValidNotes}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              {isLoading ? 'Adding...' : 'Add Charge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

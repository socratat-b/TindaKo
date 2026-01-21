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
import { UserPlus, UserCog } from 'lucide-react'
import type { Customer } from '@/lib/db/schema'
import { createCustomer, updateCustomer } from '@/lib/utils/customer-utils'
import { useSyncStore } from '@/lib/stores/sync-store'

type CustomerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  customer?: Customer | null // If provided, we're editing
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  userId,
  customer,
}: CustomerFormDialogProps) {
  const isEditing = !!customer
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setHasPendingChanges = useSyncStore((state) => state.setHasPendingChanges)

  // Set initial values when editing
  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setPhone(customer.phone || '')
      setAddress(customer.address || '')
    } else {
      setName('')
      setPhone('')
      setAddress('')
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = isEditing
        ? await updateCustomer({ id: customer.id, name, phone, address })
        : await createCustomer({ userId, name, phone, address })

      if (result.success) {
        setHasPendingChanges(true)
        setName('')
        setPhone('')
        setAddress('')
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to save customer')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            {isEditing ? (
              <>
                <UserCog className="h-5 w-5" />
                Edit Customer
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Add New Customer
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {isEditing
              ? 'Update customer information'
              : 'Create a new customer record for utang tracking'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs md:text-sm">
              Customer Name *
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="h-9 text-xs md:h-10 md:text-sm"
              placeholder="e.g., Juan Dela Cruz"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs md:text-sm">
              Phone Number (Optional)
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 text-xs md:h-10 md:text-sm"
              placeholder="e.g., 09171234567"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs md:text-sm">
              Address (Optional)
            </Label>
            <Textarea
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-[60px] text-xs md:min-h-[80px] md:text-sm resize-none"
              placeholder="e.g., 123 Main St, Barangay Centro"
              rows={2}
            />
          </div>

          {/* Current Balance (if editing) */}
          {isEditing && customer && (
            <motion.div
              className="rounded-md bg-muted p-2 text-[10px] md:text-xs"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Balance:</span>
                <span
                  className={`font-semibold ${
                    customer.totalUtang > 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  ₱{customer.totalUtang.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Balance cannot be edited here. Use payment/charge functions.
              </p>
            </motion.div>
          )}

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
              disabled={isLoading || !name.trim()}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              {isLoading
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Customer'
                  : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

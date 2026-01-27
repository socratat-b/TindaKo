'use client'

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
import { UserPlus } from 'lucide-react'
import { useQuickAddCustomer } from '@/lib/hooks/use-quick-add-customer'
import type { QuickAddCustomerDialogProps } from '@/lib/types'

export function QuickAddCustomerDialog({
  open,
  onOpenChange,
  storePhone,
  onCustomerCreated,
}: QuickAddCustomerDialogProps) {
  const {
    formData,
    error,
    isLoading,
    setFormData,
    handleSubmit,
  } = useQuickAddCustomer({
    open,
    onOpenChange,
    storePhone,
    onCustomerCreated,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <UserPlus className="h-5 w-5" />
            Quick Add Customer
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Create a new customer record for utang tracking
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
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
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
              value={formData.phone}
              onChange={(e) => setFormData({ phone: e.target.value })}
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
              value={formData.address}
              onChange={(e) => setFormData({ address: e.target.value })}
              className="min-h-[60px] text-xs md:min-h-[80px] md:text-sm resize-none"
              placeholder="e.g., 123 Main St, Barangay Centro"
              rows={2}
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
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              {isLoading ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

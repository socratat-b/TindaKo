'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserPlus, DollarSign, Plus } from 'lucide-react'

type UtangActionType = 'customer' | 'payment' | 'charge'

type UtangActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAction: (action: UtangActionType) => void
}

export function UtangActionDialog({
  open,
  onOpenChange,
  onSelectAction,
}: UtangActionDialogProps) {
  const [selectedAction, setSelectedAction] = useState<UtangActionType>('customer')

  const handleContinue = () => {
    onSelectAction(selectedAction)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Manage Utang</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Choose an action to manage customer credit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Type Selection */}
          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
              <input
                type="radio"
                name="action"
                value="customer"
                checked={selectedAction === 'customer'}
                onChange={(e) => setSelectedAction(e.target.value as UtangActionType)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium md:text-sm">Add Customer</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
                  Create a new customer account for utang tracking
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
              <input
                type="radio"
                name="action"
                value="payment"
                checked={selectedAction === 'payment'}
                onChange={(e) => setSelectedAction(e.target.value as UtangActionType)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium md:text-sm">Record Payment</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
                  Record a customer payment to reduce their balance
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
              <input
                type="radio"
                name="action"
                value="charge"
                checked={selectedAction === 'charge'}
                onChange={(e) => setSelectedAction(e.target.value as UtangActionType)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium md:text-sm">Add Charge</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">
                  Add a manual charge to a customer&apos;s account
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              className="flex-1 h-9 text-xs md:h-10 md:text-sm"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

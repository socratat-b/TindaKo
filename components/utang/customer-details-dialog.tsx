'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Phone, User, MapPin } from 'lucide-react'
import { db } from '@/lib/db'
import { UtangTransactionsList } from './utang-transactions-list'

type CustomerDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customerId,
}: CustomerDetailsDialogProps) {
  // Fetch customer
  const customer = useLiveQuery(
    () => db.customers.get(customerId),
    [customerId]
  )

  // Fetch customer's transactions
  const transactions = useLiveQuery(
    () =>
      db.utangTransactions
        .where('customerId')
        .equals(customerId)
        .filter((t) => !t.isDeleted)
        .reverse()
        .sortBy('createdAt'),
    [customerId]
  )

  if (!customer) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info Card */}
          <div className="rounded-lg border bg-muted/50 p-3 md:p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold md:text-base">
                    {customer.name}
                  </h3>
                </div>
                {customer.phone && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.phone}
                  </div>
                )}
                {customer.address && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {customer.address}
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-[10px] text-muted-foreground md:text-xs">
                  Current Balance
                </p>
                <p
                  className={`text-xl font-bold md:text-2xl ${
                    customer.totalUtang > 0
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  ₱{customer.totalUtang.toFixed(2)}
                </p>
                {customer.totalUtang > 0 ? (
                  <Badge
                    variant="outline"
                    className="mt-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-[9px] md:text-[10px]"
                  >
                    Outstanding
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="mt-1 text-[9px] md:text-[10px]"
                  >
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 className="mb-3 text-sm font-semibold md:text-base">
              Transaction History
            </h4>
            <div className="max-h-[400px] overflow-y-auto rounded-lg border">
              <div className="p-3 md:p-4">
                <UtangTransactionsList
                  transactions={transactions || []}
                  customers={[customer]}
                  customerId={customerId}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

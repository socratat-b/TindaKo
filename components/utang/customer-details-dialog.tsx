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
import { useFormatCurrency } from '@/lib/utils/currency'

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
  const formatCurrency = useFormatCurrency()

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
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[95vh] flex flex-col gap-4 p-4 md:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl">Customer Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
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
                  {formatCurrency(customer.totalUtang)}
                </p>
                {customer.totalUtang > 0 ? (
                  <Badge
                    variant="outline"
                    className="mt-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-[9px] md:text-[10px]"
                  >
                    May Utang
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="mt-1 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 text-[9px] md:text-[10px]"
                  >
                    Walang Utang
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <h4 className="mb-3 text-sm font-semibold md:text-base">
              Transaction History
            </h4>
            <div className="flex-1 rounded-lg border bg-background overflow-hidden">
              <div className="h-full overflow-y-auto p-3 md:p-4">
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

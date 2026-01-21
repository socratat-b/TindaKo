'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { Receipt, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react'
import type { UtangTransaction, Customer } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { db } from '@/lib/db'

type UtangTransactionsListProps = {
  transactions: UtangTransaction[]
  customers: Customer[]
  customerId?: string // Optional filter by customer
}

const TransactionTypeIcon = ({ type }: { type: 'charge' | 'payment' }) => {
  return type === 'payment' ? (
    <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
  ) : (
    <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
  )
}

const TransactionTypeBadge = ({ type }: { type: 'charge' | 'payment' }) => {
  return type === 'payment' ? (
    <Badge
      variant="outline"
      className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 text-[9px] md:text-[10px]"
    >
      Payment
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-[9px] md:text-[10px]"
    >
      Utang
    </Badge>
  )
}

export function UtangTransactionsList({
  transactions,
  customers,
  customerId,
}: UtangTransactionsListProps) {
  // Fetch all sales to get product details
  const sales = useLiveQuery(
    () => {
      if (typeof window === 'undefined') return []
      return db.sales
        .filter((s) => !s.isDeleted)
        .toArray()
    },
    []
  )

  // Filter by customer if customerId is provided
  const filteredTransactions = customerId
    ? transactions.filter((t) => t.customerId === customerId)
    : transactions

  if (!filteredTransactions || filteredTransactions.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Receipt className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      </motion.div>
    )
  }

  // Get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name || 'Unknown Customer'
  }

  // Get sale details (products)
  const getSaleDetails = (saleId: string | null) => {
    if (!saleId || !sales) return null
    const sale = sales.find((s) => s.id === saleId)
    return sale
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                {!customerId && <TableHead>Customer</TableHead>}
                <TableHead className="w-[120px] text-right">Amount</TableHead>
                <TableHead className="w-[120px] text-right">Balance After</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => {
                const sale = getSaleDetails(transaction.saleId)

                return (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TransactionTypeIcon type={transaction.type} />
                        <TransactionTypeBadge type={transaction.type} />
                      </div>
                    </TableCell>
                    {!customerId && (
                      <TableCell>
                        <p className="text-sm font-medium">
                          {getCustomerName(transaction.customerId)}
                        </p>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === 'payment'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'payment' ? '-' : '+'}₱
                        {transaction.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm">₱{transaction.balanceAfter.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      {transaction.type === 'payment' ? (
                        <p className="text-sm text-muted-foreground italic">Payment received</p>
                      ) : sale ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>{sale.items.length} item{sale.items.length > 1 ? 's' : ''}</span>
                          </div>
                          {sale.items.map((item, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium">{item.quantity}x</span>{' '}
                              <span className="text-muted-foreground">{item.productName}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Manual charge</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'h:mm a')}
                      </p>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-2 md:hidden">
        {filteredTransactions.map((transaction, index) => {
          const sale = getSaleDetails(transaction.saleId)

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <TransactionTypeIcon type={transaction.type} />
                    <div className="flex-1">
                      {!customerId && (
                        <p className="text-xs font-semibold">
                          {getCustomerName(transaction.customerId)}
                        </p>
                      )}
                      <TransactionTypeBadge type={transaction.type} />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-sm font-bold ${
                        transaction.type === 'payment'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'payment' ? '-' : '+'}₱
                      {transaction.amount.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Bal: ₱{transaction.balanceAfter.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Products */}
                {transaction.type === 'charge' && sale && (
                  <div className="mt-2 border-t pt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <ShoppingBag className="h-3 w-3" />
                      <span>{sale.items.length} item{sale.items.length > 1 ? 's' : ''} bought</span>
                    </div>
                    <div className="space-y-0.5">
                      {sale.items.map((item, i) => (
                        <div key={i} className="text-[11px]">
                          <span className="font-semibold">{item.quantity}x</span>{' '}
                          <span className="text-muted-foreground">{item.productName}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">
                            (₱{item.unitPrice.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <p className="text-[9px] text-muted-foreground">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {format(new Date(transaction.createdAt), 'h:mm a')}
                  </p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

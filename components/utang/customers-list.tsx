'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Users, DollarSign, Phone, Eye, MapPin } from 'lucide-react'
import type { Customer } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomerDetailsDialog } from './customer-details-dialog'
import { useFormatCurrency } from '@/lib/utils/currency'

type CustomersListProps = {
  customers: Customer[]
  onRecordPayment: (customerId: string) => void
  onAddCharge: (customerId: string) => void
}

export function CustomersList({
  customers,
  onRecordPayment,
  onAddCharge,
}: CustomersListProps) {
  const formatCurrency = useFormatCurrency()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleViewHistory = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setIsDetailsDialogOpen(true)
  }

  if (!customers || customers.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Users className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No customers found.</p>
      </motion.div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[120px] text-right">Balance</TableHead>
                <TableHead className="w-[120px]">Last Updated</TableHead>
                <TableHead className="w-[220px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group"
                >
                  <TableCell>
                    <p className="font-medium text-sm">{customer.name}</p>
                  </TableCell>
                  <TableCell>
                    {customer.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.address ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-2 max-w-[200px]">{customer.address}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        customer.totalUtang > 0
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatCurrency(customer.totalUtang)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(customer.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(customer.id)}
                        className="h-8 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        History
                      </Button>
                      {customer.totalUtang > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRecordPayment(customer.id)}
                          className="h-8 text-xs"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Pay
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddCharge(customer.id)}
                        className="h-8 text-xs"
                      >
                        Charge
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-2 md:hidden">
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-bold md:text-sm">{customer.name}</p>
                  {customer.phone && (
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.address && (
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{customer.address}</span>
                    </div>
                  )}
                  <p className="mt-1 text-[9px] text-muted-foreground md:text-[10px]">
                    Updated {format(new Date(customer.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    Balance
                  </p>
                  <p
                    className={`text-lg font-bold md:text-xl ${
                      customer.totalUtang > 0
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatCurrency(customer.totalUtang)}
                  </p>
                  {customer.totalUtang > 0 && (
                    <Badge
                      variant="outline"
                      className="mt-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-[9px] md:text-[10px]"
                    >
                      Outstanding
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-1.5 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewHistory(customer.id)}
                  className="h-8 flex-1 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  History
                </Button>
                {customer.totalUtang > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRecordPayment(customer.id)}
                    className="h-8 flex-1 text-xs"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Pay
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddCharge(customer.id)}
                  className="h-8 flex-1 text-xs"
                >
                  Charge
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Customer Details Dialog */}
      {selectedCustomerId && (
        <CustomerDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          customerId={selectedCustomerId}
        />
      )}
    </>
  )
}

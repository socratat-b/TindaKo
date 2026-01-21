'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, DollarSign, Users, UserPlus } from 'lucide-react'
import { CustomersList } from './customers-list'
import { UtangTransactionsList } from './utang-transactions-list'
import { PaymentFormDialog } from './payment-form-dialog'
import { ChargeFormDialog } from './charge-form-dialog'
import { CustomerFormDialog } from './customer-form-dialog'
import { useSyncStore } from '@/lib/stores/sync-store'

type UtangInterfaceProps = {
  userId: string
}

export default function UtangInterface({ userId }: UtangInterfaceProps) {
  const [activeTab, setActiveTab] = useState('customers')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false)
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const hasPendingChanges = useSyncStore((state) => state.hasPendingChanges)

  // Fetch all customers
  const customers = useLiveQuery(
    () =>
      db.customers
        .where('userId')
        .equals(userId)
        .filter((c) => !c.isDeleted)
        .sortBy('name'),
    [userId]
  )

  // Fetch all transactions
  const transactions = useLiveQuery(
    () =>
      db.utangTransactions
        .where('userId')
        .equals(userId)
        .filter((t) => !t.isDeleted)
        .reverse()
        .sortBy('createdAt'),
    [userId]
  )

  // Filter customers based on search
  const filteredCustomers = customers?.filter((customer) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    )
  })

  // Outstanding customers (balance > 0)
  const outstandingCustomers = filteredCustomers?.filter((c) => c.totalUtang > 0) || []

  // Calculate stats
  const totalOutstanding =
    customers?.reduce((sum, c) => sum + c.totalUtang, 0) || 0
  const customersWithDebt = customers?.filter((c) => c.totalUtang > 0).length || 0

  // Open payment dialog with selected customer
  const handleRecordPayment = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId)
    }
    setIsPaymentDialogOpen(true)
  }

  // Open charge dialog with selected customer
  const handleAddCharge = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId)
    }
    setIsChargeDialogOpen(true)
  }

  return (
    <motion.div
      className="flex h-full flex-col gap-3 p-3 md:gap-6 md:p-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Utang Management</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Track customer credit and manage payments
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsCustomerFormOpen(true)}
            variant="outline"
            className="h-9 flex-1 gap-2 text-xs md:h-10 md:flex-none md:text-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Customer</span>
          </Button>
          <Button
            onClick={() => handleRecordPayment()}
            variant="outline"
            className="h-9 flex-1 gap-2 text-xs md:h-10 md:flex-none md:text-sm"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Record Payment</span>
            <span className="sm:hidden">Payment</span>
          </Button>
          <Button
            onClick={() => handleAddCharge()}
            className="h-9 flex-1 gap-2 text-xs md:h-10 md:flex-none md:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Charge</span>
            <span className="sm:hidden">Charge</span>
          </Button>
        </div>
      </div>

      {/* Pending Changes Indicator */}
      {hasPendingChanges && (
        <motion.div
          className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-800 md:p-3 md:text-sm dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          You have unsynced changes. Click &quot;Backup to cloud&quot; to sync.
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground md:text-xs">
                Total Outstanding
              </p>
              <p className="text-lg font-bold text-destructive md:text-xl">
                ₱{totalOutstanding.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground md:text-xs">
                Customers with Debt
              </p>
              <p className="text-lg font-bold md:text-xl">{customersWithDebt}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search customers by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-xs md:h-10 md:text-sm"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers" className="text-xs md:text-sm">
            All Customers
          </TabsTrigger>
          <TabsTrigger value="outstanding" className="relative text-xs md:text-sm">
            Outstanding
            {customersWithDebt > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-semibold text-destructive-foreground md:text-[10px]">
                {customersWithDebt}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs md:text-sm">
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-3 md:mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">All Customers</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  View and manage all customer credit accounts
                </p>
              </div>

              <CustomersList
                customers={filteredCustomers || []}
                onRecordPayment={handleRecordPayment}
                onAddCharge={handleAddCharge}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="mt-3 md:mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">
                  Outstanding Balances
                </h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  Customers with unpaid balances
                </p>
              </div>

              <CustomersList
                customers={outstandingCustomers}
                onRecordPayment={handleRecordPayment}
                onAddCharge={handleAddCharge}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-3 md:mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold md:text-lg">
                  Transaction History
                </h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  All charges and payments recorded
                </p>
              </div>

              <UtangTransactionsList
                transactions={transactions || []}
                customers={customers || []}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Form Dialog */}
      <PaymentFormDialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open)
          if (!open) setSelectedCustomerId(null)
        }}
        userId={userId}
        customers={customers || []}
        selectedCustomerId={selectedCustomerId}
      />

      {/* Charge Form Dialog */}
      <ChargeFormDialog
        open={isChargeDialogOpen}
        onOpenChange={(open) => {
          setIsChargeDialogOpen(open)
          if (!open) setSelectedCustomerId(null)
        }}
        userId={userId}
        customers={customers || []}
        selectedCustomerId={selectedCustomerId}
      />

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        open={isCustomerFormOpen}
        onOpenChange={setIsCustomerFormOpen}
        userId={userId}
      />
    </motion.div>
  )
}

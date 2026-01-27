'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, DollarSign, Users } from 'lucide-react'
import { CustomersList } from './customers-list'
import { PaymentFormDialog } from './payment-form-dialog'
import { ChargeFormDialog } from './charge-form-dialog'
import { CustomerFormDialog } from './customer-form-dialog'
import { UtangActionDialog } from './utang-action-dialog'
import { useFormatCurrency } from '@/lib/utils/currency'
import { useUtang } from '@/lib/hooks/use-utang'
import type { UtangInterfaceProps } from '@/lib/types/utang'

export default function UtangInterface({ storePhone }: UtangInterfaceProps) {
  const formatCurrency = useFormatCurrency()
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)

  // Use the custom hook for all logic
  const {
    customers,
    outstandingCustomers,
    totalOutstanding,
    customersWithDebt,
    searchQuery,
    isPaymentDialogOpen,
    isChargeDialogOpen,
    isCustomerFormOpen,
    selectedCustomerId,
    currentPage,
    itemsPerPage,
    setSearchQuery,
    setIsPaymentDialogOpen,
    setIsChargeDialogOpen,
    setIsCustomerFormOpen,
    setCurrentPage,
    handleRecordPayment,
    handleAddCharge,
    handleOpenCustomerForm,
  } = useUtang({ storePhone })

  const handleActionSelect = (action: 'customer' | 'payment' | 'charge') => {
    if (action === 'customer') {
      handleOpenCustomerForm()
    } else if (action === 'payment') {
      handleRecordPayment()
    } else if (action === 'charge') {
      handleAddCharge()
    }
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

        <Button
          onClick={() => setIsActionDialogOpen(true)}
          className="h-9 gap-2 text-xs md:h-10 md:text-sm"
        >
          <Plus className="h-4 w-4" />
          Manage Utang
        </Button>
      </div>


      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground md:text-xs">
                Total Utang
              </p>
              <p className="text-lg font-bold text-destructive md:text-xl">
                {formatCurrency(totalOutstanding)}
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
                Customers with Utang
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

      {/* Outstanding Customers List */}
      <Card className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold md:text-lg">
                All Customers
              </h2>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Manage customer accounts and track balances
              </p>
            </div>
            {customersWithDebt > 0 && (
              <div className="rounded-full bg-destructive px-3 py-1">
                <span className="text-sm font-semibold text-destructive-foreground">
                  {customersWithDebt}
                </span>
              </div>
            )}
          </div>

          <CustomersList
            customers={outstandingCustomers}
            onRecordPayment={handleRecordPayment}
            onAddCharge={handleAddCharge}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Utang Action Dialog */}
      <UtangActionDialog
        open={isActionDialogOpen}
        onOpenChange={setIsActionDialogOpen}
        onSelectAction={handleActionSelect}
      />

      {/* Payment Form Dialog */}
      <PaymentFormDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        storePhone={storePhone}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
      />

      {/* Charge Form Dialog */}
      <ChargeFormDialog
        open={isChargeDialogOpen}
        onOpenChange={setIsChargeDialogOpen}
        storePhone={storePhone}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
      />

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        open={isCustomerFormOpen}
        onOpenChange={setIsCustomerFormOpen}
        storePhone={storePhone}
      />
    </motion.div>
  )
}

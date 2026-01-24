'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  Package,
} from 'lucide-react'
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
import { Pagination } from '@/components/ui/pagination'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { InventoryMovementsListProps } from '@/lib/types'
import type { InventoryMovement } from '@/lib/db/schema'

const MovementTypeIcon = ({ type }: { type: 'in' | 'out' | 'adjust' }) => {
  switch (type) {
    case 'in':
      return <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
    case 'out':
      return <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
    case 'adjust':
      return <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  }
}

const MovementTypeBadge = ({ type }: { type: 'in' | 'out' | 'adjust' }) => {
  const variants = {
    in: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    out: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    adjust: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  }

  const labels = {
    in: 'Stock In',
    out: 'Stock Out',
    adjust: 'Adjustment',
  }

  return (
    <Badge variant="outline" className={`text-[9px] md:text-[10px] ${variants[type]}`}>
      {labels[type]}
    </Badge>
  )
}

export function InventoryMovementsList({
  movements,
  products,
  categories,
  emptyMessage,
  currentPage,
  itemsPerPage,
  onPageChange,
}: InventoryMovementsListProps) {
  if (!movements || movements.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </motion.div>
    )
  }

  // Get product and category info
  const getProductInfo = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return { name: 'Unknown Product', categoryName: 'N/A' }

    const category = categories.find((c) => c.id === product.categoryId)
    return {
      name: product.name,
      categoryName: category?.name || 'Uncategorized',
    }
  }

  // Extract all sale IDs from movements
  const saleIds = movements
    .filter((m) => m.notes?.startsWith('Sale:'))
    .map((m) => m.notes!.substring(6).trim())

  // Fetch all sales referenced in movements
  const sales = useLiveQuery(async () => {
    if (saleIds.length === 0) return []
    return await db.sales.where('id').anyOf(saleIds).toArray()
  }, [saleIds.join(',')])

  // Create a map of saleId -> paymentMethod for quick lookup
  const salePaymentMap = new Map(
    sales?.map((sale) => [sale.id, sale.paymentMethod]) || []
  )

  // Format notes to be user-friendly
  const formatNotes = (movement: InventoryMovement): string => {
    const { notes, type } = movement

    // If no notes, determine from movement type (manual adjustments)
    if (!notes) {
      switch (type) {
        case 'in':
          return 'Restock (Added new items)'
        case 'out':
          return 'Stock Reduction (Damaged/Expired/Lost)'
        case 'adjust':
          return 'Manual Count Adjustment'
        default:
          return '-'
      }
    }

    // Check if it's a sale-related movement (format: "Sale: <uuid>")
    if (notes.startsWith('Sale:')) {
      const saleId = notes.substring(6).trim()
      const paymentMethod = salePaymentMap.get(saleId)

      if (paymentMethod) {
        const paymentMethodLabels = {
          cash: 'Cash',
          gcash: 'GCash',
          utang: 'Credit (Utang)',
        }
        const paymentLabel = paymentMethodLabels[paymentMethod] || paymentMethod
        return `Sold via POS (${paymentLabel})`
      }

      return 'Sold via POS'
    }

    return notes
  }

  // Pagination calculations
  const totalPages = Math.ceil(movements.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMovements = movements.slice(startIndex, endIndex)

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="w-[100px] text-right">Quantity</TableHead>
                <TableHead className="w-[200px]">Notes</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMovements.map((movement, index) => {
                const { name, categoryName } = getProductInfo(movement.productId)

                return (
                  <motion.tr
                    key={movement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MovementTypeIcon type={movement.type} />
                        <MovementTypeBadge type={movement.type} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{categoryName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold text-sm ${
                          movement.type === 'in'
                            ? 'text-green-600 dark:text-green-400'
                            : movement.type === 'out'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {movement.type === 'in' && '+'}
                        {movement.type === 'out' && '-'}
                        {movement.qty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formatNotes(movement)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(movement.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(movement.createdAt), 'h:mm a')}
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
        {paginatedMovements.map((movement, index) => {
          const { name, categoryName } = getProductInfo(movement.productId)

          return (
            <motion.div
              key={movement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MovementTypeIcon type={movement.type} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {categoryName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-sm font-bold ${
                        movement.type === 'in'
                          ? 'text-green-600 dark:text-green-400'
                          : movement.type === 'out'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {movement.type === 'in' && '+'}
                      {movement.type === 'out' && '-'}
                      {movement.qty}
                    </span>
                    <MovementTypeBadge type={movement.type} />
                  </div>
                </div>

                <div className="mt-2 border-t pt-2">
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {formatNotes(movement)}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <p className="text-[9px] text-muted-foreground">
                    {format(new Date(movement.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {format(new Date(movement.createdAt), 'h:mm a')}
                  </p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={movements.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </>
  )
}

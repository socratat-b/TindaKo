import { db } from '@/lib/db'
import type { Sale, SaleItem, InventoryMovement, UtangTransaction } from '@/lib/db/schema'

export interface CheckoutData {
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  amountPaid: number
  paymentMethod: 'cash' | 'gcash' | 'card'
  customerId: string | null
  userId: string
}

/**
 * Process a sale transaction
 * - Creates sale record
 * - Updates product stock
 * - Creates inventory movements
 * - Creates utang transaction if applicable
 */
export async function processSale(data: CheckoutData): Promise<string> {
  const now = new Date().toISOString()
  const saleId = crypto.randomUUID()

  try {
    // Wrap all operations in a transaction for atomicity
    await db.transaction(
      'rw',
      [db.sales, db.products, db.inventoryMovements, db.utangTransactions, db.customers],
      async () => {
        // 1. Create sale record
        const change = Math.max(0, data.amountPaid - data.total)
        const sale: Sale = {
          id: saleId,
          userId: data.userId,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          amountPaid: data.amountPaid,
          change,
          paymentMethod: data.paymentMethod,
          customerId: data.customerId,
          createdAt: now,
          updatedAt: now,
          syncedAt: null,
          isDeleted: false,
        }

        await db.sales.add(sale)

        // 2. Update product stock and create inventory movements
        for (const item of data.items) {
          const product = await db.products.get(item.productId)

          if (!product) {
            throw new Error(`Product not found: ${item.productName}`)
          }

          if (product.stockQty < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.productName}. Available: ${product.stockQty}, Required: ${item.quantity}`
            )
          }

          // Update stock
          await db.products.update(product.id, {
            stockQty: product.stockQty - item.quantity,
            updatedAt: now,
            syncedAt: null,
          })

          // Create inventory movement
          const movement: InventoryMovement = {
            id: crypto.randomUUID(),
            userId: data.userId,
            productId: item.productId,
            type: 'out',
            qty: item.quantity,
            notes: `Sale: ${saleId}`,
            createdAt: now,
            updatedAt: now,
            syncedAt: null,
            isDeleted: false,
          }

          await db.inventoryMovements.add(movement)
        }

        // 3. Create utang transaction if customer is selected and payment is partial/deferred
        if (data.customerId && data.amountPaid < data.total) {
          const utangAmount = data.total - data.amountPaid
          const customer = await db.customers.get(data.customerId)

          if (!customer) {
            throw new Error('Customer not found')
          }

          const newBalance = customer.totalUtang + utangAmount

          // Update customer's total utang
          await db.customers.update(data.customerId, {
            totalUtang: newBalance,
            updatedAt: now,
            syncedAt: null,
          })

          // Create utang transaction record
          const utangTransaction: UtangTransaction = {
            id: crypto.randomUUID(),
            userId: data.userId,
            customerId: data.customerId,
            saleId,
            type: 'charge',
            amount: utangAmount,
            balanceAfter: newBalance,
            notes: `Utang from sale ${saleId}`,
            createdAt: now,
            updatedAt: now,
            syncedAt: null,
            isDeleted: false,
          }

          await db.utangTransactions.add(utangTransaction)
        }
      }
    )

    return saleId
  } catch (error) {
    console.error('Failed to process sale:', error)
    throw error
  }
}

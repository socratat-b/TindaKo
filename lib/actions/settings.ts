'use server'

import { db } from '@/lib/db'
import { verifySession } from '@/lib/dal'

/**
 * Clear all local data from Dexie database
 * Preserves auth session (user stays logged in)
 * @returns success status and error message if any
 */
export async function clearAllLocalData(): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify session first
    const session = await verifySession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.userId

    // Clear all tables by marking items as deleted (soft delete)
    await db.transaction(
      'rw',
      [
        db.categories,
        db.products,
        db.sales,
        db.customers,
        db.utangTransactions,
        db.inventoryMovements,
      ],
      async () => {
        const now = new Date().toISOString()

        // Soft delete all categories
        const categories = await db.categories
          .where('userId')
          .equals(userId)
          .filter((c) => !c.isDeleted)
          .toArray()
        for (const category of categories) {
          await db.categories.update(category.id, {
            isDeleted: true,
            updatedAt: now,
            syncedAt: null,
          })
        }

        // Soft delete all products
        const products = await db.products
          .where('userId')
          .equals(userId)
          .filter((p) => !p.isDeleted)
          .toArray()
        for (const product of products) {
          await db.products.update(product.id, {
            isDeleted: true,
            updatedAt: now,
            syncedAt: null,
          })
        }

        // Soft delete all sales
        const sales = await db.sales
          .where('userId')
          .equals(userId)
          .filter((s) => !s.isDeleted)
          .toArray()
        for (const sale of sales) {
          await db.sales.update(sale.id, {
            isDeleted: true,
            updatedAt: now,
            syncedAt: null,
          })
        }

        // Soft delete all customers
        const customers = await db.customers
          .where('userId')
          .equals(userId)
          .filter((c) => !c.isDeleted)
          .toArray()
        for (const customer of customers) {
          await db.customers.update(customer.id, {
            isDeleted: true,
            updatedAt: now,
            syncedAt: null,
          })
        }

        // Soft delete all utang transactions
        const utangTransactions = await db.utangTransactions
          .where('userId')
          .equals(userId)
          .filter((u) => !u.isDeleted)
          .toArray()
        for (const transaction of utangTransactions) {
          await db.utangTransactions.update(transaction.id, {
            isDeleted: true,
            updatedAt: now,
            syncedAt: null,
          })
        }

        // Soft delete all inventory movements
        const inventoryMovements = await db.inventoryMovements
          .where('userId')
          .equals(userId)
          .filter((i) => !i.isDeleted)
          .toArray()
        for (const movement of inventoryMovements) {
          await db.inventoryMovements.update(movement.id, {
            isDeleted: true,
            updatedAt: now,
            syncedAt: null,
          })
        }
      }
    )

    return { success: true }
  } catch (error) {
    console.error('Error clearing local data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear data',
    }
  }
}

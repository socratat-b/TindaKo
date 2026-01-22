import Dexie, { type EntityTable } from 'dexie'
import type { Category, Customer, Product, Sale, UtangTransaction, InventoryMovement } from './schema'

// Extend Dexie with our tables
class TindaKoDB extends Dexie {
  categories!: EntityTable<Category, 'id'>
  customers!: EntityTable<Customer, 'id'>
  products!: EntityTable<Product, 'id'>
  sales!: EntityTable<Sale, 'id'>
  utangTransactions!: EntityTable<UtangTransaction, 'id'>
  inventoryMovements!: EntityTable<InventoryMovement, 'id'>

  constructor() {
    super('TindaKoDB')

    // Schema version will be incremented with each table
    // Tables will be added here by /add-table skill
    this.version(1).stores({
      categories: 'id, userId, syncedAt, sortOrder',
      customers: 'id, userId, syncedAt, name, phone, address',
      products: 'id, userId, syncedAt, categoryId, barcode, name',
      sales: 'id, userId, syncedAt, createdAt, customerId',
      utangTransactions: 'id, userId, syncedAt, customerId, saleId, createdAt',
      inventoryMovements: 'id, userId, syncedAt, productId, createdAt, type',
    })
  }
}

export const db = new TindaKoDB()

/**
 * Clear all local data from IndexedDB
 * Called on logout to prevent data leakage between users
 */
export async function clearAllLocalData(): Promise<void> {
  console.log('[clearAllLocalData] Starting to clear all tables...')
  try {
    await Promise.all([
      db.categories.clear(),
      db.customers.clear(),
      db.products.clear(),
      db.sales.clear(),
      db.utangTransactions.clear(),
      db.inventoryMovements.clear(),
    ])
    console.log('[clearAllLocalData] All tables cleared successfully')
  } catch (error) {
    console.error('[clearAllLocalData] Failed to clear tables:', error)
    throw error
  }
}

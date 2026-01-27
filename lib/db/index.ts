import Dexie, { type EntityTable } from 'dexie'
import type { Store, Category, Customer, Product, Sale, UtangTransaction, InventoryMovement } from './schema'

// Extend Dexie with our tables
class TindaKoDB extends Dexie {
  stores!: EntityTable<Store, 'id'>
  categories!: EntityTable<Category, 'id'>
  customers!: EntityTable<Customer, 'id'>
  products!: EntityTable<Product, 'id'>
  sales!: EntityTable<Sale, 'id'>
  utangTransactions!: EntityTable<UtangTransaction, 'id'>
  inventoryMovements!: EntityTable<InventoryMovement, 'id'>

  constructor() {
    super('TindaKoDB')

    // Version 1: Original schema with userId
    this.version(1).stores({
      categories: 'id, userId, syncedAt, sortOrder',
      customers: 'id, userId, syncedAt, name, phone, address',
      products: 'id, userId, syncedAt, categoryId, barcode, name',
      sales: 'id, userId, syncedAt, createdAt, customerId',
      utangTransactions: 'id, userId, syncedAt, customerId, saleId, createdAt',
      inventoryMovements: 'id, userId, syncedAt, productId, createdAt, type',
    })

    // Version 2: Phone-based auth with storePhone
    this.version(2).stores({
      stores: 'id, phone, createdAt',
      categories: 'id, storePhone, syncedAt, sortOrder',
      customers: 'id, storePhone, syncedAt, name, phone, address',
      products: 'id, storePhone, syncedAt, categoryId, barcode, name',
      sales: 'id, storePhone, syncedAt, createdAt, customerId',
      utangTransactions: 'id, storePhone, syncedAt, customerId, saleId, createdAt',
      inventoryMovements: 'id, storePhone, syncedAt, productId, createdAt, type',
    }).upgrade(async (trans) => {
      // Migration: Convert userId to storePhone
      // Note: This will clear existing data since we're changing the user model
      console.log('[Dexie Migration] Upgrading to version 2: userId → storePhone')
      console.log('[Dexie Migration] Existing data will be cleared (auth model changed)')
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
      db.stores.clear(),
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

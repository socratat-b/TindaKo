import Dexie, { type EntityTable } from 'dexie'
import type { UserProfile, Category, Customer, Product, Sale, UtangTransaction, InventoryMovement, ProductCatalog } from './schema'

// Extend Dexie with our tables
class TindaKoDB extends Dexie {
  userProfile!: EntityTable<UserProfile, 'id'>
  categories!: EntityTable<Category, 'id'>
  customers!: EntityTable<Customer, 'id'>
  products!: EntityTable<Product, 'id'>
  sales!: EntityTable<Sale, 'id'>
  utangTransactions!: EntityTable<UtangTransaction, 'id'>
  inventoryMovements!: EntityTable<InventoryMovement, 'id'>
  productCatalog!: EntityTable<ProductCatalog, 'id'>

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

    // Version 3: Add product catalog for barcode lookups
    this.version(3).stores({
      stores: 'id, phone, createdAt',
      categories: 'id, storePhone, syncedAt, sortOrder',
      customers: 'id, storePhone, syncedAt, name, phone, address',
      products: 'id, storePhone, syncedAt, categoryId, barcode, name',
      sales: 'id, storePhone, syncedAt, createdAt, customerId',
      utangTransactions: 'id, storePhone, syncedAt, customerId, saleId, createdAt',
      inventoryMovements: 'id, storePhone, syncedAt, productId, createdAt, type',
      productCatalog: 'id, barcode, name',
    }).upgrade(async (trans) => {
      console.log('[Dexie Migration] Upgrading to version 3: Adding product catalog')
    })

    // Version 4: OAuth migration - storePhone → userId
    this.version(4).stores({
      userProfile: 'id, email, storeName', // Replaces stores table
      categories: 'id, userId, syncedAt, sortOrder',
      customers: 'id, userId, syncedAt, name, phone, address',
      products: 'id, userId, syncedAt, categoryId, barcode, name',
      sales: 'id, userId, syncedAt, createdAt, customerId',
      utangTransactions: 'id, userId, syncedAt, customerId, saleId, createdAt',
      inventoryMovements: 'id, userId, syncedAt, productId, createdAt, type',
      productCatalog: 'id, barcode, name',
    }).upgrade(async (trans) => {
      console.log('[Dexie Migration] Upgrading to version 4: OAuth migration')
      console.log('[Dexie Migration] Converting storePhone → userId')
      console.log('[Dexie Migration] Clearing all data (incompatible schema)')

      // Clear all data (schema incompatible: text → uuid)
      await trans.table('categories').clear()
      await trans.table('customers').clear()
      await trans.table('products').clear()
      await trans.table('sales').clear()
      await trans.table('utangTransactions').clear()
      await trans.table('inventoryMovements').clear()

      // Note: productCatalog is preserved (shared reference data)
      console.log('[Dexie Migration] Migration complete. Data will be restored on first login.')
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
      db.userProfile.clear(),
      db.categories.clear(),
      db.customers.clear(),
      db.products.clear(),
      db.sales.clear(),
      db.utangTransactions.clear(),
      db.inventoryMovements.clear(),
      // Note: productCatalog is NOT cleared - it's shared reference data
    ])
    console.log('[clearAllLocalData] All tables cleared successfully')
  } catch (error) {
    console.error('[clearAllLocalData] Failed to clear tables:', error)
    throw error
  }
}

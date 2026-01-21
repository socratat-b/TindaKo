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

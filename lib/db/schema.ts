// TypeScript interfaces for all database tables
// Universal fields included in all tables
export interface BaseEntity {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  syncedAt: string | null
  isDeleted: boolean
}

// Table interfaces will be added here by /add-table skill

export interface Category extends BaseEntity {
  name: string
  color: string
  sortOrder: number
}

export interface Customer extends BaseEntity {
  name: string
  phone: string | null
  address: string | null
  totalUtang: number
}

export interface Product extends BaseEntity {
  name: string
  barcode: string | null
  categoryId: string
  sellingPrice: number
  stockQty: number
  lowStockThreshold: number
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Sale extends BaseEntity {
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  amountPaid: number
  change: number
  paymentMethod: 'cash' | 'gcash' | 'card' | 'utang'
  customerId: string | null
}

export interface UtangTransaction extends BaseEntity {
  customerId: string
  saleId: string | null
  type: 'charge' | 'payment'
  amount: number
  balanceAfter: number
  notes: string | null
}

export interface InventoryMovement extends BaseEntity {
  productId: string
  type: 'in' | 'out' | 'adjust'
  qty: number
  notes: string | null
}

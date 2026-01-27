import { db } from './index'
import { createClient } from '@/lib/supabase/client'
import { getCurrentPhone } from '@/lib/auth/session'
import {
  pushCategories,
  pushCustomers,
  pushProducts,
  pushSales,
  pushUtangTransactions,
  pushInventoryMovements,
  pullCategories,
  pullCustomers,
  pullProducts,
  pullSales,
  pullUtangTransactions,
  pullInventoryMovements,
} from './sync-helpers'

let lastSyncTime: Record<string, string> = {}

/**
 * Check if browser is online
 */
function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Get current phone from local session
 * @throws Error if user is not authenticated
 */
function getCurrentPhoneOrThrow(): string {
  const phone = getCurrentPhone()
  if (!phone) {
    throw new Error('User must be authenticated to sync')
  }
  return phone
}

/**
 * Sync statistics returned after sync
 */
export interface SyncStats {
  pushedCount: number
  pulledCount: number
  skippedCount: number
}

/**
 * Check if there are any unsynced changes in local database
 * Returns true if any table has items with syncedAt === null
 */
export async function hasUnsyncedChanges(storePhone: string): Promise<boolean> {
  try {
    const [categories, customers, products, sales, utangTxns, inventoryMvmts] = await Promise.all([
      db.categories.filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted).count(),
      db.customers.filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted).count(),
      db.products.filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted).count(),
      db.sales.filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted).count(),
      db.utangTransactions.filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted).count(),
      db.inventoryMovements.filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted).count(),
    ])

    const total = categories + customers + products + sales + utangTxns + inventoryMvmts
    return total > 0
  } catch (error) {
    console.error('Failed to check for unsynced changes:', error)
    return false
  }
}

/**
 * PUSH ONLY: Upload unsynced local data to cloud (one-way backup)
 * Does NOT download any data from cloud
 * Used for manual "Backup to Cloud" button
 */
export async function pushToCloud(storePhone?: string, onProgress?: (current: string, completed: number, total: number, count: number) => void): Promise<SyncStats> {
  try {
    // Check if online before attempting sync
    if (!isOnline()) {
      console.log('Offline - skipping push')
      return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    }

    const currentPhone = storePhone || getCurrentPhoneOrThrow()
    const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    const totalTables = 6

    // Push in dependency order
    onProgress?.('Categories', 0, totalTables, 0)
    const categoriesStats = await pushCategories(currentPhone)
    stats.pushedCount += categoriesStats.pushedCount

    onProgress?.('Customers', 1, totalTables, categoriesStats.pushedCount)
    const customersStats = await pushCustomers(currentPhone)
    stats.pushedCount += customersStats.pushedCount

    onProgress?.('Products', 2, totalTables, customersStats.pushedCount)
    const productsStats = await pushProducts(currentPhone)
    stats.pushedCount += productsStats.pushedCount

    onProgress?.('Sales', 3, totalTables, productsStats.pushedCount)
    const salesStats = await pushSales(currentPhone)
    stats.pushedCount += salesStats.pushedCount

    onProgress?.('Utang', 4, totalTables, salesStats.pushedCount)
    const utangStats = await pushUtangTransactions(currentPhone)
    stats.pushedCount += utangStats.pushedCount

    onProgress?.('Inventory', 5, totalTables, utangStats.pushedCount)
    const inventoryStats = await pushInventoryMovements(currentPhone)
    stats.pushedCount += inventoryStats.pushedCount

    console.log('Push to cloud completed successfully', stats)
    return stats
  } catch (error) {
    console.error('Push to cloud failed:', error)
    throw error
  }
}

/**
 * PULL ONLY: Download all user data from cloud to local (restore)
 * Does NOT upload any data to cloud
 * Used for auto-restore on first login or new device
 */
export async function pullFromCloud(storePhone?: string): Promise<SyncStats> {
  try {
    console.log('[pullFromCloud] Starting pull for phone:', storePhone)

    // Check if online before attempting sync
    if (!isOnline()) {
      console.log('[pullFromCloud] Offline - skipping pull')
      return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    }

    const currentPhone = storePhone || getCurrentPhoneOrThrow()
    console.log('[pullFromCloud] Using phone:', currentPhone)

    const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

    // Pull in dependency order
    console.log('[pullFromCloud] Pulling categories...')
    const categoriesStats = await pullCategories(currentPhone)
    stats.pulledCount += categoriesStats.pulledCount
    console.log('[pullFromCloud] Categories pulled:', categoriesStats.pulledCount)

    console.log('[pullFromCloud] Pulling customers...')
    const customersStats = await pullCustomers(currentPhone)
    stats.pulledCount += customersStats.pulledCount
    console.log('[pullFromCloud] Customers pulled:', customersStats.pulledCount)

    console.log('[pullFromCloud] Pulling products...')
    const productsStats = await pullProducts(currentPhone)
    stats.pulledCount += productsStats.pulledCount
    console.log('[pullFromCloud] Products pulled:', productsStats.pulledCount)

    console.log('[pullFromCloud] Pulling sales...')
    const salesStats = await pullSales(currentPhone)
    stats.pulledCount += salesStats.pulledCount
    console.log('[pullFromCloud] Sales pulled:', salesStats.pulledCount)

    console.log('[pullFromCloud] Pulling utang transactions...')
    const utangStats = await pullUtangTransactions(currentPhone)
    stats.pulledCount += utangStats.pulledCount
    console.log('[pullFromCloud] Utang transactions pulled:', utangStats.pulledCount)

    console.log('[pullFromCloud] Pulling inventory movements...')
    const inventoryStats = await pullInventoryMovements(currentPhone)
    stats.pulledCount += inventoryStats.pulledCount
    console.log('[pullFromCloud] Inventory movements pulled:', inventoryStats.pulledCount)

    console.log('[pullFromCloud] Pull from cloud completed successfully', stats)
    return stats
  } catch (error) {
    console.error('[pullFromCloud] Pull from cloud failed:', error)
    throw error
  }
}

/**
 * Sync all tables with Supabase (BOTH push AND pull)
 * Syncs in dependency order: categories, customers, products, sales, utangTransactions, inventoryMovements
 * Skips sync if offline
 * @param isInitialSync - If true, pulls all data regardless of lastSyncTime (for first login/restore)
 */
export async function syncAll(isInitialSync = false): Promise<SyncStats> {
  try {
    // Check if online before attempting sync
    if (!isOnline()) {
      console.log('Offline - skipping sync')
      return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    }

    const storePhone = getCurrentPhoneOrThrow()

    // Sync in dependency order and collect stats
    const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

    const categoriesStats = await syncCategories(storePhone, isInitialSync)
    stats.pushedCount += categoriesStats.pushedCount
    stats.pulledCount += categoriesStats.pulledCount
    stats.skippedCount += categoriesStats.skippedCount

    const customersStats = await syncCustomers(storePhone, isInitialSync)
    stats.pushedCount += customersStats.pushedCount
    stats.pulledCount += customersStats.pulledCount
    stats.skippedCount += customersStats.skippedCount

    const productsStats = await syncProducts(storePhone, isInitialSync)
    stats.pushedCount += productsStats.pushedCount
    stats.pulledCount += productsStats.pulledCount
    stats.skippedCount += productsStats.skippedCount

    const salesStats = await syncSales(storePhone, isInitialSync)
    stats.pushedCount += salesStats.pushedCount
    stats.pulledCount += salesStats.pulledCount
    stats.skippedCount += salesStats.skippedCount

    const utangStats = await syncUtangTransactions(storePhone, isInitialSync)
    stats.pushedCount += utangStats.pushedCount
    stats.pulledCount += utangStats.pulledCount
    stats.skippedCount += utangStats.skippedCount

    const inventoryStats = await syncInventoryMovements(storePhone, isInitialSync)
    stats.pushedCount += inventoryStats.pushedCount
    stats.pulledCount += inventoryStats.pulledCount
    stats.skippedCount += inventoryStats.skippedCount

    console.log('Sync completed successfully', stats)
    return stats
  } catch (error) {
    console.error('Sync failed:', error)
    throw error
  }
}

// Helper to convert camelCase to snake_case
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    result[snakeKey] = obj[key]
  }
  return result
}

// Helper to convert snake_case to camelCase
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}

// Sync functions will be implemented by /add-table skill
async function syncCategories(storePhone: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['categories'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by storePhone)
  const unsynced = await db.categories
    .filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)

    const { error } = await supabase
      .from('categories')
      .upsert(supabaseData)

    if (error) {
      console.error('❌ Failed to sync category:', item.id, error)
      console.error('Data being sent:', supabaseData)
    } else {
      await db.categories.update(item.id, {
        syncedAt: new Date().toISOString()
      })
      stats.pushedCount++
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('categories')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      const existing = await db.categories.get(localData.id)

      // Only replace if remote is newer or doesn't exist locally
      if (!existing || new Date(item.updated_at) > new Date(existing.updatedAt)) {
        localData.syncedAt = new Date().toISOString()
        await db.categories.put(localData)
        stats.pulledCount++
      } else {
        // Local is newer - keep it
        stats.skippedCount++
        console.log(`Skipped category ${localData.id}: local is newer`)
      }
    }
  }

  lastSyncTime['categories'] = new Date().toISOString()
  return stats
}

async function syncCustomers(storePhone: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['customers'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by storePhone)
  const unsynced = await db.customers
    .filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)

    const { error } = await supabase
      .from('customers')
      .upsert(supabaseData)

    if (!error) {
      await db.customers.update(item.id, {
        syncedAt: new Date().toISOString()
      })
      stats.pushedCount++
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('customers')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      const existing = await db.customers.get(localData.id)

      // Only replace if remote is newer or doesn't exist locally
      if (!existing || new Date(item.updated_at) > new Date(existing.updatedAt)) {
        localData.syncedAt = new Date().toISOString()
        await db.customers.put(localData)
        stats.pulledCount++
      } else {
        // Local is newer - keep it
        stats.skippedCount++
        console.log(`Skipped customer ${localData.id}: local is newer`)
      }
    }
  }

  lastSyncTime['customers'] = new Date().toISOString()
  return stats
}

async function syncProducts(storePhone: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['products'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by storePhone)
  const unsynced = await db.products
    .filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)

    const { error } = await supabase
      .from('products')
      .upsert(supabaseData)

    if (!error) {
      await db.products.update(item.id, {
        syncedAt: new Date().toISOString()
      })
      stats.pushedCount++
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('products')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      const existing = await db.products.get(localData.id)

      // Only replace if remote is newer or doesn't exist locally
      if (!existing || new Date(item.updated_at) > new Date(existing.updatedAt)) {
        localData.syncedAt = new Date().toISOString()
        await db.products.put(localData)
        stats.pulledCount++
      } else {
        // Local is newer - keep it
        stats.skippedCount++
        console.log(`Skipped product ${localData.id}: local is newer`)
      }
    }
  }

  lastSyncTime['products'] = new Date().toISOString()
  return stats
}

async function syncSales(storePhone: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['sales'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by storePhone)
  const unsynced = await db.sales
    .filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    // Items array is already in the correct format (JSON)

    const { error } = await supabase
      .from('sales')
      .upsert(supabaseData)

    if (!error) {
      await db.sales.update(item.id, {
        syncedAt: new Date().toISOString()
      })
      stats.pushedCount++
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('sales')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      const existing = await db.sales.get(localData.id)

      // Only replace if remote is newer or doesn't exist locally
      if (!existing || new Date(item.updated_at) > new Date(existing.updatedAt)) {
        // Items array is already in the correct format (JSON)
        localData.syncedAt = new Date().toISOString()
        await db.sales.put(localData)
        stats.pulledCount++
      } else {
        // Local is newer - keep it
        stats.skippedCount++
        console.log(`Skipped sale ${localData.id}: local is newer`)
      }
    }
  }

  lastSyncTime['sales'] = new Date().toISOString()
  return stats
}

async function syncUtangTransactions(storePhone: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['utangTransactions'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by storePhone)
  const unsynced = await db.utangTransactions
    .filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)

    const { error } = await supabase
      .from('utang_transactions')
      .upsert(supabaseData)

    if (!error) {
      await db.utangTransactions.update(item.id, {
        syncedAt: new Date().toISOString()
      })
      stats.pushedCount++
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('utang_transactions')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      const existing = await db.utangTransactions.get(localData.id)

      // Only replace if remote is newer or doesn't exist locally
      if (!existing || new Date(item.updated_at) > new Date(existing.updatedAt)) {
        localData.syncedAt = new Date().toISOString()
        await db.utangTransactions.put(localData)
        stats.pulledCount++
      } else {
        // Local is newer - keep it
        stats.skippedCount++
        console.log(`Skipped utang transaction ${localData.id}: local is newer`)
      }
    }
  }

  lastSyncTime['utangTransactions'] = new Date().toISOString()
  return stats
}

async function syncInventoryMovements(storePhone: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['inventoryMovements'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by storePhone)
  const unsynced = await db.inventoryMovements
    .filter(item => item.syncedAt === null && item.storePhone === storePhone && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)

    const { error } = await supabase
      .from('inventory_movements')
      .upsert(supabaseData)

    if (!error) {
      await db.inventoryMovements.update(item.id, {
        syncedAt: new Date().toISOString()
      })
      stats.pushedCount++
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('inventory_movements')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      const existing = await db.inventoryMovements.get(localData.id)

      // Only replace if remote is newer or doesn't exist locally
      if (!existing || new Date(item.updated_at) > new Date(existing.updatedAt)) {
        localData.syncedAt = new Date().toISOString()
        await db.inventoryMovements.put(localData)
        stats.pulledCount++
      } else {
        // Local is newer - keep it
        stats.skippedCount++
        console.log(`Skipped inventory movement ${localData.id}: local is newer`)
      }
    }
  }

  lastSyncTime['inventoryMovements'] = new Date().toISOString()
  return stats
}

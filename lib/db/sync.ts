import { db } from './index'
import { createClient } from '@/lib/supabase/client'
import { isSessionValidOffline, isOnline } from '@/lib/auth/session-cache'

let lastSyncTime: Record<string, string> = {}

/**
 * Get current user ID from Supabase auth
 * Tries online first, falls back to cached session for offline access
 * @throws Error if user is not authenticated
 */
async function getCurrentUserId(): Promise<string> {
  const supabase = createClient()

  // Try online verification first
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user && !error) {
      return user.id
    }
  } catch {
    // Network error: fall through to offline check
  }

  // Offline fallback: Check cached session
  const validation = await isSessionValidOffline()

  if (!validation.isValid || !validation.session) {
    throw new Error('User must be authenticated to sync')
  }

  return validation.session.userId
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
 * Sync all tables with Supabase
 * Syncs in dependency order: categories, customers, products, sales, utangTransactions, inventoryMovements
 * Skips sync if offline
 * @param isInitialSync - If true, pulls all data regardless of lastSyncTime (for first login/restore)
 */
export async function syncAll(isInitialSync = false): Promise<SyncStats> {
  try {
    // Check if online before attempting sync
    const online = await isOnline()
    if (!online) {
      console.log('Offline - skipping sync')
      return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
    }

    const userId = await getCurrentUserId()

    // Sync in dependency order and collect stats
    const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

    const categoriesStats = await syncCategories(userId, isInitialSync)
    stats.pushedCount += categoriesStats.pushedCount
    stats.pulledCount += categoriesStats.pulledCount
    stats.skippedCount += categoriesStats.skippedCount

    const customersStats = await syncCustomers(userId, isInitialSync)
    stats.pushedCount += customersStats.pushedCount
    stats.pulledCount += customersStats.pulledCount
    stats.skippedCount += customersStats.skippedCount

    const productsStats = await syncProducts(userId, isInitialSync)
    stats.pushedCount += productsStats.pushedCount
    stats.pulledCount += productsStats.pulledCount
    stats.skippedCount += productsStats.skippedCount

    const salesStats = await syncSales(userId, isInitialSync)
    stats.pushedCount += salesStats.pushedCount
    stats.pulledCount += salesStats.pulledCount
    stats.skippedCount += salesStats.skippedCount

    const utangStats = await syncUtangTransactions(userId, isInitialSync)
    stats.pushedCount += utangStats.pushedCount
    stats.pulledCount += utangStats.pulledCount
    stats.skippedCount += utangStats.skippedCount

    const inventoryStats = await syncInventoryMovements(userId, isInitialSync)
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
async function syncCategories(userId: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['categories'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.categories
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
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

async function syncCustomers(userId: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['customers'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.customers
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
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

async function syncProducts(userId: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['products'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.products
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
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

async function syncSales(userId: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['sales'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.sales
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
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

async function syncUtangTransactions(userId: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['utangTransactions'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.utangTransactions
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
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

async function syncInventoryMovements(userId: string, isInitialSync = false): Promise<SyncStats> {
  const supabase = createClient()
  const lastSync = isInitialSync ? new Date(0).toISOString() : (lastSyncTime['inventoryMovements'] || new Date(0).toISOString())
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.inventoryMovements
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
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

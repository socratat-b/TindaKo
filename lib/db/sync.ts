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
 * Sync all tables with Supabase
 * Syncs in dependency order: categories, customers, products, sales, utangTransactions, inventoryMovements
 * Skips sync if offline
 */
export async function syncAll() {
  try {
    // Check if online before attempting sync
    const online = await isOnline()
    if (!online) {
      console.log('Offline - skipping sync')
      return
    }

    const userId = await getCurrentUserId()

    // Sync in dependency order
    await syncCategories(userId)
    await syncCustomers(userId)
    await syncProducts(userId)
    await syncSales(userId)
    await syncUtangTransactions(userId)
    await syncInventoryMovements(userId)
    console.log('Sync completed successfully')
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
async function syncCategories(userId: string) {
  const supabase = createClient()
  const lastSync = lastSyncTime['categories'] || new Date(0).toISOString()

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.categories
    .where('syncedAt')
    .equals(null as any)
    .filter(item => item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)

    const { error } = await supabase
      .from('categories')
      .upsert(supabaseData)

    if (!error) {
      await db.categories.update(item.id, {
        syncedAt: new Date().toISOString()
      })
    }
  }

  // PULL: Remote changes to local (RLS automatically filters by userId)
  const { data } = await supabase
    .from('categories')
    .select('*')
    .gt('updated_at', lastSync)

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any as any
      localData.syncedAt = new Date().toISOString()
      await db.categories.put(localData)
    }
  }

  lastSyncTime['categories'] = new Date().toISOString()
}

async function syncCustomers(userId: string) {
  const supabase = createClient()
  const lastSync = lastSyncTime['customers'] || new Date(0).toISOString()

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.customers
    .where('syncedAt')
    .equals(null as any)
    .filter(item => item.userId === userId && !item.isDeleted)
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
      localData.syncedAt = new Date().toISOString()
      await db.customers.put(localData)
    }
  }

  lastSyncTime['customers'] = new Date().toISOString()
}

async function syncProducts(userId: string) {
  const supabase = createClient()
  const lastSync = lastSyncTime['products'] || new Date(0).toISOString()

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.products
    .where('syncedAt')
    .equals(null as any)
    .filter(item => item.userId === userId && !item.isDeleted)
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
      localData.syncedAt = new Date().toISOString()
      await db.products.put(localData)
    }
  }

  lastSyncTime['products'] = new Date().toISOString()
}

async function syncSales(userId: string) {
  const supabase = createClient()
  const lastSync = lastSyncTime['sales'] || new Date(0).toISOString()

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.sales
    .where('syncedAt')
    .equals(null as any)
    .filter(item => item.userId === userId && !item.isDeleted)
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
      // Items array is already in the correct format (JSON)
      localData.syncedAt = new Date().toISOString()
      await db.sales.put(localData)
    }
  }

  lastSyncTime['sales'] = new Date().toISOString()
}

async function syncUtangTransactions(userId: string) {
  const supabase = createClient()
  const lastSync = lastSyncTime['utangTransactions'] || new Date(0).toISOString()

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.utangTransactions
    .where('syncedAt')
    .equals(null as any)
    .filter(item => item.userId === userId && !item.isDeleted)
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
      localData.syncedAt = new Date().toISOString()
      await db.utangTransactions.put(localData)
    }
  }

  lastSyncTime['utangTransactions'] = new Date().toISOString()
}

async function syncInventoryMovements(userId: string) {
  const supabase = createClient()
  const lastSync = lastSyncTime['inventoryMovements'] || new Date(0).toISOString()

  // PUSH: Local unsynced changes to Supabase (filter by userId)
  const unsynced = await db.inventoryMovements
    .where('syncedAt')
    .equals(null as any)
    .filter(item => item.userId === userId && !item.isDeleted)
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
      localData.syncedAt = new Date().toISOString()
      await db.inventoryMovements.put(localData)
    }
  }

  lastSyncTime['inventoryMovements'] = new Date().toISOString()
}

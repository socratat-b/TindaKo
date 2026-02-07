/**
 * Helper functions for PUSH-only and PULL-only sync operations
 * Separated from main sync.ts for clarity
 */

import { db } from './index'
import { createClient } from '@/lib/supabase/client'
import { toSnakeCase, toCamelCase } from './sync'
import type { SyncStats } from './sync'

// PUSH-ONLY FUNCTIONS (Upload to cloud only)

export async function pushStores(userId: string): Promise<SyncStats> {
  // OAuth: User profiles are managed by Supabase Auth, no need to sync
  // The stores table is updated via setupStoreAction/updateStoreNameAction
  return { pushedCount: 0, pulledCount: 0, skippedCount: 0 }
}

export async function pushCategories(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const unsynced = await db.categories
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    const { error } = await supabase.from('categories').upsert(supabaseData)

    if (!error) {
      await db.categories.update(item.id, { syncedAt: new Date().toISOString() })
      stats.pushedCount++
    } else {
      console.error('[pushCategories] Failed to push category:', item.id, error)
    }
  }

  return stats
}

export async function pushCustomers(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const unsynced = await db.customers
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    const { error } = await supabase.from('customers').upsert(supabaseData)

    if (!error) {
      await db.customers.update(item.id, { syncedAt: new Date().toISOString() })
      stats.pushedCount++
    } else {
      console.error('[pushCustomers] Failed to push customer:', item.id, error)
      throw new Error(`Failed to sync customer ${item.name}: ${error.message}`)
    }
  }

  return stats
}

export async function pushProducts(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const unsynced = await db.products
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    const { error } = await supabase.from('products').upsert(supabaseData)

    if (!error) {
      await db.products.update(item.id, { syncedAt: new Date().toISOString() })
      stats.pushedCount++
    } else {
      console.error('[pushProducts] Failed to push product:', item.id, error)
    }
  }

  return stats
}

export async function pushSales(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const unsynced = await db.sales
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    const { error } = await supabase.from('sales').upsert(supabaseData)

    if (!error) {
      await db.sales.update(item.id, { syncedAt: new Date().toISOString() })
      stats.pushedCount++
    } else {
      console.error('[pushSales] Failed to push sale:', item.id, error)
    }
  }

  return stats
}

export async function pushUtangTransactions(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const unsynced = await db.utangTransactions
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    const { error } = await supabase.from('utang_transactions').upsert(supabaseData)

    if (!error) {
      await db.utangTransactions.update(item.id, { syncedAt: new Date().toISOString() })
      stats.pushedCount++
    } else {
      console.error('[pushUtangTransactions] Failed to push utang transaction:', item.id, error)
      throw new Error(`Failed to sync utang transaction: ${error.message}`)
    }
  }

  return stats
}

export async function pushInventoryMovements(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const unsynced = await db.inventoryMovements
    .filter(item => item.syncedAt === null && item.userId === userId && !item.isDeleted)
    .toArray()

  for (const item of unsynced) {
    const supabaseData = toSnakeCase(item)
    const { error } = await supabase.from('inventory_movements').upsert(supabaseData)

    if (!error) {
      await db.inventoryMovements.update(item.id, { syncedAt: new Date().toISOString() })
      stats.pushedCount++
    } else {
      console.error('[pushInventoryMovements] Failed to push inventory movement:', item.id, error)
    }
  }

  return stats
}

// PULL-ONLY FUNCTIONS (Download from cloud only)

export async function pullCategories(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    // Note: Don't filter by is_deleted to allow soft-delete propagation across devices

  if (error) {
    console.error('[pullCategories] Supabase error:', error)
    return stats
  }

  if (data) {
    for (const item of data) {
      try {
        const localData = toCamelCase(item) as any
        localData.syncedAt = new Date().toISOString()
        await db.categories.put(localData)
        stats.pulledCount++
      } catch (err) {
        console.error('[pullCategories] Failed to put item:', item, err)
      }
    }
  }

  return stats
}

export async function pullCustomers(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    // Note: Don't filter by is_deleted to allow soft-delete propagation across devices

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      localData.syncedAt = new Date().toISOString()
      await db.customers.put(localData)
      stats.pulledCount++
    }
  }

  return stats
}

export async function pullProducts(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    // Note: Don't filter by is_deleted to allow soft-delete propagation across devices

  if (error) {
    console.error('[pullProducts] Supabase error:', error)
    return stats
  }

  if (data) {
    for (const item of data) {
      try {
        const localData = toCamelCase(item) as any
        localData.syncedAt = new Date().toISOString()
        await db.products.put(localData)
        stats.pulledCount++
      } catch (err) {
        console.error('[pullProducts] Failed to put product:', item, err)
      }
    }
  }

  return stats
}

export async function pullSales(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const { data } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    // Note: Don't filter by is_deleted to allow soft-delete propagation across devices

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      localData.syncedAt = new Date().toISOString()
      await db.sales.put(localData)
      stats.pulledCount++
    }
  }

  return stats
}

export async function pullUtangTransactions(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const { data } = await supabase
    .from('utang_transactions')
    .select('*')
    .eq('user_id', userId)
    // Note: Don't filter by is_deleted to allow soft-delete propagation across devices

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      localData.syncedAt = new Date().toISOString()
      await db.utangTransactions.put(localData)
      stats.pulledCount++
    }
  }

  return stats
}

export async function pullInventoryMovements(userId: string): Promise<SyncStats> {
  const supabase = createClient()
  const stats: SyncStats = { pushedCount: 0, pulledCount: 0, skippedCount: 0 }

  const { data } = await supabase
    .from('inventory_movements')
    .select('*')
    .eq('user_id', userId)
    // Note: Don't filter by is_deleted to allow soft-delete propagation across devices

  if (data) {
    for (const item of data) {
      const localData = toCamelCase(item) as any
      localData.syncedAt = new Date().toISOString()
      await db.inventoryMovements.put(localData)
      stats.pulledCount++
    }
  }

  return stats
}

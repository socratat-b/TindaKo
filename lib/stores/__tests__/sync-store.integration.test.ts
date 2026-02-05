import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSyncStore } from '../sync-store'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

// Mock dependencies
vi.mock('@/lib/supabase/client')

describe('Sync Store Integration Tests', () => {
  let mockSupabase: any

  beforeEach(async () => {
    // Clear database
    await db.categories.clear()
    await db.products.clear()
    await db.sales.clear()

    // Reset store state
    useSyncStore.setState({
      status: 'idle',
      lastSyncTime: null,
      lastSyncStats: null,
      error: null,
      hasPendingChanges: false,
    })

    // Setup mock Supabase
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        gt: vi.fn().mockResolvedValue({ data: [] }),
      })),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    }
    ;(createClient as any).mockReturnValue(mockSupabase)
  })

  it('completes full sync workflow: local changes → Supabase → success', async () => {
    // 1. Add local changes
    await db.categories.add({
      id: 'cat-1',
      userId: 'test-user-id',
      name: 'Test Category',
      color: '#ff0000',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    await db.products.add({
      id: 'prod-1',
      userId: 'test-user-id',
      name: 'Test Product',
      barcode: '12345',
      categoryId: 'cat-1',
      costPrice: 10,
      sellingPrice: 15,
      stockQty: 100,
      lowStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    // 2. Mark as having pending changes
    useSyncStore.getState().setHasPendingChanges(true)
    expect(useSyncStore.getState().hasPendingChanges).toBe(true)

    // 3. Trigger sync
    const store = useSyncStore.getState()
    await store.sync()

    // 4. Verify sync completed
    const state = useSyncStore.getState()
    expect(state.status).toBe('success')
    expect(state.lastSyncTime).not.toBeNull()
    expect(state.lastSyncStats).not.toBeNull()
    expect(state.hasPendingChanges).toBe(false)
    expect(state.error).toBeNull()

    // 5. Verify data was synced
    const category = await db.categories.get('cat-1')
    expect(category?.syncedAt).not.toBeNull()
  })

  it('prevents concurrent syncs', async () => {
    // Start first sync
    const sync1 = useSyncStore.getState().sync()

    // Try to start second sync while first is running
    const state1 = useSyncStore.getState()
    expect(state1.status).toBe('syncing')

    const sync2 = useSyncStore.getState().sync()

    // Wait for both
    await Promise.all([sync1, sync2])

    // Only one sync should have run
    const state2 = useSyncStore.getState()
    expect(state2.status).toBe('success')
  })

  it('handles offline scenario gracefully', async () => {
    // Mock offline by stubbing navigator.onLine
    const originalOnline = navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    // Add local changes
    await db.categories.add({
      id: 'cat-offline',
      userId: 'test-user-id',
      name: 'Offline Category',
      color: '#00ff00',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    // Trigger sync
    await useSyncStore.getState().sync()

    // Should complete without error
    const state = useSyncStore.getState()
    expect(state.status).toBe('success')
    expect(state.lastSyncStats?.pushedCount).toBe(0)
    expect(state.lastSyncStats?.pulledCount).toBe(0)

    // Data should remain unsynced locally
    const category = await db.categories.get('cat-offline')
    expect(category?.syncedAt).toBeNull()

    // Restore
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnline,
    })
  })

  it('handles initial sync (restore from backup)', async () => {
    // Mock Supabase returning backup data
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      gt: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'backup-cat-1',
            user_id: 'test-user-id',
            name: 'Backup Category',
            color: '#0000ff',
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            synced_at: new Date().toISOString(),
            is_deleted: false,
          },
        ],
      }),
    })

    // Trigger initial sync
    await useSyncStore.getState().sync(true)

    // Verify data was restored
    const state = useSyncStore.getState()
    expect(state.lastSyncStats?.pulledCount).toBeGreaterThan(0)

    const category = await db.categories.get('backup-cat-1')
    expect(category).toBeDefined()
    expect(category?.name).toBe('Backup Category')
  })
})

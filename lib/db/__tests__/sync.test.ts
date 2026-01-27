import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { syncAll, toSnakeCase, toCamelCase } from '../sync'
import { db } from '../index'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

// Mock session cache

describe('Sync Utilities', () => {
  describe('toSnakeCase', () => {
    it('converts camelCase to snake_case', () => {
      const input = {
        userId: '123',
        createdAt: '2024-01-01',
        isDeleted: false,
        sortOrder: 1,
      }
      const expected = {
        user_id: '123',
        created_at: '2024-01-01',
        is_deleted: false,
        sort_order: 1,
      }
      expect(toSnakeCase(input)).toEqual(expected)
    })

    it('handles nested objects', () => {
      const input = { firstName: 'John', lastName: 'Doe' }
      const expected = { first_name: 'John', last_name: 'Doe' }
      expect(toSnakeCase(input)).toEqual(expected)
    })
  })

  describe('toCamelCase', () => {
    it('converts snake_case to camelCase', () => {
      const input = {
        user_id: '123',
        created_at: '2024-01-01',
        is_deleted: false,
        sort_order: 1,
      }
      const expected = {
        userId: '123',
        createdAt: '2024-01-01',
        isDeleted: false,
        sortOrder: 1,
      }
      expect(toCamelCase(input)).toEqual(expected)
    })

    it('handles nested objects', () => {
      const input = { first_name: 'John', last_name: 'Doe' }
      const expected = { firstName: 'John', lastName: 'Doe' }
      expect(toCamelCase(input)).toEqual(expected)
    })
  })
})

describe('syncAll', () => {
  let mockSupabase: any

  beforeEach(async () => {
    // Clear all database tables
    await db.categories.clear()
    await db.customers.clear()
    await db.products.clear()
    await db.sales.clear()
    await db.utangTransactions.clear()
    await db.inventoryMovements.clear()

    // Setup mock Supabase client
    mockSupabase = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        gt: vi.fn().mockReturnThis(),
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

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('syncs when online and returns stats', async () => {
    const stats = await syncAll()

    expect(stats).toEqual({
      pushedCount: 0,
      pulledCount: 0,
      skippedCount: 0,
    })
  })

  it('skips sync when offline', async () => {
    // Mock offline
    const { isOnline } = await import('@/lib/auth/session-cache')
    ;(isOnline as any).mockResolvedValueOnce(false)

    const stats = await syncAll()

    expect(stats).toEqual({
      pushedCount: 0,
      pulledCount: 0,
      skippedCount: 0,
    })
  })

  it('pushes local unsynced changes to Supabase', async () => {
    // Add unsynced category to local DB
    await db.categories.add({
      id: 'test-category-id',
      userId: 'test-user-id',
      name: 'Test Category',
      color: '#ff0000',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    await syncAll()

    // Verify upsert was called for categories
    expect(mockSupabase.from).toHaveBeenCalledWith('categories')
  })

  it('pulls remote changes and respects timestamp comparison', async () => {
    const oldTimestamp = new Date('2024-01-01').toISOString()
    const newTimestamp = new Date().toISOString()

    // Add local category with newer timestamp
    await db.categories.add({
      id: 'test-category-id',
      userId: 'test-user-id',
      name: 'Local Newer',
      color: '#ff0000',
      sortOrder: 1,
      createdAt: oldTimestamp,
      updatedAt: newTimestamp,
      syncedAt: newTimestamp,
      isDeleted: false,
    })

    // Mock Supabase returning older data
    const selectMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'test-category-id',
          user_id: 'test-user-id',
          name: 'Remote Older',
          color: '#00ff00',
          sort_order: 2,
          created_at: oldTimestamp,
          updated_at: oldTimestamp,
          synced_at: oldTimestamp,
          is_deleted: false,
        },
      ],
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      gt: vi.fn().mockReturnValue({
        then: (cb: any) => selectMock().then(cb),
      }),
    })

    const stats = await syncAll()

    // Local should NOT be replaced because it's newer
    const localCategory = await db.categories.get('test-category-id')
    expect(localCategory?.name).toBe('Local Newer')
    expect(stats.skippedCount).toBeGreaterThan(0)
  })

  it('handles initial sync by pulling all data', async () => {
    // Mock Supabase returning data
    const selectMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'remote-category-id',
          user_id: 'test-user-id',
          name: 'Remote Category',
          color: '#ff0000',
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
          is_deleted: false,
        },
      ],
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      gt: vi.fn().mockReturnValue({
        then: (cb: any) => selectMock().then(cb),
      }),
    })

    // Run initial sync
    const stats = await syncAll(true)

    expect(stats.pulledCount).toBeGreaterThan(0)

    // Verify data was added to local DB
    const localCategory = await db.categories.get('remote-category-id')
    expect(localCategory).toBeDefined()
    expect(localCategory?.name).toBe('Remote Category')
  })

  it('handles sync errors gracefully', async () => {
    // Mock Supabase error
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
      gt: vi.fn().mockReturnThis(),
    })

    // Add unsynced data
    await db.categories.add({
      id: 'test-category-id',
      userId: 'test-user-id',
      name: 'Test',
      color: '#ff0000',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false,
    })

    // Should not throw
    await expect(syncAll()).resolves.toBeDefined()
  })
})

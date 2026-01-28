# Testing Guide for TindaKo POS

This project uses **Vitest** for unit and integration testing, providing fast feedback on sync logic and database operations.

## Quick Start

```bash
# Run tests in watch mode (recommended during development)
pnpm test

# Run tests once (CI/CD)
pnpm test:run

# Run tests with UI (visual test runner)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Testing Stack

- **Vitest**: Fast unit test framework (10-20× faster than Jest)
- **React Testing Library**: Component testing
- **fake-indexeddb**: Mock IndexedDB for Dexie testing
- **MSW (Mock Service Worker)**: HTTP request mocking for Supabase

## Test Structure

```
lib/
  ├── db/
  │   └── __tests__/
  │       └── sync.test.ts           # Unit tests for sync utilities
  ├── stores/
  │   └── __tests__/
  │       └── sync-store.integration.test.ts  # Integration tests
  └── test-utils.tsx                  # Shared test utilities
```

## What's Tested

### ✅ Unit Tests (`lib/db/__tests__/sync.test.ts`)

- **toSnakeCase/toCamelCase**: Data format conversion
- **syncAll**: Core sync logic
  - Online/offline detection
  - Push local changes to Supabase
  - Pull remote changes with timestamp comparison
  - Initial sync (restore from backup)
  - Error handling

### ✅ Integration Tests (`lib/stores/__tests__/sync-store.integration.test.ts`)

- **Full sync workflow**: Local changes → Supabase → Success
- **Concurrent sync prevention**: Blocks duplicate syncs
- **Error state management**: Updates UI on failures
- **Offline mode**: Graceful degradation
- **Initial sync**: Backup restoration
- **Status lifecycle**: Success → Idle transition

## Writing Tests

### Example: Testing Sync Logic

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { syncAll } from '@/lib/db/sync'
import { db } from '@/lib/db'

describe('My Sync Feature', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.categories.clear()
  })

  it('syncs local changes to Supabase', async () => {
    // Add local data
    await db.categories.add({
      id: 'test-id',
      userId: 'user-1',
      name: 'Test Category',
      // ... other fields
    })

    // Run sync
    const stats = await syncAll()

    // Assert
    expect(stats.pushedCount).toBeGreaterThan(0)
  })
})
```

### Mocking Supabase

The test setup automatically mocks Supabase. You can customize it:

```typescript
import { createClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client')

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [...] }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  })),
}

;(createClient as any).mockReturnValue(mockSupabase)
```

## Test Coverage

Current coverage focuses on:
- ✅ Sync logic (push/pull/conflict resolution)
- ✅ State management (Zustand stores)
- ✅ Database operations (Dexie/IndexedDB)

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test:run

- name: Generate coverage
  run: pnpm test:coverage
```

## References

- [Next.js Testing Docs](https://nextjs.org/docs/app/guides/testing/vitest)
- [Vitest Guide](https://vitest.dev/guide/)
- [fake-indexeddb](https://www.npmjs.com/package/fake-indexeddb)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

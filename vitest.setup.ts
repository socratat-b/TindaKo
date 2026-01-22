import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Setup fake-indexedDB for Dexie testing
import 'fake-indexeddb/auto'

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Clear all mocks after each test
  vi.clearAllMocks()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Load real .env.local for integration tests, otherwise use mock values
// Integration tests (like logout-login-flow.test.tsx) need real Supabase
import dotenv from 'dotenv'
import path from 'path'

// Try to load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// If no real env vars loaded (unit tests), use mock values
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
}

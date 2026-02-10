/**
 * Google OAuth Tests
 *
 * Tests Google OAuth sign-in on login/signup pages, auth callback (Google flow),
 * and AuthProvider profile sync (IndexedDB <-> Supabase).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock framer-motion — cache components for stable React references
vi.mock('framer-motion', () => {
  const { forwardRef, createElement } = require('react')

  const componentCache = new Map()

  const motionHandler = {
    get(_target: unknown, prop: string) {
      if (!componentCache.has(prop)) {
        const Component = forwardRef((props: Record<string, unknown>, ref: unknown) => {
          const {
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            variants: _v,
            whileHover: _wh,
            whileTap: _wt,
            whileInView: _wi,
            layout: _l,
            layoutId: _li,
            ...rest
          } = props
          return createElement(prop, { ...rest, ref })
        })
        Component.displayName = `motion.${prop}`
        componentCache.set(prop, Component)
      }
      return componentCache.get(prop)
    },
  }

  return {
    motion: new Proxy({}, motionHandler),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Mock useAuth for page component tests
const mockUseAuth = vi.fn()
vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock Supabase browser client
// Use a mutable ref so AuthProvider tests can override getUser/from per test
const mockSignInWithOAuth = vi.fn()
const mockBrowserGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null })
const mockBrowserFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
})

const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockBrowserGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockBrowserFrom,
  }),
}))

// Mock Supabase server client (for callback route)
const mockExchangeCodeForSession = vi.fn()
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

// Mock seedProductCatalog
vi.mock('@/lib/db/seeders', () => ({
  seedProductCatalog: vi.fn().mockResolvedValue(undefined),
}))

// Capture router.push
const mockPush = vi.fn()
vi.mock('next/navigation', async () => {
  return {
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => ({
      get: vi.fn(),
    }),
    usePathname: () => '/',
  }
})

// ── Imports (after mocks) ──────────────────────────────────────────────────

import SignupPage from '@/app/(auth)/signup/page'
import LoginPage from '@/app/(auth)/login/page'
import { GET } from '@/app/(auth)/auth/callback/route'
import { NextRequest } from 'next/server'
import { AuthProvider } from '@/components/providers/auth-provider'
import { useAuthStore } from '@/lib/stores/auth-store'
import { db } from '@/lib/db'
import { seedProductCatalog } from '@/lib/db/seeders'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(url: string) {
  return new NextRequest(new URL(url))
}

function defaultAuth(overrides = {}) {
  return { isAuthenticated: false, isLoading: false, userId: null, email: null, storeName: null, avatarUrl: null, ...overrides }
}

// ════════════════════════════════════════════════════════════════════════════
// Google OAuth - Login/Signup Pages
// ════════════════════════════════════════════════════════════════════════════

describe('Google OAuth - Login/Signup Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue(defaultAuth())
  })

  it('Login: clicks Google calls signInWithOAuth with google provider and redirectTo', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })

    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/auth/callback') },
      })
    })
  })

  it('Login: OAuth error shows "failed to sign in" message', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'OAuth failed' } })

    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument()
    })
  })

  it('Login: OAuth throws shows "An error occurred"', async () => {
    mockSignInWithOAuth.mockRejectedValue(new Error('network'))

    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    })
  })

  it('Signup: clicks Google calls signInWithOAuth', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })

    render(<SignupPage />)
    fireEvent.click(screen.getByRole('button', { name: /sign up with google/i }))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/auth/callback') },
      })
    })
  })

  it('Signup: OAuth error shows "failed to sign up" message', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'OAuth failed' } })

    render(<SignupPage />)
    fireEvent.click(screen.getByRole('button', { name: /sign up with google/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to sign up/i)).toBeInTheDocument()
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Auth Callback - Google OAuth Flow
// ════════════════════════════════════════════════════════════════════════════

describe('Auth Callback - Google OAuth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates profile for first-time Google user with full_name, avatar_url, provider=google', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })

    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uuid-123',
          email: 'juan@gmail.com',
          app_metadata: { provider: 'google' },
          user_metadata: {
            full_name: 'Juan Dela Cruz',
            avatar_url: 'https://lh3.googleusercontent.com/photo.jpg',
          },
        },
      },
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation(() => {
      const callCount = mockFrom.mock.calls.length
      if (callCount === 1) {
        return { select: mockSelect }
      }
      return { upsert: mockUpsert }
    })

    const request = makeRequest('http://localhost:3000/auth/callback?code=google-code')
    const response = await GET(request)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'google-uuid-123',
        email: 'juan@gmail.com',
        store_name: "Juan Dela Cruz's Store",
        avatar_url: 'https://lh3.googleusercontent.com/photo.jpg',
        provider: 'google',
      }),
      { onConflict: 'id' },
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/pos')
  })

  it('falls back to name metadata when full_name is missing', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })

    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uuid-456',
          email: 'maria@gmail.com',
          app_metadata: { provider: 'google' },
          user_metadata: {
            name: 'Maria Santos',
            avatar_url: null,
          },
        },
      },
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation(() => {
      const callCount = mockFrom.mock.calls.length
      if (callCount === 1) {
        return { select: mockSelect }
      }
      return { upsert: mockUpsert }
    })

    const request = makeRequest('http://localhost:3000/auth/callback?code=google-code')
    await GET(request)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        store_name: "Maria Santos's Store",
      }),
      { onConflict: 'id' },
    )
  })

  it('skips profile creation for returning Google user', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uuid-123',
          email: 'returning@gmail.com',
          app_metadata: { provider: 'google' },
          user_metadata: { full_name: 'Returning User' },
        },
      },
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'google-uuid-123' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockReturnValue({ select: mockSelect })

    const request = makeRequest('http://localhost:3000/auth/callback?code=google-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/pos')

    // mockFrom was only called once (select for profile check), never for upsert
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('still redirects to /pos when profile creation fails (only logs warning)', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'insert error' } })

    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uuid-789',
          email: 'new@gmail.com',
          app_metadata: { provider: 'google' },
          user_metadata: { full_name: 'New User' },
        },
      },
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation(() => {
      const callCount = mockFrom.mock.calls.length
      if (callCount === 1) {
        return { select: mockSelect }
      }
      return { upsert: mockUpsert }
    })

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const request = makeRequest('http://localhost:3000/auth/callback?code=google-code')
    const response = await GET(request)

    // Still redirects to /pos even though profile creation failed
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/pos')
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Auth Callback] Profile create error:'),
      'insert error',
    )

    consoleWarnSpy.mockRestore()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// AuthProvider - Profile Sync
// ════════════════════════════════════════════════════════════════════════════

describe('AuthProvider - Profile Sync', () => {
  // For these tests we use the real Dexie db (fake-indexeddb) and real Zustand store.
  // The Supabase browser client mock functions (mockBrowserGetUser, mockBrowserFrom)
  // are defined at module scope and referenced by the vi.mock factory.
  // We override their implementation per test.

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset to defaults: no user, empty from
    mockBrowserGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockBrowserFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })
    // Reset auth store
    useAuthStore.setState({
      userId: null,
      email: null,
      storeName: null,
      avatarUrl: null,
      isAuthenticated: false,
      isLoading: true,
    })
    // Clear IndexedDB
    await db.userProfile.clear()
  })

  afterEach(async () => {
    await db.userProfile.clear()
  })

  it('loads from IndexedDB when offline (no Supabase user) and sets auth store', async () => {
    // Seed IndexedDB with a profile
    await db.userProfile.add({
      id: 'offline-uuid',
      email: 'offline@example.com',
      storeName: "Offline's Store",
      avatarUrl: null,
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>,
    )

    // Children render immediately
    expect(screen.getByTestId('child')).toBeInTheDocument()

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.userId).toBe('offline-uuid')
      expect(state.email).toBe('offline@example.com')
      expect(state.storeName).toBe("Offline's Store")
      expect(state.isLoading).toBe(false)
    })
  })

  it('syncs from Supabase when online and updates IndexedDB + auth store', async () => {
    mockBrowserGetUser.mockResolvedValue({
      data: { user: { id: 'online-uuid' } },
    })

    mockBrowserFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'online-uuid',
              email: 'online@example.com',
              store_name: "Online's Store",
              avatar_url: 'https://example.com/avatar.png',
              provider: 'google',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      }),
    })

    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>,
    )

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.userId).toBe('online-uuid')
      expect(state.email).toBe('online@example.com')
      expect(state.storeName).toBe("Online's Store")
      expect(state.avatarUrl).toBe('https://example.com/avatar.png')
      expect(state.isLoading).toBe(false)
    })

    // Verify IndexedDB was updated
    const profiles = await db.userProfile.toArray()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('online-uuid')
    expect(profiles[0].storeName).toBe("Online's Store")
  })

  it('prefers Supabase data over stale IndexedDB', async () => {
    // Seed stale local profile
    await db.userProfile.add({
      id: 'user-uuid',
      email: 'stale@example.com',
      storeName: 'Old Store Name',
      avatarUrl: null,
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    mockBrowserGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid' } },
    })

    mockBrowserFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'user-uuid',
              email: 'fresh@example.com',
              store_name: 'New Store Name',
              avatar_url: 'https://example.com/new-avatar.png',
              provider: 'google',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      }),
    })

    render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>,
    )

    await waitFor(() => {
      const state = useAuthStore.getState()
      // Should have the fresh Supabase data, not stale IndexedDB
      expect(state.storeName).toBe('New Store Name')
      expect(state.email).toBe('fresh@example.com')
    })
  })

  it('sets isLoading=false on getUser error', async () => {
    // getUser throws an error (network failure)
    mockBrowserGetUser.mockRejectedValue(new Error('Network error'))

    render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>,
    )

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  it('sets isLoading=false when profile fetch returns error', async () => {
    mockBrowserGetUser.mockResolvedValue({
      data: { user: { id: 'user-uuid' } },
    })

    mockBrowserFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'RLS policy violation' },
          }),
        }),
      }),
    })

    render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>,
    )

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  it('calls seedProductCatalog after init', async () => {
    render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(seedProductCatalog).toHaveBeenCalled()
    })
  })

  it('renders children immediately (not blocked by useEffect)', () => {
    render(
      <AuthProvider>
        <div data-testid="child-content">I should appear instantly</div>
      </AuthProvider>,
    )

    // Children are rendered synchronously, before useEffect completes
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('I should appear instantly')).toBeInTheDocument()
  })
})

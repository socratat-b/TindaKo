/**
 * Email Auth Tests
 *
 * Tests email signup/login pages and auth callback (email flow).
 * Mocks: Supabase client, useAuth hook, framer-motion, next/navigation.
 * Uses fake-indexeddb (loaded in vitest.setup.ts).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock framer-motion — replace motion.div with plain div, strip animation props
vi.mock('framer-motion', () => {
  const { forwardRef, createElement } = require('react')

  // Cache components so React sees stable references across renders
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

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock Supabase browser client
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

// Mock Supabase server client (for callback route tests)
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

// Capture router.push calls
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

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(url: string) {
  return new NextRequest(new URL(url))
}

function defaultAuth(overrides = {}) {
  return { isAuthenticated: false, isLoading: false, userId: null, email: null, storeName: null, avatarUrl: null, ...overrides }
}

// ════════════════════════════════════════════════════════════════════════════
// Email Signup - SignupPage
// ════════════════════════════════════════════════════════════════════════════

describe('Email Signup - SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue(defaultAuth())
  })

  it('renders form with email, password, confirm password, and Google button', () => {
    render(<SignupPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match (does not call signUp)', async () => {
    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different456' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error when password is too short (does not call signUp)', async () => {
    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: '12345' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '12345' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument()
    })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('calls signUp and shows "check your email" UI on success', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      expect(screen.getByText(/juan@example.com/i)).toBeInTheDocument()
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'juan@example.com',
      password: 'password123',
      options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
    })
  })

  it('shows friendly message when email already registered', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'exists@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument()
    })
  })

  it('shows friendly message on rate limit', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'rate limit exceeded' } })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/too many attempts/i)).toBeInTheDocument()
    })
  })

  it('passes through generic error message', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Something unexpected happened' } })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Something unexpected happened')).toBeInTheDocument()
    })
  })

  it('shows "An error occurred" when signUp throws', async () => {
    mockSignUp.mockRejectedValue(new Error('network error'))

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    })
  })

  it('redirects to /pos if already authenticated', () => {
    mockUseAuth.mockReturnValue(defaultAuth({ isAuthenticated: true }))

    render(<SignupPage />)

    expect(mockPush).toHaveBeenCalledWith('/pos')
  })

  it('shows loading spinner when isLoading is true', () => {
    mockUseAuth.mockReturnValue(defaultAuth({ isLoading: true }))

    render(<SignupPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('"Try a different email" resets the form', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /try a different email/i }))

    // Form should reappear with cleared fields
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue('')
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('')
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Email Login - LoginPage
// ════════════════════════════════════════════════════════════════════════════

describe('Email Login - LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue(defaultAuth())
  })

  it('renders form with email, password (no confirm), Sign In and Google buttons', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    // No confirm password field on login
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls signInWithPassword and redirects to /pos on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'juan@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/pos')
    })
  })

  it('shows error for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('shows error for unconfirmed email', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Email not confirmed' } })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'unconfirmed@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/confirm your account/i)).toBeInTheDocument()
    })
  })

  it('shows friendly message on rate limit', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'rate limit exceeded' } })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/too many attempts/i)).toBeInTheDocument()
    })
  })

  it('passes through generic error message', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Server error 500' } })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Server error 500')).toBeInTheDocument()
    })
  })

  it('shows "An error occurred" when signInWithPassword throws', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('network error'))

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const { container } = render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    expect(passwordInput).toHaveAttribute('type', 'password')

    // The toggle button is a sibling of the input inside div.relative
    const toggleButton = passwordInput.parentElement!.querySelector('button')!
    expect(toggleButton).toBeTruthy()

    await act(async () => {
      fireEvent.click(toggleButton)
    })

    expect(passwordInput).toHaveAttribute('type', 'text')

    await act(async () => {
      fireEvent.click(toggleButton)
    })

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('redirects to /pos if already authenticated', () => {
    mockUseAuth.mockReturnValue(defaultAuth({ isAuthenticated: true }))

    render(<LoginPage />)

    expect(mockPush).toHaveBeenCalledWith('/pos')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Auth Callback - Email Flow
// ════════════════════════════════════════════════════════════════════════════

describe('Auth Callback - Email Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login when no code param', async () => {
    const request = makeRequest('http://localhost:3000/auth/callback')

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('redirects to /login?error=auth_failed when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: 'Invalid code' } })

    const request = makeRequest('http://localhost:3000/auth/callback?code=bad-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=auth_failed')
  })

  it('creates profile for first-time email user with email prefix as store name', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })

    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-123',
          email: 'juan@example.com',
          app_metadata: { provider: 'email' },
          user_metadata: {},
        },
      },
    })

    // Profile does NOT exist
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'stores') {
        // First call: select('id').eq(...).maybeSingle() — profile check
        // Second call: upsert() — profile creation
        // We track call count via mockFrom.mock.calls.length
        const callCount = mockFrom.mock.calls.length
        if (callCount === 1) {
          return { select: mockSelect }
        }
        return { upsert: mockUpsert }
      }
      return {}
    })

    const request = makeRequest('http://localhost:3000/auth/callback?code=valid-code')
    const response = await GET(request)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-uuid-123',
        email: 'juan@example.com',
        store_name: "juan's Store",
        provider: 'email',
        avatar_url: null,
      }),
      { onConflict: 'id' },
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/pos')
  })

  it('skips profile creation for returning user and redirects to /pos', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-123',
          email: 'returning@example.com',
          app_metadata: { provider: 'email' },
          user_metadata: {},
        },
      },
    })

    // Profile DOES exist
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'user-uuid-123' } })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockReturnValue({ select: mockSelect })

    const request = makeRequest('http://localhost:3000/auth/callback?code=valid-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/pos')

    // upsert should NOT have been called since mockFrom only returns select chains
    // (no upsert method needed)
  })

  it('redirects to /login?error=auth_failed on unexpected exception', async () => {
    mockExchangeCodeForSession.mockRejectedValue(new Error('network error'))

    const request = makeRequest('http://localhost:3000/auth/callback?code=valid-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=auth_failed')
  })

  it('falls back to "My Store\'s Store" when no email or metadata', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })

    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-456',
          email: undefined,
          app_metadata: { provider: 'email' },
          user_metadata: {},
        },
      },
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'stores') {
        const callCount = mockFrom.mock.calls.length
        if (callCount === 1) {
          return { select: mockSelect }
        }
        return { upsert: mockUpsert }
      }
      return {}
    })

    const request = makeRequest('http://localhost:3000/auth/callback?code=valid-code')
    await GET(request)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        store_name: "My Store's Store",
      }),
      { onConflict: 'id' },
    )
  })
})

import { create } from 'zustand'

/**
 * Auth state for OAuth authentication
 * Managed by Supabase Auth, this store is for reactive UI state only
 * Session is stored in httpOnly cookies by Supabase
 */
interface AuthState {
  userId: string | null
  email: string | null
  storeName: string | null
  avatarUrl: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (
    userId: string,
    email: string,
    storeName: string,
    avatarUrl?: string | null
  ) => void
  setLoading: (isLoading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  storeName: null,
  avatarUrl: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (userId, email, storeName, avatarUrl = null) =>
    set({
      userId,
      email,
      storeName,
      avatarUrl,
      isAuthenticated: true,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () =>
    set({
      userId: null,
      email: null,
      storeName: null,
      avatarUrl: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}))

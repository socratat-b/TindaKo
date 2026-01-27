import { create } from 'zustand'

/**
 * Auth state for phone-based authentication
 * Note: Actual session (phone, pinHash) is stored separately in localStorage
 * This store is for reactive UI state only
 */
interface AuthState {
  phone: string | null
  storeName: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (phone: string, storeName: string) => void
  setLoading: (isLoading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  phone: null,
  storeName: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (phone, storeName) =>
    set({ phone, storeName, isAuthenticated: true, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () =>
    set({ phone: null, storeName: null, isAuthenticated: false, isLoading: false }),
}))

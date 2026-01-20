import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isOffline: boolean
  lastSyncTime: number | null
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setOffline: (isOffline: boolean) => void
  setLastSyncTime: (time: number | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isOffline: false,
      lastSyncTime: null,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setOffline: (isOffline) => set({ isOffline }),
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      clear: () => set({ user: null, isLoading: false, isOffline: false, lastSyncTime: null }),
    }),
    {
      name: 'tindako-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, lastSyncTime: state.lastSyncTime }),
    }
  )
)

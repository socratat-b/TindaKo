import { useAuthStore } from '@/lib/stores/auth-store'

/**
 * Auth hook for OAuth authentication
 * Returns current user info from Zustand store
 * Session is managed by Supabase Auth (httpOnly cookies)
 */
export function useAuth() {
  const { userId, email, storeName, avatarUrl, isAuthenticated, isLoading } =
    useAuthStore()

  return {
    userId,
    email,
    storeName,
    avatarUrl,
    isAuthenticated,
    isLoading,
  }
}

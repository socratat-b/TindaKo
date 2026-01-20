import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Simplified auth hook that returns user state.
 * For auth actions (login, signup, logout), use Server Actions directly with useActionState.
 */
export function useAuth() {
  const { user, isLoading, isOffline, lastSyncTime } = useAuthStore();

  return {
    user,
    isLoading,
    isOffline,
    lastSyncTime,
  };
}

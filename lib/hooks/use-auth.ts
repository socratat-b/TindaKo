import { useAuthStore } from "@/lib/stores/auth-store";
import { getCurrentPhone } from "@/lib/auth/session";

/**
 * Auth hook for phone-based authentication
 * Returns current user phone and store info
 */
export function useAuth() {
  const { phone, storeName, isAuthenticated, isLoading } = useAuthStore();

  return {
    phone: phone || getCurrentPhone(), // Fallback to session if store not hydrated
    storeName,
    isAuthenticated,
    isLoading,
  };
}

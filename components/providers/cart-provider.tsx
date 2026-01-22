'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCartStore } from '@/lib/stores/cart-store'

/**
 * Cart Provider - Synchronizes cart with current user
 * Automatically clears cart when user changes
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const setUserId = useCartStore((state) => state.setUserId)

  useEffect(() => {
    // Update cart userId when user changes
    if (user) {
      setUserId(user.id)
    } else {
      // User logged out - clear cart
      setUserId(null)
    }
  }, [user, setUserId])

  return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCartStore } from '@/lib/stores/cart-store'

/**
 * Cart Provider - Synchronizes cart with current user
 * Automatically clears cart when user changes
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const setUserId = useCartStore((state) => state.setUserId)

  useEffect(() => {
    // Update cart userId when user changes
    if (userId) {
      setUserId(userId)
    } else {
      // User logged out - clear cart
      setUserId(null)
    }
  }, [userId, setUserId])

  return <>{children}</>
}

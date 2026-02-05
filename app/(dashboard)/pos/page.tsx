'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import POSClient from './pos-client'

/**
 * POS Page - No auth checks, middleware handles protection
 * Loads instantly, offline-first
 */
export default function POSPage() {
  const { userId } = useAuth()

  // Just render the POS - middleware protects this route
  // userId might be null initially, but IndexedDB will have the data
  return <POSClient userId={userId || ''} />
}

'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import POSClient from './pos-client'

export default function POSPage() {
  const { userId, isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, show error message
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <p className="text-destructive">Please log in to access the POS</p>
      </div>
    )
  }

  return <POSClient userId={userId || ''} />
}

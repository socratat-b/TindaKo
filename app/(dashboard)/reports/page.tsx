'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import ReportsClient from './reports-client'

export default function ReportsPage() {
  const { phone, isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, show error message
  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-destructive">Please log in to access reports</p>
      </div>
    )
  }

  return <ReportsClient storePhone={phone || ''} />
}

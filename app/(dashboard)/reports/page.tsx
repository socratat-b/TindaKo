'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import ReportsClient from './reports-client'

export default function ReportsPage() {
  const { userId } = useAuth()
  return <ReportsClient userId={userId || ''} />
}

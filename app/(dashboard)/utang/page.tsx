'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import UtangClient from './utang-client'

export default function UtangPage() {
  const { userId } = useAuth()
  return <UtangClient userId={userId || ''} />
}

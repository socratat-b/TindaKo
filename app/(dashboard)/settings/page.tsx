'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import SettingsClient from './settings-client'

export default function SettingsPage() {
  const { userId } = useAuth()
  return <SettingsClient userId={userId || ''} />
}

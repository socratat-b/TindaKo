import { getUser } from '@/lib/dal'
import SettingsClient from './settings-client'

export const metadata = {
  title: 'Settings | TindaKo',
  description: 'Configure app settings and preferences',
}

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-destructive">Unable to load user session</p>
      </div>
    )
  }

  return <SettingsClient userId={user.id} />
}

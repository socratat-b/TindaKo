import { getUser } from '@/lib/dal'
import ReportsClient from './reports-client'

export const metadata = {
  title: 'Reports | TindaKo',
  description: 'View sales reports and analytics',
}

export default async function ReportsPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-destructive">Unable to load user session</p>
      </div>
    )
  }

  return <ReportsClient userId={user.id} />
}

import { getUser } from '@/lib/dal'
import POSClient from './pos-client'

export default async function POSPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <p className="text-destructive">Unable to load user session</p>
      </div>
    )
  }

  return <POSClient userId={user.id} />
}

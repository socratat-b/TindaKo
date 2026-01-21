import { Metadata } from 'next'
import { getUser } from '@/lib/dal'
import UtangClient from './utang-client'

export const metadata: Metadata = {
  title: 'Utang - TindaKo',
  description: 'Customer credit tracking and payment management',
}

export default async function UtangPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  return <UtangClient userId={user.id} />
}

import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Cached session verification - PRIMARY security check
export const verifySession = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
    redirect('/login')
  }

  return { isAuth: true, userId: user.id, user }
})

// Cached user data fetch
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Return only necessary fields (DTO pattern)
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
  }
})

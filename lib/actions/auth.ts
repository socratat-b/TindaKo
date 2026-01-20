'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // May require email confirmation depending on Supabase settings
  if (data.session) {
    // Session will be cached by AuthProvider on client side
    revalidatePath('/', 'layout')
    redirect('/pos')
  }

  return { success: true, requiresConfirmation: !data.session }
}

export async function login(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Session will be cached by AuthProvider on client side
  revalidatePath('/', 'layout')
  redirect('/pos')
}

export async function logout() {
  const supabase = await createClient()

  // Session cache will be cleared by AuthProvider on client side
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

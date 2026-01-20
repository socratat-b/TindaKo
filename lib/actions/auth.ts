'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthState = {
  error?: string
  success?: string
}

export async function signupAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  // Validate password length
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

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

  return { success: 'Account created! Please check your email to confirm your account.' }
}

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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

export async function logoutAction() {
  const supabase = await createClient()

  // Session cache will be cleared by AuthProvider on client side
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

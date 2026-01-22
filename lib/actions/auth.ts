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

  // Validate password length
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createClient()

  let data, error
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
    })
    data = result.data
    error = result.error
  } catch (err) {
    // Network error during signup
    const errorMsg = err instanceof Error ? err.message?.toLowerCase() : ''
    const causeMsg = (err as any)?.cause?.message?.toLowerCase() || ''
    const errorCode = (err as any)?.cause?.code || ''

    const isNetworkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('enotfound') ||
      causeMsg.includes('enotfound') ||
      errorCode === 'ENOTFOUND'

    if (isNetworkError) {
      return { error: 'Internet connection required to create an account. Please connect to the internet and try again.' }
    }

    return { error: 'An unexpected error occurred. Please try again.' }
  }

  if (error) {
    // Check if it's a network-related error
    const errorMsg = error.message?.toLowerCase() || ''
    const isNetworkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('enotfound') ||
      errorMsg.includes('connection')

    if (isNetworkError) {
      return { error: 'Internet connection required to create an account. Please connect to the internet and try again.' }
    }

    return { error: error.message }
  }

  // Email confirmation is disabled - user is immediately signed in
  if (data.session) {
    // Session will be cached by AuthProvider on client side
    revalidatePath('/', 'layout')
    redirect('/pos')
  }

  return { success: 'Account created successfully!' }
}

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  let error
  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    error = result.error
  } catch (err) {
    // Network error during login
    const errorMsg = err instanceof Error ? err.message?.toLowerCase() : ''
    const causeMsg = (err as any)?.cause?.message?.toLowerCase() || ''
    const errorCode = (err as any)?.cause?.code || ''

    const isNetworkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('enotfound') ||
      causeMsg.includes('enotfound') ||
      errorCode === 'ENOTFOUND'

    if (isNetworkError) {
      return { error: 'Internet connection required to sign in. Please connect to the internet and try again.' }
    }

    return { error: 'An unexpected error occurred. Please try again.' }
  }

  if (error) {
    // Check if it's a network-related error
    const errorMsg = error.message?.toLowerCase() || ''
    const isNetworkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('enotfound') ||
      errorMsg.includes('connection')

    if (isNetworkError) {
      return { error: 'Internet connection required to sign in. Please connect to the internet and try again.' }
    }

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

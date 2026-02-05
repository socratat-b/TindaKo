import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OAuth Callback Route
 * Handles the redirect from Google/Facebook OAuth
 * Following Next.js authentication patterns
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[OAuth Callback] Error exchanging code:', error)
      // Redirect to login with error
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if user profile exists in Supabase
      const { data: profile, error: profileError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle to avoid 406 error when no match

      if (profileError || !profile) {
        // First-time user - redirect to store setup
        console.log('[OAuth Callback] First-time user, redirecting to setup')
        return NextResponse.redirect(`${origin}/store-setup`)
      }

      // Existing user - redirect to POS
      console.log('[OAuth Callback] Returning user, redirecting to POS')
      return NextResponse.redirect(`${origin}/pos`)
    }
  }

  // No code or no user - redirect to login
  return NextResponse.redirect(`${origin}/login`)
}

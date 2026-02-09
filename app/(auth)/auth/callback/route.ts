import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth Callback Route
 * Handles OAuth redirect and email verification
 * Creates Supabase profile for first-time users using their Google name or email
 * All users go straight to /pos — no store-setup step needed
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    try {
      const supabase = await createClient()

      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Auth Callback] Error exchanging code:', error.message)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      }

      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile already exists
        const { data: profile } = await supabase
          .from('stores')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile) {
          // First-time user — create profile with Google name or email prefix as store name
          const provider = user.app_metadata.provider === 'google' ? 'google' : 'email'
          const avatarUrl = user.user_metadata?.avatar_url || null
          const displayName = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email?.split('@')[0]
            || 'My Store'
          const storeName = `${displayName}'s Store`

          const { error: insertError } = await supabase.from('stores').upsert({
            id: user.id,
            email: user.email,
            store_name: storeName,
            avatar_url: avatarUrl,
            provider,
          }, { onConflict: 'id' })

          if (insertError) {
            console.warn('[Auth Callback] Profile create error:', insertError.message)
          } else {
            console.log('[Auth Callback] New user profile created:', storeName)
          }
        }

        // All users go straight to POS
        return NextResponse.redirect(`${origin}/pos`)
      }
    } catch (err) {
      console.error('[Auth Callback] Unexpected error:', err)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}

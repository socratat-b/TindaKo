import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Proxy (Middleware) - Optimistic Auth Checks
 * Following Next.js authentication patterns
 *
 * IMPORTANT: Only performs optimistic checks using cookies
 * Secure checks must be done in the Data Access Layer (DAL)
 */

// Specify protected and public routes
const protectedRoutes = ['/pos', '/products', '/inventory', '/utang', '/reports', '/settings']
// Auth routes: only for unauthenticated users — redirect to /pos if already logged in
const authRoutes = ['/login', '/signup', '/']
// Store setup: post-login step, redirect to /pos if already logged in
const postAuthSetupRoutes = ['/store-setup']
// Always public: accessible regardless of auth state
const alwaysPublicRoutes = ['/privacy-policy', '/terms-of-service', '/data-deletion']
const authCallbackRoutes = ['/auth/callback']

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check route type
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.includes(path)
  const isPostAuthSetupRoute = postAuthSetupRoutes.includes(path)
  const isAlwaysPublic = alwaysPublicRoutes.some(route => path.startsWith(route))
  const isAuthCallback = authCallbackRoutes.some(route => path.startsWith(route))

  let response = NextResponse.next({ request })

  // Create Supabase client for cookie-based session check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so Supabase can read its own writes
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Recreate response with updated request cookies
          response = NextResponse.next({ request })
          // Set cookies on response so browser receives them
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - validates with Supabase server and refreshes tokens
  const { data: { user } } = await supabase.auth.getUser()
  const hasSession = !!user

  // Allow auth callback routes and static assets
  if (isAuthCallback || path.startsWith('/_next') || path.startsWith('/api')) {
    return response
  }

  // Always public routes — no auth check needed
  if (isAlwaysPublic) {
    return response
  }

  // Authenticated users shouldn't access login/signup/home or store-setup → send to /pos
  if (hasSession && (isAuthRoute || isPostAuthSetupRoute)) {
    return NextResponse.redirect(new URL('/pos', request.url))
  }

  // Unauthenticated users can't access protected routes → send to /login
  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Unauthenticated users on store-setup → send to /login
  if (!hasSession && isPostAuthSetupRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw.js).*)',
  ],
}

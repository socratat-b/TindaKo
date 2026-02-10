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
const publicRoutes = ['/login', '/signup', '/', '/store-setup', '/privacy-policy', '/terms-of-service', '/data-deletion']
const authCallbackRoutes = ['/auth/callback']

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if current route is protected or public
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)
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

  // Allow auth callback routes
  if (isAuthCallback) {
    return response
  }

  // Allow public routes (static assets, API routes)
  if (path.startsWith('/_next') || path.startsWith('/api')) {
    return response
  }

  // Redirect authenticated users away from auth pages
  if (hasSession && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/pos', request.url))
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw.js).*)',
  ],
}

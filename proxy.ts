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

  // Create Supabase client for cookie-based session check (optimistic)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Optimistic check: read session from cookie only (no DB query)
  const { data: { session } } = await supabase.auth.getSession()
  const hasSession = !!session

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

import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for phone-based auth
 * Checks for auth cookie (set by client after login)
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup')
  const isPublicPage = path === '/' || path.startsWith('/_next') || path.startsWith('/api')
  const isDashboardPage = path.startsWith('/pos') ||
                          path.startsWith('/products') ||
                          path.startsWith('/inventory') ||
                          path.startsWith('/utang') ||
                          path.startsWith('/reports') ||
                          path.startsWith('/settings')

  // Check for auth cookie (contains phone number)
  const authCookie = request.cookies.get('tindako_auth')
  const hasSession = !!authCookie?.value

  // Allow public pages without redirect
  if (isPublicPage) {
    return NextResponse.next({ request })
  }

  // Redirect authenticated users away from auth pages
  if (hasSession && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/pos'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users to login
  if (!hasSession && isDashboardPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw.js).*)',
  ],
}

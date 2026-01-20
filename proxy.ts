import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // OPTIMISTIC CHECK ONLY - refresh session
  // Gracefully handle network errors (allow through, DAL handles offline validation)
  let user = null
  let networkError = false

  try {
    const { data, error } = await supabase.auth.getUser()
    user = data?.user ?? null

    // Check for network errors vs auth errors
    if (error && error.message?.includes('network')) {
      networkError = true
    }
  } catch {
    // Network error: allow through, DAL will validate with cached session
    networkError = true
  }

  const path = request.nextUrl.pathname
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup')
  const isPublicPage = path === '/' || path.startsWith('/_next') || path.startsWith('/api')
  const isDashboardPage = path.startsWith('/pos') ||
                          path.startsWith('/products') ||
                          path.startsWith('/inventory') ||
                          path.startsWith('/utang') ||
                          path.startsWith('/reports') ||
                          path.startsWith('/settings')

  // If network error, allow through (DAL handles offline validation)
  if (networkError) {
    return supabaseResponse
  }

  // Allow public pages without redirect
  if (isPublicPage) {
    return supabaseResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/pos'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users to login (optimistic)
  // Real security check happens in DAL
  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw.js).*)',
  ],
}

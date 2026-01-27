'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'

/**
 * Prefetches all dashboard pages after user login
 * This ensures all pages are cached and available offline
 */
export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const { phone } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    // Only prefetch if user is authenticated and on a dashboard page
    if (!phone) return

    const isDashboardPage =
      pathname.startsWith('/pos') ||
      pathname.startsWith('/products') ||
      pathname.startsWith('/inventory') ||
      pathname.startsWith('/utang') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/settings')

    if (!isDashboardPage) return

    // Check if we've already prefetched for this user
    const prefetchKey = `prefetched_${phone}`
    if (typeof window !== 'undefined' && localStorage.getItem(prefetchKey)) {
      return
    }

    // Prefetch all dashboard pages in the background
    const pagesToPrefetch = [
      '/pos',
      '/products',
      '/inventory',
      '/utang',
      '/reports',
      '/settings',
    ]

    const prefetchPages = async () => {
      console.log('[PrefetchProvider] Starting background prefetch of dashboard pages...')

      try {
        // Use fetch with no-store to trigger NetworkFirst caching without displaying
        const fetchPromises = pagesToPrefetch.map(async (url) => {
          try {
            await fetch(url, {
              method: 'GET',
              credentials: 'same-origin',
              cache: 'no-store', // Force network request to populate cache
            })
            console.log(`[PrefetchProvider] Cached: ${url}`)
          } catch (err) {
            // Ignore errors (might be offline)
            console.warn(`[PrefetchProvider] Failed to cache ${url}:`, err)
          }
        })

        await Promise.all(fetchPromises)

        // Mark as prefetched for this user
        if (typeof window !== 'undefined') {
          localStorage.setItem(prefetchKey, Date.now().toString())
        }

        console.log('[PrefetchProvider] All dashboard pages cached! App ready for offline use.')
      } catch (err) {
        console.error('[PrefetchProvider] Prefetch error:', err)
      }
    }

    // Delay prefetch slightly to not interfere with initial page load
    const timeoutId = setTimeout(prefetchPages, 2000)

    return () => clearTimeout(timeoutId)
  }, [phone, pathname])

  return <>{children}</>
}

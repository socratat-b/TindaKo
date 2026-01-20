'use client'

import { useState, useEffect } from 'react'

/**
 * React hook to track online/offline status
 * Listens to browser events and performs periodic checks
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    // Update online status based on browser events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic check every 30 seconds (browser events aren't always reliable)
    const intervalId = setInterval(() => {
      setIsOnline(navigator.onLine)
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(intervalId)
    }
  }, [])

  return isOnline
}

'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

/**
 * Hook for displaying real-time clock
 * Updates every minute
 */
export function useClock(timezone: string = 'Asia/Manila') {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Initial time
    const updateTime = () => {
      try {
        const now = new Date()
        const formattedTime = formatInTimeZone(now, timezone, 'h:mm a')
        setTime(formattedTime)
      } catch (error) {
        // Fallback to local time if timezone is invalid
        setTime(format(new Date(), 'h:mm a'))
      }
    }

    updateTime()

    // Update every minute
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [timezone])

  return time
}

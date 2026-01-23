'use client'

import { useEffect } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { useSettingsStore } from '@/lib/stores/settings-store'

/**
 * Internal component to sync next-themes with Zustand store
 */
function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const zustandTheme = useSettingsStore((state) => state.theme)
  const updateSettings = useSettingsStore((state) => state.updateSettings)

  // Sync Zustand theme to next-themes on mount
  useEffect(() => {
    if (zustandTheme && zustandTheme !== theme) {
      setTheme(zustandTheme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync next-themes back to Zustand when it changes externally
  useEffect(() => {
    if (theme && theme !== zustandTheme) {
      updateSettings({ theme: theme as 'light' | 'dark' | 'system' })
    }
  }, [theme, zustandTheme, updateSettings])

  return <>{children}</>
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="tindako-theme"
      themes={['light', 'dark', 'system']}
    >
      <ThemeSync>
        {children}
      </ThemeSync>
    </NextThemesProvider>
  )
}

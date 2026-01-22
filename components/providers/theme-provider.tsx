'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useSettingsStore } from '@/lib/stores/settings-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.theme)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const [mounted, setMounted] = useState(false)

  // Prevent flash on initial load
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem
      disableTransitionOnChange
      forcedTheme={undefined}
      storageKey="tindako-theme"
      themes={['light', 'dark', 'system']}
      value={{
        light: 'light',
        dark: 'dark',
        system: 'system'
      }}
    >
      {children}
    </NextThemesProvider>
  )
}

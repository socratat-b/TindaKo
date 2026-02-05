'use client'

import { Button } from '@/components/ui/button'
import { Menu, Clock } from 'lucide-react'
import { useClock } from '@/lib/hooks/use-clock'
import { useSettings } from '@/lib/hooks/use-settings'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { timezone } = useSettings()
  const currentTime = useClock(timezone)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-200 bg-gradient-to-r from-white via-orange-50/50 to-amber-50/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 gap-2 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 hover:bg-orange-100"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent sm:text-lg whitespace-nowrap">
            TindaKo
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground shrink-0">
          <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          <span className="font-medium tabular-nums whitespace-nowrap">{currentTime}</span>
        </div>
      </div>
    </header>
  )
}

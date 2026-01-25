'use client'

import { Button } from '@/components/ui/button'
import { SyncIndicator } from './sync-indicator'
import { PendingChangesIndicator } from './pending-changes-indicator'
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-bold text-primary sm:text-lg">
            TindaKo
          </h1>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <PendingChangesIndicator />
          <SyncIndicator />

          <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            <span className="font-medium tabular-nums">{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

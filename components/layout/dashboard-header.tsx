'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { logoutAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { SyncIndicator } from './sync-indicator'
import { Menu, LogOut, User } from 'lucide-react'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useAuth()

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

        <div className="flex items-center gap-4">
          <SyncIndicator />

          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}

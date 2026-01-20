'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { logoutAction } from '@/lib/actions/auth'

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">TindaKo POS</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user?.email}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

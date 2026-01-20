'use client'

import { useAuth } from '@/lib/hooks/use-auth'

export function DashboardHeader() {
  const { user, signOut, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-emerald-600">TindaKo POS</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-600">
            {user?.email}
          </div>
          <button
            onClick={() => signOut()}
            disabled={isLoading}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  )
}

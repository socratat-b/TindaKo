'use client'

import { useState } from 'react'
import { DashboardHeader } from './dashboard-header'
import { Sidebar } from './sidebar'
import { PrefetchProvider } from '@/components/providers/prefetch-provider'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <PrefetchProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1 p-3 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </PrefetchProvider>
  )
}

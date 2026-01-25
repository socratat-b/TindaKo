'use client'

import { useState } from 'react'
import { DashboardHeader } from './dashboard-header'
import { Sidebar } from './sidebar'
import { AuthInitializer } from './auth-initializer'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AuthInitializer />
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
  )
}

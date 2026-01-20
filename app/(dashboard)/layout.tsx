import { verifySession } from '@/lib/dal'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // PRIMARY SECURITY CHECK - will redirect if not authenticated
  await verifySession()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}

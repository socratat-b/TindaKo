import { verifySession } from '@/lib/dal'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // PRIMARY SECURITY CHECK - will redirect if not authenticated
  await verifySession()

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
}

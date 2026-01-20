import { verifySession } from '@/lib/dal'
import { DashboardLayout as DashboardLayoutWrapper } from '@/components/layout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // PRIMARY SECURITY CHECK - will redirect if not authenticated
  await verifySession()

  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
}

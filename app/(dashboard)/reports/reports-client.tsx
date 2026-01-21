'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReportsClientProps {
  userId: string
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly'

export default function ReportsClient({ userId }: ReportsClientProps) {
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>('daily')

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          View sales reports and analytics
        </p>
      </div>

      {/* Period Tabs */}
      <div className="border-b p-4">
        <div className="flex gap-2">
          <Button
            variant={activePeriod === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePeriod('daily')}
          >
            Daily
          </Button>
          <Button
            variant={activePeriod === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePeriod('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={activePeriod === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePeriod('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-lg font-semibold mb-2">
              {activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Reports
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Sales reports and analytics will be displayed here.
              This feature is coming soon.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

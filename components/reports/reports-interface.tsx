'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart3, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangeFilter } from './date-range-filter';
import { SalesStatsCards } from './sales-stats-cards';
import { PaymentBreakdown } from './payment-breakdown';
import { SalesList } from './sales-list';
import {
  filterSalesByDateRange,
  calculateSalesStats,
  type DateRangePreset,
} from '@/lib/utils/reports-utils';

interface ReportsInterfaceProps {
  userId: string;
}

export default function ReportsInterface({ userId }: ReportsInterfaceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Fetch all sales for the user
  const allSales = useLiveQuery(
    () =>
      db.sales
        .where('userId')
        .equals(userId)
        .filter((s) => !s.isDeleted)
        .reverse()
        .sortBy('createdAt'),
    [userId]
  );

  // Check for pending changes (not synced)
  const pendingChangesCount = useLiveQuery(async () => {
    const count = await db.sales
      .where('userId')
      .equals(userId)
      .filter((s) => !s.isDeleted && s.syncedAt === null)
      .count();
    return count;
  }, [userId]);

  // Filter sales by date range
  const filteredSales = filterSalesByDateRange(
    allSales || [],
    dateRangePreset,
    customStartDate,
    customEndDate
  );

  // Calculate statistics
  const stats = calculateSalesStats(filteredSales);

  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    // Reset custom dates when switching to a preset
    if (preset !== 'custom') {
      setCustomStartDate(null);
      setCustomEndDate(null);
    } else {
      // Set default custom dates to today
      const now = new Date();
      setCustomStartDate(now);
      setCustomEndDate(now);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-3 md:space-y-6 md:p-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
          <h1 className="text-xl font-bold md:text-2xl">Sales Reports</h1>
        </div>
        <p className="text-xs text-muted-foreground md:text-sm">
          View and analyze your sales performance
        </p>
      </div>

      {/* Pending Changes Indicator */}
      {pendingChangesCount !== undefined && pendingChangesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge variant="outline" className="gap-1.5">
            <AlertCircle className="h-3 w-3" />
            <span className="text-[10px]">
              {pendingChangesCount} {pendingChangesCount === 1 ? 'sale' : 'sales'} not backed up
            </span>
          </Badge>
        </motion.div>
      )}

      {/* Date Range Filter */}
      <DateRangeFilter
        preset={dateRangePreset}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onPresetChange={handlePresetChange}
        onCustomStartChange={setCustomStartDate}
        onCustomEndChange={setCustomEndDate}
      />

      {/* Stats Cards */}
      <SalesStatsCards stats={stats} />

      {/* Tabs for Overview and Detailed Transactions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-xs md:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs md:text-sm">
            Detailed Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4 md:mt-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold md:text-base">
              Payment Method Breakdown
            </h2>
            <PaymentBreakdown stats={stats} />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4 space-y-4 md:mt-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold md:text-base">
              All Transactions ({filteredSales.length})
            </h2>
            <SalesList sales={filteredSales} />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

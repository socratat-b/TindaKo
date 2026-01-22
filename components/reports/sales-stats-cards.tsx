'use client';

import { motion } from 'framer-motion';
import { DollarSign, Receipt, TrendingUp, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SalesStats } from '@/lib/utils/reports-utils';

interface SalesStatsCardsProps {
  stats: SalesStats;
}

export function SalesStatsCards({ stats }: SalesStatsCardsProps) {
  const cards = [
    {
      title: 'Total Sales',
      value: `₱${stats.totalSales.toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
    {
      title: 'Transactions',
      value: stats.transactionCount.toString(),
      icon: Receipt,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Avg Transaction',
      value: `₱${stats.averageTransaction.toFixed(2)}`,
      icon: TrendingUp,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Discount',
      value: `₱${stats.totalDiscount.toFixed(2)}`,
      icon: Tag,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground md:text-xs">
                      {card.title}
                    </p>
                    <p className="mt-1 text-lg font-bold md:text-2xl">
                      {card.value}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2 ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 md:h-5 md:w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

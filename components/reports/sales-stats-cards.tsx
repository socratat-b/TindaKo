'use client';

import { motion } from 'framer-motion';
import { DollarSign, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFormatCurrency } from '@/lib/utils/currency';
import type { SalesStats } from '@/lib/utils/reports-utils';

interface SalesStatsCardsProps {
  stats: SalesStats;
}

export function SalesStatsCards({ stats }: SalesStatsCardsProps) {
  const formatCurrency = useFormatCurrency();

  const cards = [
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      bgColor: 'bg-gradient-to-br from-orange-500/10 to-amber-500/10',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Transactions',
      value: stats.transactionCount.toString(),
      icon: Receipt,
      bgColor: 'bg-accent/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
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

'use client';

import { motion } from 'framer-motion';
import { Banknote, Smartphone, CreditCard, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SalesStats } from '@/lib/utils/reports-utils';

interface PaymentBreakdownProps {
  stats: SalesStats;
}

export function PaymentBreakdown({ stats }: PaymentBreakdownProps) {
  const paymentMethods = [
    {
      name: 'Cash',
      key: 'cash' as const,
      icon: Banknote,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
    {
      name: 'GCash',
      key: 'gcash' as const,
      icon: Smartphone,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Card',
      key: 'card' as const,
      icon: CreditCard,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Utang',
      key: 'utang' as const,
      icon: FileText,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
  ];

  const hasAnyData = stats.transactionCount > 0;

  if (!hasAnyData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No payment data for this period
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {paymentMethods.map((method, index) => {
        const Icon = method.icon;
        const data = stats.paymentBreakdown[method.key];

        return (
          <motion.div
            key={method.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground md:text-xs">
                      {method.name}
                    </p>
                    <p className="mt-1 text-sm font-bold md:text-lg">
                      ₱{data.total.toFixed(2)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[9px] text-muted-foreground md:text-[10px]">
                        {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
                      </p>
                      <span className="text-[9px] text-muted-foreground md:text-[10px]">•</span>
                      <p className="text-[9px] font-medium text-muted-foreground md:text-[10px]">
                        {data.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-lg p-2 ${method.bgColor}`}>
                    <Icon className={`h-4 w-4 md:h-5 md:w-5 ${method.iconColor}`} />
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

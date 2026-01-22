import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isWithinInterval,
  format,
} from 'date-fns';
import type { Sale } from '@/lib/db/schema';

export type DateRangePreset = 'today' | 'thisWeek' | 'thisMonth' | 'last30Days' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SalesStats {
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  totalDiscount: number;
  paymentBreakdown: {
    cash: { count: number; total: number; percentage: number };
    gcash: { count: number; total: number; percentage: number };
    card: { count: number; total: number; percentage: number };
    utang: { count: number; total: number; percentage: number };
  };
}

/**
 * Calculate date range from preset or custom dates
 */
export function getDateRange(
  preset: DateRangePreset,
  customStart?: Date | null,
  customEnd?: Date | null
): DateRange {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };

    case 'thisWeek':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case 'thisMonth':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };

    case 'last30Days':
      return {
        start: startOfDay(subDays(now, 30)),
        end: endOfDay(now),
      };

    case 'custom':
      if (customStart && customEnd) {
        return {
          start: startOfDay(customStart),
          end: endOfDay(customEnd),
        };
      }
      // Fallback to today if custom dates are invalid
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };

    default:
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
  }
}

/**
 * Filter sales by date range
 */
export function filterSalesByDateRange(
  sales: Sale[],
  preset: DateRangePreset,
  customStart?: Date | null,
  customEnd?: Date | null
): Sale[] {
  const { start, end } = getDateRange(preset, customStart, customEnd);

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return isWithinInterval(saleDate, { start, end });
  });
}

/**
 * Calculate comprehensive sales statistics
 */
export function calculateSalesStats(sales: Sale[]): SalesStats {
  if (sales.length === 0) {
    return {
      totalSales: 0,
      transactionCount: 0,
      averageTransaction: 0,
      totalDiscount: 0,
      paymentBreakdown: {
        cash: { count: 0, total: 0, percentage: 0 },
        gcash: { count: 0, total: 0, percentage: 0 },
        card: { count: 0, total: 0, percentage: 0 },
        utang: { count: 0, total: 0, percentage: 0 },
      },
    };
  }

  // Calculate totals
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
  const transactionCount = sales.length;
  const averageTransaction = totalSales / transactionCount;

  // Calculate payment method breakdown
  const paymentMethods = {
    cash: { count: 0, total: 0 },
    gcash: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
    utang: { count: 0, total: 0 },
  };

  sales.forEach((sale) => {
    const method = sale.paymentMethod.toLowerCase() as keyof typeof paymentMethods;
    if (paymentMethods[method]) {
      paymentMethods[method].count += 1;
      paymentMethods[method].total += sale.total;
    }
  });

  // Calculate percentages
  const paymentBreakdown = {
    cash: {
      ...paymentMethods.cash,
      percentage: totalSales > 0 ? (paymentMethods.cash.total / totalSales) * 100 : 0,
    },
    gcash: {
      ...paymentMethods.gcash,
      percentage: totalSales > 0 ? (paymentMethods.gcash.total / totalSales) * 100 : 0,
    },
    card: {
      ...paymentMethods.card,
      percentage: totalSales > 0 ? (paymentMethods.card.total / totalSales) * 100 : 0,
    },
    utang: {
      ...paymentMethods.utang,
      percentage: totalSales > 0 ? (paymentMethods.utang.total / totalSales) * 100 : 0,
    },
  };

  return {
    totalSales,
    transactionCount,
    averageTransaction,
    totalDiscount,
    paymentBreakdown,
  };
}

/**
 * Format date range for display
 */
export function formatDateRangeDisplay(
  preset: DateRangePreset,
  customStart?: Date | null,
  customEnd?: Date | null
): string {
  const { start, end } = getDateRange(preset, customStart, customEnd);

  switch (preset) {
    case 'today':
      return format(start, 'MMMM d, yyyy');

    case 'thisWeek':
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;

    case 'thisMonth':
      return format(start, 'MMMM yyyy');

    case 'last30Days':
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;

    case 'custom':
      return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;

    default:
      return format(start, 'MMMM d, yyyy');
  }
}

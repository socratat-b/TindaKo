'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFormatCurrency } from '@/lib/utils/currency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Sale } from '@/lib/db/schema';

interface SalesListProps {
  sales: Sale[];
}

function getPaymentMethodBadgeVariant(method: string): 'default' | 'secondary' | 'outline' {
  const lowercaseMethod = method.toLowerCase();
  switch (lowercaseMethod) {
    case 'cash':
      return 'default';
    case 'gcash':
      return 'secondary';
    case 'card':
      return 'outline';
    case 'utang':
      return 'outline';
    default:
      return 'default';
  }
}

function formatItems(items: Sale['items']): string {
  if (!items || items.length === 0) return 'No items';

  const maxDisplay = 2;
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;

  const itemsText = displayItems
    .map((item) => `${item.quantity}x ${item.productName}`)
    .join(', ');

  if (remainingCount > 0) {
    return `${itemsText}, +${remainingCount} more`;
  }

  return itemsText;
}

export function SalesList({ sales }: SalesListProps) {
  const formatCurrency = useFormatCurrency();

  if (sales.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <Receipt className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No sales found for this period
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="w-[120px]">Payment</TableHead>
                <TableHead className="w-[120px] text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(new Date(sale.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(sale.createdAt), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatItems(sale.items)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentMethodBadgeVariant(sale.paymentMethod)}>
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">
                        {formatCurrency(sale.total)}
                      </span>
                      {sale.discount > 0 && (
                        <span className="text-xs text-orange-600">
                          -{formatCurrency(sale.discount)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-2 md:hidden">
        {sales.map((sale, index) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">
                        {format(new Date(sale.createdAt), 'MMM d, yyyy')}
                      </p>
                      <span className="text-[9px] text-muted-foreground">
                        {format(new Date(sale.createdAt), 'h:mm a')}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatItems(sale.items)}
                    </p>
                    <div className="mt-2">
                      <Badge
                        variant={getPaymentMethodBadgeVariant(sale.paymentMethod)}
                        className="text-[9px]"
                      >
                        {sale.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(sale.total)}
                    </p>
                    {sale.discount > 0 && (
                      <p className="text-[9px] text-orange-600">
                        -{formatCurrency(sale.discount)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}

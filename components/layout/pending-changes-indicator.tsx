'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/hooks/use-auth';

export function PendingChangesIndicator() {
  const { user } = useAuth();

  // Count all pending changes across all tables
  const pendingChangesCount = useLiveQuery(async () => {
    if (!user?.id) return 0;

    const userId = user.id;

    // Count unsynced records from all tables
    const [
      salesCount,
      productsCount,
      categoriesCount,
      customersCount,
      utangCount,
      inventoryCount,
    ] = await Promise.all([
      db.sales
        .where('userId')
        .equals(userId)
        .filter((item) => !item.isDeleted && item.syncedAt === null)
        .count(),
      db.products
        .where('userId')
        .equals(userId)
        .filter((item) => !item.isDeleted && item.syncedAt === null)
        .count(),
      db.categories
        .where('userId')
        .equals(userId)
        .filter((item) => !item.isDeleted && item.syncedAt === null)
        .count(),
      db.customers
        .where('userId')
        .equals(userId)
        .filter((item) => !item.isDeleted && item.syncedAt === null)
        .count(),
      db.utangTransactions
        .where('userId')
        .equals(userId)
        .filter((item) => !item.isDeleted && item.syncedAt === null)
        .count(),
      db.inventoryMovements
        .where('userId')
        .equals(userId)
        .filter((item) => !item.isDeleted && item.syncedAt === null)
        .count(),
    ]);

    return (
      salesCount +
      productsCount +
      categoriesCount +
      customersCount +
      utangCount +
      inventoryCount
    );
  }, [user?.id]);

  // Don't show if no pending changes
  if (!pendingChangesCount || pendingChangesCount === 0) {
    return null;
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <AlertCircle className="h-3 w-3" />
      <span className="text-[10px] lg:text-xs">
        {pendingChangesCount} {pendingChangesCount === 1 ? 'change' : 'changes'}
      </span>
    </Badge>
  );
}

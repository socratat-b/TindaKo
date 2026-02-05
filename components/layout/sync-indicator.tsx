'use client'

import { useEffect, useState } from 'react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useLiveQuery } from 'dexie-react-hooks'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { useAuth } from '@/lib/hooks/use-auth'
import { RefreshCw, CheckCircle2, AlertCircle, Cloud } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SyncIndicator() {
  const { userId } = useAuth()
  const status = useSyncStore((state) => state.status)
  const error = useSyncStore((state) => state.error)
  const backup = useSyncStore((state) => state.backup)
  const [showChanges, setShowChanges] = useState(true)

  const isSyncing = status === 'syncing'
  const isSuccess = status === 'success'

  // Debug logging
  useEffect(() => {
    console.log('[SyncIndicator] Status changed:', {
      status,
      isSyncing,
      isSuccess,
      error,
    })
  }, [status, isSyncing, isSuccess, error])

  // Count all pending changes across all tables
  const pendingChangesCount = useLiveQuery(async () => {
    if (!userId) return 0

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
    ])

    const total =
      salesCount +
      productsCount +
      categoriesCount +
      customersCount +
      utangCount +
      inventoryCount

    console.log('[SyncIndicator] Pending changes:', {
      salesCount,
      productsCount,
      categoriesCount,
      customersCount,
      utangCount,
      inventoryCount,
      total,
      userId
    })

    return total
  }, [userId])

  // Animate text cycling when there are pending changes
  useEffect(() => {
    if (!pendingChangesCount || pendingChangesCount === 0 || isSyncing || error) {
      return
    }

    const interval = setInterval(() => {
      setShowChanges((prev) => !prev)
    }, 2000)

    return () => clearInterval(interval)
  }, [pendingChangesCount, isSyncing, error])

  const handleManualBackup = () => {
    console.log('[SyncIndicator] Manual backup clicked')
    if (!isSyncing && userId) {
      backup(userId)
    } else {
      console.log('[SyncIndicator] Backup already in progress or no userId, skipping')
    }
  }

  const getSyncStatus = () => {
    if (isSyncing) {
      return {
        icon: RefreshCw,
        label: 'Saving online...',
        variant: 'secondary' as const,
        animate: true,
      }
    }

    if (error) {
      return {
        icon: AlertCircle,
        label: 'Save failed',
        variant: 'destructive' as const,
        animate: false,
      }
    }

    if (isSuccess) {
      return {
        icon: CheckCircle2,
        label: 'Saved online',
        variant: 'default' as const,
        animate: false,
      }
    }

    return {
      icon: Cloud,
      variant: 'outline' as const,
      animate: false,
    }
  }

  const syncStatus = getSyncStatus()
  const Icon = syncStatus.icon
  const hasPendingChanges = pendingChangesCount && pendingChangesCount > 0

  // Show syncing state
  if (isSyncing) {
    return (
      <Badge
        variant={syncStatus.variant}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleManualBackup}
        title="Saving your data online..."
      >
        <Icon
          className={`mr-1.5 h-3.5 w-3.5 ${syncStatus.animate ? 'animate-spin' : ''}`}
        />
        {syncStatus.label}
      </Badge>
    )
  }

  // Show error state
  if (error) {
    return (
      <Badge
        variant={syncStatus.variant}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleManualBackup}
        title="Click to try saving again"
      >
        <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
        {syncStatus.label}
      </Badge>
    )
  }

  // Show success state briefly (will auto-hide after 3 seconds when status resets to idle)
  if (isSuccess) {
    return (
      <Badge
        variant={syncStatus.variant}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleManualBackup}
        title="Data saved successfully"
      >
        <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0" />
        {syncStatus.label}
      </Badge>
    )
  }

  // Only show badge when there are pending changes (idle state)
  if (!hasPendingChanges) {
    return null
  }

  // Animated badge for idle state with pending changes
  return (
    <Badge
      variant={syncStatus.variant}
      className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all relative h-6 min-w-[120px] justify-start border-orange-200 dark:border-orange-900"
      onClick={handleManualBackup}
      title="Click to save your data online"
    >
      <Icon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
      <div className="relative h-4 flex items-center overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          {showChanges ? (
            <motion.span
              key="changes"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute whitespace-nowrap text-[10px] lg:text-xs"
            >
              {pendingChangesCount} {pendingChangesCount === 1 ? 'change to save' : 'changes to save'}
            </motion.span>
          ) : (
            <motion.span
              key="backup"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute whitespace-nowrap text-[10px] lg:text-xs"
            >
              Save online
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Badge>
  )
}

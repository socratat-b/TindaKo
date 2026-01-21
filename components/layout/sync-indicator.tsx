'use client'

import { useSync } from '@/lib/hooks/use-sync'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { RefreshCw, CheckCircle2, AlertCircle, Cloud, Upload } from 'lucide-react'

export function SyncIndicator() {
  const { isSyncing, isSuccess, lastSyncTime, lastSyncStats, error, hasPendingChanges, sync } = useSync()

  const handleManualSync = () => {
    if (!isSyncing) {
      sync()
    }
  }

  const getSyncStatus = () => {
    if (isSyncing) {
      return {
        icon: RefreshCw,
        label: 'Backing up...',
        variant: 'secondary' as const,
        animate: true,
      }
    }

    if (error) {
      return {
        icon: AlertCircle,
        label: 'Backup failed',
        variant: 'destructive' as const,
        animate: false,
      }
    }

    if (isSuccess) {
      return {
        icon: CheckCircle2,
        label: 'Backup complete',
        variant: 'default' as const,
        animate: false,
      }
    }

    if (hasPendingChanges) {
      return {
        icon: Cloud,
        label: 'Click to backup',
        variant: 'outline' as const,
        animate: false,
      }
    }

    return {
      icon: Upload,
      label: 'Backup to cloud',
      variant: 'outline' as const,
      animate: false,
    }
  }

  const status = getSyncStatus()
  const Icon = status.icon

  const getSyncStatsText = () => {
    if (!lastSyncStats) return null
    const { pushedCount, pulledCount, skippedCount } = lastSyncStats
    const total = pushedCount + pulledCount + skippedCount
    if (total === 0) return 'No changes'
    const parts = []
    if (pushedCount > 0) parts.push(`↑${pushedCount}`)
    if (pulledCount > 0) parts.push(`↓${pulledCount}`)
    return parts.join(' ')
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={status.variant}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleManualSync}
        title="Manual backup - Click to sync data to Supabase"
      >
        <Icon
          className={`mr-1.5 h-3.5 w-3.5 ${status.animate ? 'animate-spin' : ''}`}
        />
        {status.label}
      </Badge>

      {lastSyncTime && !isSyncing && (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
          {lastSyncStats && getSyncStatsText() && (
            <span className="ml-1.5">({getSyncStatsText()})</span>
          )}
        </span>
      )}
    </div>
  )
}

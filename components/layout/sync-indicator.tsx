'use client'

import { useSync } from '@/lib/hooks/use-sync'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { RefreshCw, CheckCircle2, AlertCircle, Cloud } from 'lucide-react'

export function SyncIndicator() {
  const { isSyncing, lastSyncTime, error, hasPendingChanges, sync } = useSync()

  const handleManualSync = () => {
    if (!isSyncing) {
      sync()
    }
  }

  const getSyncStatus = () => {
    if (isSyncing) {
      return {
        icon: RefreshCw,
        label: 'Syncing...',
        variant: 'secondary' as const,
        animate: true,
      }
    }

    if (error) {
      return {
        icon: AlertCircle,
        label: 'Sync failed',
        variant: 'destructive' as const,
        animate: false,
      }
    }

    if (hasPendingChanges) {
      return {
        icon: Cloud,
        label: 'Pending changes',
        variant: 'default' as const,
        animate: false,
      }
    }

    return {
      icon: CheckCircle2,
      label: 'Synced',
      variant: 'outline' as const,
      animate: false,
    }
  }

  const status = getSyncStatus()
  const Icon = status.icon

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={status.variant}
        className="cursor-pointer"
        onClick={handleManualSync}
      >
        <Icon
          className={`mr-1.5 h-3.5 w-3.5 ${status.animate ? 'animate-spin' : ''}`}
        />
        {status.label}
      </Badge>

      {lastSyncTime && !isSyncing && (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
        </span>
      )}
    </div>
  )
}

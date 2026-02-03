'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudUpload, Loader2, CheckCircle2 } from 'lucide-react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { BackupProgressDialog } from './backup-progress-dialog'
import { formatDistanceToNow } from 'date-fns'

export function DataSettingsSection() {
  const { userId } = useAuth()
  const backup = useSyncStore((state) => state.backup)
  const status = useSyncStore((state) => state.status)
  const lastSyncTime = useSyncStore((state) => state.lastSyncTime)
  const hasPendingChanges = useSyncStore((state) => state.hasPendingChanges)
  const checkPendingChanges = useSyncStore((state) => state.checkPendingChanges)
  const resetStatus = useSyncStore((state) => state.resetStatus)

  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)

  const isSyncing = status === 'syncing'
  const prevSyncingRef = useRef(isSyncing)

  // Check for pending changes on mount and periodically
  useEffect(() => {
    if (userId) {
      checkPendingChanges(userId)

      // Check every 10 seconds for changes
      const interval = setInterval(() => {
        checkPendingChanges(userId)
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [checkPendingChanges, userId])

  // Control backup dialog: only open when backup is actively triggered
  useEffect(() => {
    // Open dialog when backup starts
    if (isSyncing && !prevSyncingRef.current) {
      setIsBackupDialogOpen(true)
    }
    // Keep dialog open on error or success, close only on idle
    if (status === 'idle') {
      setIsBackupDialogOpen(false)
    }
    prevSyncingRef.current = isSyncing
  }, [isSyncing, status])

  const handleCloseDialog = () => {
    resetStatus()
    setIsBackupDialogOpen(false)
  }

  const handleBackup = async () => {
    if (userId) {
      await backup(userId)
    }
  }

  const isUpToDate = !hasPendingChanges && lastSyncTime !== null

  return (
    <>
      <Card className="p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Data Management</h2>
        <div className="space-y-3 lg:space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs lg:text-sm font-medium">Backup to Cloud</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Manually backup your data to Supabase
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleBackup}
                disabled={isSyncing || isUpToDate}
                className="h-8 text-xs lg:h-9 lg:text-sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                    Backing up...
                  </>
                ) : isUpToDate ? (
                  <>
                    <CheckCircle2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Up to date
                  </>
                ) : (
                  <>
                    <CloudUpload className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Backup Now
                  </>
                )}
              </Button>
            </div>
            {lastSyncTime && (
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Last backup: {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </Card>

      <BackupProgressDialog isOpen={isBackupDialogOpen} onClose={handleCloseDialog} />
    </>
  )
}

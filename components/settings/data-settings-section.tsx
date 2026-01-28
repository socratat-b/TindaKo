'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudUpload, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import { useSyncStore } from '@/lib/stores/sync-store'
import { BackupProgressDialog } from './backup-progress-dialog'
import { formatDistanceToNow } from 'date-fns'
import { reseedCatalog, getCatalogStats } from '@/lib/actions/catalog'
import { toast } from 'sonner'

export function DataSettingsSection() {
  const backup = useSyncStore((state) => state.backup)
  const status = useSyncStore((state) => state.status)
  const lastSyncTime = useSyncStore((state) => state.lastSyncTime)
  const hasPendingChanges = useSyncStore((state) => state.hasPendingChanges)
  const resetStatus = useSyncStore((state) => state.resetStatus)

  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [isReseeding, setIsReseeding] = useState(false)
  const [catalogCount, setCatalogCount] = useState<number | null>(null)

  const isSyncing = status === 'syncing'
  const prevSyncingRef = useRef(isSyncing)

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
    await backup()
  }

  const handleReseedCatalog = async () => {
    setIsReseeding(true)
    try {
      const result = await reseedCatalog()
      if (result.success) {
        toast.success(result.message)
        setCatalogCount(result.count)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to reseed catalog')
      console.error('[handleReseedCatalog] Error:', error)
    } finally {
      setIsReseeding(false)
    }
  }

  // Load catalog stats on mount
  useEffect(() => {
    const loadCatalogStats = async () => {
      const stats = await getCatalogStats()
      if (stats) {
        setCatalogCount(stats.total)
      }
    }
    loadCatalogStats()
  }, [])

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

          {/* Catalog Reseed */}
          <div className="space-y-2 pt-3 lg:pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs lg:text-sm font-medium">Product Catalog</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Update catalog with latest Filipino products
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReseedCatalog}
                disabled={isReseeding}
                className="h-8 text-xs lg:h-9 lg:text-sm"
              >
                {isReseeding ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Reseed Catalog
                  </>
                )}
              </Button>
            </div>
            {catalogCount !== null && (
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Current catalog: {catalogCount} products
              </p>
            )}
          </div>
        </div>
      </Card>

      <BackupProgressDialog isOpen={isBackupDialogOpen} onClose={handleCloseDialog} />
    </>
  )
}

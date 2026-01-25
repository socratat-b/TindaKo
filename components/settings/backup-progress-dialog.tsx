'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertCircle, Wifi, CheckCircle2, XCircle } from 'lucide-react'
import { useSyncStore } from '@/lib/stores/sync-store'

interface BackupProgressDialogProps {
  isOpen: boolean
  onClose?: () => void
}

export function BackupProgressDialog({ isOpen, onClose }: BackupProgressDialogProps) {
  const status = useSyncStore((state) => state.status)
  const error = useSyncStore((state) => state.error)
  const progress = useSyncStore((state) => state.progress)

  const isSyncing = status === 'syncing'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  if (!isOpen) return null

  const progressPercentage = progress
    ? Math.round((progress.tablesCompleted / progress.totalTables) * 100)
    : 0

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={isError || isSuccess}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isError ? (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Backup Failed
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Backup Complete
              </>
            ) : (
              <>
                <Wifi className="h-5 w-5 text-blue-600 animate-pulse" />
                Backing Up Data
              </>
            )}
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-2">
            {isError ? (
              <>
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Backup failed
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {error || 'An unknown error occurred during backup.'}
                    </p>
                  </div>
                </div>
                {onClose && (
                  <Button onClick={onClose} className="w-full">
                    Close
                  </Button>
                )}
              </>
            ) : isSuccess ? (
              <p className="text-sm text-muted-foreground">
                Your data has been successfully backed up to the cloud.
              </p>
            ) : (
              <>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Important:</strong> Please keep your internet connection active. Do not close this window or turn off your device until the backup is complete.
                  </p>
                </div>

                {progress && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Backing up {progress.currentTable}...
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {progress.tablesCompleted} / {progress.totalTables}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {progress.currentTableCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {progress.currentTableCount} {progress.currentTableCount === 1 ? 'item' : 'items'} saved
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

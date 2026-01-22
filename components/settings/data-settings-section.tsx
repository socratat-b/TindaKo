'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudUpload, Trash2, Loader2 } from 'lucide-react'
import { useSync } from '@/lib/hooks/use-sync'
import { ClearDataDialog } from './clear-data-dialog'
import { formatDistanceToNow } from 'date-fns'

interface DataSettingsSectionProps {
  userId: string
}

export function DataSettingsSection({ userId }: DataSettingsSectionProps) {
  const { sync, isSyncing, lastSyncTime } = useSync()
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)

  const handleBackup = async () => {
    await sync()
  }

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
                disabled={isSyncing}
                className="h-8 text-xs lg:h-9 lg:text-sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                    Backing up...
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

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs lg:text-sm font-medium text-destructive">
                  Clear Local Data
                </p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Permanently delete all local data
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsClearDialogOpen(true)}
                className="h-8 text-xs lg:h-9 lg:text-sm"
              >
                <Trash2 className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                Clear Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ClearDataDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        userId={userId}
      />
    </>
  )
}

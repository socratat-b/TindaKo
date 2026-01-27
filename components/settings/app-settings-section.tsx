'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LogOut, Smartphone } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { LogoutDialog } from '@/components/layout/logout-dialog'

export function AppSettingsSection() {
  const { phone } = useAuth()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  return (
    <>
      <Card className="p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Account</h2>
        <div className="space-y-3 lg:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-phone" className="text-xs lg:text-sm">
              Phone Number
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-phone"
                value={phone || ''}
                readOnly
                disabled
                className="h-9 text-xs lg:h-10 lg:text-sm pl-10 bg-muted/50 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] lg:text-xs text-muted-foreground">
              Your account phone number (read-only)
            </p>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs lg:text-sm font-medium text-destructive">
                  Logout
                </p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setLogoutDialogOpen(true)}
                className="h-8 text-xs lg:h-9 lg:text-sm"
              >
                <LogOut className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </>
  )
}

'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useSettings } from '@/lib/hooks/use-settings'
import { useStoreName } from '@/lib/hooks/use-store-name'

export function GeneralSettingsSection() {
  const { language, timezone, updateSettings } = useSettings()
  const {
    storeName,
    isUpdating: isUpdatingStoreName,
    handleChange: handleStoreNameChange,
    handleSave: handleStoreNameSave
  } = useStoreName()

  return (
    <Card className="p-4 lg:p-6">
      <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">General</h2>
      <div className="space-y-3 lg:space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="store-name" className="text-xs lg:text-sm">
            Store Name
          </Label>
          <Input
            id="store-name"
            value={storeName}
            onChange={(e) => handleStoreNameChange(e.target.value)}
            onBlur={handleStoreNameSave}
            placeholder="My Sari-Sari Store"
            disabled={isUpdatingStoreName}
            className="h-9 text-xs lg:h-10 lg:text-sm w-full"
          />
          {isUpdatingStoreName && (
            <p className="text-[10px] text-muted-foreground">Saving...</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="language" className="text-xs lg:text-sm">
            Language
          </Label>
          <Select
            value={language}
            onValueChange={(value) => updateSettings({ language: value as any })}
          >
            <SelectTrigger id="language" className="h-9 text-xs lg:h-10 lg:text-sm w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fil">Filipino</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timezone" className="text-xs lg:text-sm">
            Timezone
          </Label>
          <Select
            value={timezone}
            onValueChange={(value) => updateSettings({ timezone: value })}
          >
            <SelectTrigger id="timezone" className="h-9 text-xs lg:h-10 lg:text-sm w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
              <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium">Currency</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Philippine Peso (₱)
              </p>
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              ₱
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

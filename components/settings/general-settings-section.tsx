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

export function GeneralSettingsSection() {
  const {
    storeName,
    currency,
    language,
    timezone,
    updateSettings
  } = useSettings()

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
            onChange={(e) => updateSettings({ storeName: e.target.value })}
            placeholder="My Sari-Sari Store"
            className="h-9 text-xs lg:h-10 lg:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency" className="text-xs lg:text-sm">
            Currency
          </Label>
          <Select
            value={currency}
            onValueChange={(value) => updateSettings({ currency: value as any })}
          >
            <SelectTrigger id="currency" className="h-9 text-xs lg:h-10 lg:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
              <SelectItem value="USD">US Dollar ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="language" className="text-xs lg:text-sm">
            Language
          </Label>
          <Select
            value={language}
            onValueChange={(value) => updateSettings({ language: value as any })}
          >
            <SelectTrigger id="language" className="h-9 text-xs lg:h-10 lg:text-sm">
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
            <SelectTrigger id="timezone" className="h-9 text-xs lg:h-10 lg:text-sm">
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
      </div>
    </Card>
  )
}

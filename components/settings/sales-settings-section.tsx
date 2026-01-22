'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useSettings } from '@/lib/hooks/use-settings'

export function SalesSettingsSection() {
  const {
    defaultPaymentMethod,
    enableQuickCheckout,
    updateSettings
  } = useSettings()

  return (
    <Card className="p-4 lg:p-6">
      <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Sales</h2>
      <div className="space-y-3 lg:space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="default-payment" className="text-xs lg:text-sm">
            Default Payment Method
          </Label>
          <Select
            value={defaultPaymentMethod}
            onValueChange={(value) => updateSettings({ defaultPaymentMethod: value as any })}
          >
            <SelectTrigger id="default-payment" className="h-9 text-xs lg:h-10 lg:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="gcash">GCash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="utang">Utang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="quick-checkout" className="text-xs lg:text-sm">
              Quick Checkout
            </Label>
            <p className="text-[10px] lg:text-xs text-muted-foreground">
              Skip payment confirmation dialog
            </p>
          </div>
          <Switch
            id="quick-checkout"
            checked={enableQuickCheckout}
            onCheckedChange={(checked) => updateSettings({ enableQuickCheckout: checked })}
          />
        </div>
      </div>
    </Card>
  )
}

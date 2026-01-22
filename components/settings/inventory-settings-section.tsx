'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useSettings } from '@/lib/hooks/use-settings'

export function InventorySettingsSection() {
  const {
    lowStockThreshold,
    enableBarcodeScanner,
    updateSettings
  } = useSettings()

  return (
    <Card className="p-4 lg:p-6">
      <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Inventory</h2>
      <div className="space-y-3 lg:space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="low-stock-threshold" className="text-xs lg:text-sm">
            Low Stock Threshold
          </Label>
          <Input
            id="low-stock-threshold"
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => updateSettings({ lowStockThreshold: parseInt(e.target.value) || 0 })}
            className="h-9 text-xs lg:h-10 lg:text-sm"
          />
          <p className="text-[10px] lg:text-xs text-muted-foreground">
            Alert when stock falls below this quantity
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="barcode-scanner" className="text-xs lg:text-sm">
              Enable Barcode Scanner
            </Label>
            <p className="text-[10px] lg:text-xs text-muted-foreground">
              Show barcode scanner on POS page
            </p>
          </div>
          <Switch
            id="barcode-scanner"
            checked={enableBarcodeScanner}
            onCheckedChange={(checked) => updateSettings({ enableBarcodeScanner: checked })}
          />
        </div>
      </div>
    </Card>
  )
}

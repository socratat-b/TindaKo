'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTheme } from 'next-themes'

export function DisplaySettingsSection() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (value: string) => {
    // Only update next-themes, ThemeSync will update Zustand automatically
    setTheme(value)
  }

  return (
    <Card className="p-4 lg:p-6">
      <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Display</h2>
      <div className="space-y-4 lg:space-y-5">
        <div className="space-y-2">
          <Label className="text-xs lg:text-sm">Theme</Label>
          <RadioGroup value={theme || 'system'} onValueChange={handleThemeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="text-xs lg:text-sm font-normal cursor-pointer">
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="text-xs lg:text-sm font-normal cursor-pointer">
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="text-xs lg:text-sm font-normal cursor-pointer">
                System
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  )
}

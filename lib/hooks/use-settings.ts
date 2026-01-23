'use client'

import { useSettingsStore } from '@/lib/stores/settings-store'

/**
 * Hook for accessing and updating app settings
 * Settings are stored in localStorage only (not synced to cloud)
 */
export function useSettings() {
  const settings = useSettingsStore()

  return {
    // General
    storeName: settings.storeName,
    currency: settings.currency,
    language: settings.language,
    timezone: settings.timezone,

    // Display
    theme: settings.theme,
    showLowStockAlerts: settings.showLowStockAlerts,

    // Inventory
    lowStockThreshold: settings.lowStockThreshold,
    enableBarcodeScanner: settings.enableBarcodeScanner,

    // Sales
    defaultPaymentMethod: settings.defaultPaymentMethod,
    enableQuickCheckout: settings.enableQuickCheckout,

    // Actions
    updateSettings: settings.updateSettings,
    resetToDefaults: settings.resetToDefaults
  }
}

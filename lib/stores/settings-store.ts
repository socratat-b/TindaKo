import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Currency = 'PHP' | 'USD' | 'EUR'
export type Language = 'en' | 'fil'
export type Theme = 'light' | 'dark' | 'system'
export type PaymentMethod = 'cash' | 'gcash' | 'utang'

interface SettingsState {
  // General
  storeName: string
  currency: Currency
  language: Language
  timezone: string

  // Display
  theme: Theme
  compactMode: boolean
  showLowStockAlerts: boolean

  // Inventory
  lowStockThreshold: number
  enableBarcodeScanner: boolean

  // Sales
  defaultPaymentMethod: PaymentMethod
  enableQuickCheckout: boolean

  // Actions
  updateSettings: (settings: Partial<Omit<SettingsState, 'updateSettings' | 'resetToDefaults'>>) => void
  resetToDefaults: () => void
}

const DEFAULT_SETTINGS: Omit<SettingsState, 'updateSettings' | 'resetToDefaults'> = {
  storeName: 'My Sari-Sari Store',
  currency: 'PHP',
  language: 'en',
  timezone: 'Asia/Manila',
  theme: 'system',
  compactMode: false,
  showLowStockAlerts: true,
  lowStockThreshold: 10,
  enableBarcodeScanner: true,
  defaultPaymentMethod: 'cash',
  enableQuickCheckout: false
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings) => {
        set(settings)
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS)
      }
    }),
    {
      name: 'tindako-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        storeName: state.storeName,
        currency: state.currency,
        language: state.language,
        timezone: state.timezone,
        theme: state.theme,
        compactMode: state.compactMode,
        showLowStockAlerts: state.showLowStockAlerts,
        lowStockThreshold: state.lowStockThreshold,
        enableBarcodeScanner: state.enableBarcodeScanner,
        defaultPaymentMethod: state.defaultPaymentMethod,
        enableQuickCheckout: state.enableQuickCheckout
      })
    }
  )
)

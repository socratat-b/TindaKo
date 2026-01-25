'use client'

import { useSettingsStore, type Currency } from '@/lib/stores/settings-store'

/**
 * Currency symbols mapping
 * Note: Currency is locked to PHP (Philippine Peso) for Filipino users.
 * The infrastructure supports multiple currencies for future flexibility.
 */
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PHP: '₱',
  USD: '$',
  EUR: '€'
}

/**
 * Format amount with currency symbol from settings
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "₱123,456.78")
 */
export function formatCurrency(amount: number): string {
  const currency = useSettingsStore.getState().currency
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${symbol}${formatted}`
}

/**
 * Hook version for React components
 * Automatically re-renders when currency setting changes
 */
export function useFormatCurrency() {
  const currency = useSettingsStore((state) => state.currency)
  const symbol = CURRENCY_SYMBOLS[currency]

  return (amount: number): string => {
    const formatted = amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return `${symbol}${formatted}`
  }
}

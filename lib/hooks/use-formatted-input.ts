'use client'

import { useState, useCallback } from 'react'

/**
 * Hook for formatting number inputs with thousands separators
 * Displays formatted value (e.g., "1,234.56") while maintaining raw number for calculations
 *
 * @param initialValue - Initial numeric value
 * @returns Object with displayValue, rawValue, and handlers for onChange/onBlur
 */
export function useFormattedNumberInput(initialValue: string = '') {
  const [displayValue, setDisplayValue] = useState(initialValue)
  const [rawValue, setRawValue] = useState(initialValue)

  /**
   * Format number with thousands separators
   */
  const formatNumber = useCallback((value: string): string => {
    // Remove all non-digit and non-decimal characters
    const cleaned = value.replace(/[^\d.]/g, '')

    // Ensure only one decimal point
    const parts = cleaned.split('.')
    const integerPart = parts[0] || ''
    const decimalPart = parts.length > 1 ? parts[1] : ''

    // Add thousands separators to integer part
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // Combine integer and decimal parts
    return decimalPart ? `${formatted}.${decimalPart}` : formatted
  }, [])

  /**
   * Handle input change - format as user types
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Remove commas to get raw value
    const raw = inputValue.replace(/,/g, '')

    // Validate numeric input
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      setRawValue(raw)
      setDisplayValue(formatNumber(raw))
    }
  }, [formatNumber])

  /**
   * Handle blur - ensure proper decimal formatting
   */
  const handleBlur = useCallback(() => {
    if (rawValue && !isNaN(parseFloat(rawValue))) {
      const num = parseFloat(rawValue)
      const formatted = num.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      setDisplayValue(formatted)
      setRawValue(num.toFixed(2))
    }
  }, [rawValue])

  /**
   * Reset the input value
   */
  const reset = useCallback((value: string = '') => {
    setDisplayValue(value)
    setRawValue(value)
  }, [])

  /**
   * Set value programmatically (e.g., for auto-fill)
   */
  const setValue = useCallback((value: number | string) => {
    const numValue = typeof value === 'number' ? value.toFixed(2) : value
    setRawValue(numValue)

    if (numValue && !isNaN(parseFloat(numValue))) {
      const formatted = parseFloat(numValue).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      setDisplayValue(formatted)
    } else {
      setDisplayValue(numValue)
    }
  }, [])

  return {
    displayValue,
    rawValue,
    handleChange,
    handleBlur,
    reset,
    setValue
  }
}

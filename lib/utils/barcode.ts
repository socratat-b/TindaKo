/**
 * Barcode normalization and matching utilities
 * Handles different barcode formats from scanners and databases
 */

/**
 * Normalize barcode to standard format
 * Removes leading zeros for consistency
 */
export function normalizeBarcode(barcode: string): string {
  // Remove all non-numeric characters
  const cleaned = barcode.replace(/\D/g, '')

  // Remove leading zeros (Open Food Facts often adds these incorrectly)
  // But keep if it's a valid 13-digit EAN-13
  if (cleaned.length === 13 && !cleaned.startsWith('0')) {
    return cleaned
  }

  // Remove leading zeros
  return cleaned.replace(/^0+/, '')
}

/**
 * Generate all possible barcode variants for matching
 * Some scanners/systems add/remove leading zeros or check digits
 */
export function getBarcodeVariants(barcode: string): string[] {
  const normalized = normalizeBarcode(barcode)
  const variants: string[] = [normalized]

  // Add variant with leading zero (some systems use this)
  if (normalized.length === 12) {
    variants.push('0' + normalized)
  }

  // If starts with 074848 (Open Food Facts error), try 74848
  if (normalized.startsWith('74848')) {
    variants.push(normalized)
    // Also try without any leading zeros
    const withoutLeading = normalized.replace(/^0+/, '')
    if (withoutLeading !== normalized) {
      variants.push(withoutLeading)
    }
  }

  // If 13 digits starting with 0, try removing the leading 0
  if (normalized.length === 13 && normalized.startsWith('0')) {
    variants.push(normalized.substring(1))
  }

  // Add exact barcode as last resort
  if (!variants.includes(barcode)) {
    variants.push(barcode)
  }

  return [...new Set(variants)] // Remove duplicates
}

/**
 * Check if two barcodes match (considering variants)
 */
export function barcodesMatch(barcode1: string, barcode2: string): boolean {
  const variants1 = getBarcodeVariants(barcode1)
  const variants2 = getBarcodeVariants(barcode2)

  // Check if any variant matches
  return variants1.some(v1 => variants2.includes(v1))
}

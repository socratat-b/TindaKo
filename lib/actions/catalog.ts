/**
 * Catalog management utilities (client-side only)
 */

import { db } from '@/lib/db'
import { seedProductCatalog } from '@/lib/db/seeders'

/**
 * Force re-seed the product catalog
 * Clears old data and seeds with the latest 397 Filipino products
 */
export async function reseedCatalog() {
  try {
    // Clear existing catalog
    await db.productCatalog.clear()
    console.log('[reseedCatalog] Cleared old catalog')

    // Re-seed with fresh data
    await seedProductCatalog()

    // Get new count
    const newCount = await db.productCatalog.count()
    console.log('[reseedCatalog] Re-seeded catalog successfully with', newCount, 'products')

    return {
      success: true,
      message: `Catalog updated successfully! ${newCount} products loaded.`,
      count: newCount
    }
  } catch (error) {
    console.error('[reseedCatalog] Error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update catalog',
      count: 0
    }
  }
}

/**
 * Get catalog statistics
 */
export async function getCatalogStats() {
  try {
    const total = await db.productCatalog.count()

    // Count by first digit (to see if we have proper Filipino barcodes)
    const allBarcodes = await db.productCatalog.toArray()
    const byFirstDigit: Record<string, number> = {}

    allBarcodes.forEach(item => {
      const firstDigit = item.barcode[0]
      byFirstDigit[firstDigit] = (byFirstDigit[firstDigit] || 0) + 1
    })

    return {
      total,
      byFirstDigit,
      sampleProducts: allBarcodes.slice(0, 10).map(p => ({
        barcode: p.barcode,
        name: p.name
      }))
    }
  } catch (error) {
    console.error('[getCatalogStats] Error:', error)
    return null
  }
}

/**
 * Search catalog for a specific barcode (for debugging)
 */
export async function searchCatalogByBarcode(barcode: string) {
  try {
    const exact = await db.productCatalog.where('barcode').equals(barcode).first()

    // Also try without leading zeros
    const variants = [
      barcode,
      barcode.replace(/^0+/, ''), // Remove leading zeros
      '0' + barcode, // Add leading zero
    ]

    const matches = await Promise.all(
      variants.map(async (v) => {
        const match = await db.productCatalog.where('barcode').equals(v).first()
        return match ? { variant: v, product: match } : null
      })
    )

    return {
      exact,
      variants: matches.filter(Boolean),
    }
  } catch (error) {
    console.error('[searchCatalogByBarcode] Error:', error)
    return { exact: null, variants: [] }
  }
}

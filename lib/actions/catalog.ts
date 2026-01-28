/**
 * Catalog management utilities (client-side only)
 */

import { db } from '@/lib/db'
import { seedProductCatalog } from '@/lib/db/seeders'

/**
 * Force re-seed the product catalog
 * Clears old data and seeds with the latest 89 verified Filipino products
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
 * Direct lookup - all barcodes are verified and standardized
 */
export async function searchCatalogByBarcode(barcode: string) {
  try {
    const product = await db.productCatalog.where('barcode').equals(barcode).first()

    return {
      found: !!product,
      product,
      barcode
    }
  } catch (error) {
    console.error('[searchCatalogByBarcode] Error:', error)
    return { found: false, product: null, barcode }
  }
}

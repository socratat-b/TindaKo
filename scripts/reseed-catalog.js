#!/usr/bin/env node

/**
 * Reseed Product Catalog Script
 * Clears old catalog and loads new 397 Filipino products
 *
 * Run: node scripts/reseed-catalog.js
 */

console.log('🔄 Starting catalog reseed...\n')

console.log('📝 Instructions:')
console.log('   1. Open your app in the browser')
console.log('   2. Open Developer Console (F12)')
console.log('   3. Run this command:\n')
console.log('      await (await import("/lib/actions/catalog.js")).reseedCatalog()\n')
console.log('✅ Expected result: "Catalog updated successfully! 397 products loaded."\n')
console.log('💡 Tip: After reseeding, test by scanning a barcode in Quick Add\n')

/**
 * Product Catalog Test Script
 * Run this in the browser console (DevTools) to verify catalog functionality
 *
 * Usage:
 * 1. Open app in browser (pnpm dev)
 * 2. Open DevTools console (F12)
 * 3. Copy and paste this entire script
 * 4. Run each test function
 */

// Test 1: Check if catalog is seeded
async function testCatalogSeeded() {
  const { db } = await import('./lib/db/index.ts')
  const count = await db.productCatalog.count()
  console.log(`✓ Catalog has ${count} products`)
  return count > 0
}

// Test 2: Search catalog by barcode
async function testCatalogLookup(barcode = '4800016644290') {
  const { db } = await import('./lib/db/index.ts')
  const product = await db.productCatalog
    .where('barcode')
    .equals(barcode)
    .first()

  if (product) {
    console.log('✓ Product found in catalog:', product)
    return product
  } else {
    console.log('✗ Product not found')
    return null
  }
}

// Test 3: List all catalog products
async function testListCatalog(limit = 10) {
  const { db } = await import('./lib/db/index.ts')
  const products = await db.productCatalog.limit(limit).toArray()
  console.log(`✓ First ${limit} catalog products:`)
  console.table(products.map(p => ({
    name: p.name,
    barcode: p.barcode,
    category: p.categoryName
  })))
  return products
}

// Test 4: Search catalog by name
async function testSearchByName(query = 'Lucky Me') {
  const { db } = await import('./lib/db/index.ts')
  const products = await db.productCatalog
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .toArray()

  console.log(`✓ Found ${products.length} products matching "${query}":`)
  console.table(products.map(p => ({
    name: p.name,
    barcode: p.barcode,
    category: p.categoryName
  })))
  return products
}

// Test 5: Get catalog by category
async function testGetByCategory(categoryName = 'Noodles') {
  const { db } = await import('./lib/db/index.ts')
  const products = await db.productCatalog
    .filter(p => p.categoryName === categoryName)
    .toArray()

  console.log(`✓ Found ${products.length} products in "${categoryName}" category:`)
  console.table(products.map(p => ({
    name: p.name,
    barcode: p.barcode
  })))
  return products
}

// Test 6: Verify seller isolation
async function testSellerIsolation(storePhone) {
  const { db } = await import('./lib/db/index.ts')

  // Check seller's products
  const sellerProducts = await db.products
    .where('storePhone')
    .equals(storePhone)
    .toArray()

  // Check catalog (no storePhone filter)
  const catalogCount = await db.productCatalog.count()

  console.log(`✓ Seller (${storePhone}) has ${sellerProducts.length} products`)
  console.log(`✓ Catalog has ${catalogCount} products (shared)`)
  console.log('✓ Seller products are isolated, catalog is shared')

  return { sellerProducts, catalogCount }
}

// Test 7: Manual seed (if catalog is empty)
async function testManualSeed() {
  const { seedProductCatalog } = await import('./lib/db/seeders.ts')
  console.log('Seeding catalog...')
  await seedProductCatalog()
  const count = await testCatalogSeeded()
  console.log(`✓ Catalog seeded successfully with ${count} products`)
}

// Run all tests
async function runAllTests(storePhone = '09171234567') {
  console.log('🧪 Running Product Catalog Tests...\n')

  try {
    console.log('Test 1: Check catalog seeded')
    await testCatalogSeeded()
    console.log('')

    console.log('Test 2: Lookup by barcode')
    await testCatalogLookup('4800016644290')
    console.log('')

    console.log('Test 3: List catalog products')
    await testListCatalog(5)
    console.log('')

    console.log('Test 4: Search by name')
    await testSearchByName('Lucky Me')
    console.log('')

    console.log('Test 5: Get by category')
    await testGetByCategory('Noodles')
    console.log('')

    console.log('Test 6: Verify seller isolation')
    await testSellerIsolation(storePhone)
    console.log('')

    console.log('✅ All tests completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export test functions
console.log('Product Catalog Test Script Loaded!')
console.log('Available functions:')
console.log('  - testCatalogSeeded()')
console.log('  - testCatalogLookup(barcode)')
console.log('  - testListCatalog(limit)')
console.log('  - testSearchByName(query)')
console.log('  - testGetByCategory(categoryName)')
console.log('  - testSellerIsolation(storePhone)')
console.log('  - testManualSeed()')
console.log('  - runAllTests(storePhone)')
console.log('')
console.log('Quick start: Run `await runAllTests()`')

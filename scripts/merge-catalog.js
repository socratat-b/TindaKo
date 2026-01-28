#!/usr/bin/env node

/**
 * Merge imported products with existing catalog, removing duplicates
 * Usage: node scripts/merge-catalog.js
 */

const fs = require('fs');
const path = require('path');

const existingFile = path.join(__dirname, '..', 'lib', 'db', 'seeds', 'filipino-products.ts');
const importedFile = path.join(__dirname, '..', 'lib', 'db', 'seeds', 'imported-products.ts');

console.log('📦 Merging catalog products...\n');

// Read existing products
const existingContent = fs.readFileSync(existingFile, 'utf8');
const existingBarcodes = new Set();

// Extract barcodes from existing file
const barcodeRegex = /barcode:\s*['"'](\d+)['"']/g;
let match;
while ((match = barcodeRegex.exec(existingContent)) !== null) {
  existingBarcodes.add(match[1]);
}

console.log(`📊 Existing products: ${existingBarcodes.size}`);

// Read imported products
const importedContent = fs.readFileSync(importedFile, 'utf8');
const importedProducts = [];

// Extract all product lines from imported file
const productRegex = /\{\s*barcode:\s*['"'](\d+)['"'],\s*name:\s*['"'](.+?)['"'],\s*categoryName:\s*['"'](.+?)['"']\s*\}/g;
while ((match = productRegex.exec(importedContent)) !== null) {
  const [, barcode, name, categoryName] = match;
  if (!existingBarcodes.has(barcode)) {
    importedProducts.push({ barcode, name, categoryName });
  }
}

console.log(`📥 Imported products: ${importedProducts.length + existingBarcodes.size}`);
console.log(`✨ New products (not duplicates): ${importedProducts.length}\n`);

if (importedProducts.length === 0) {
  console.log('✅ No new products to add. Catalog is up to date!');
  process.exit(0);
}

// Sort by category then name
importedProducts.sort((a, b) => {
  if (a.categoryName !== b.categoryName) {
    return a.categoryName.localeCompare(b.categoryName);
  }
  return a.name.localeCompare(b.name);
});

// Generate lines to add
const newLines = [];
let currentCategory = '';

for (const product of importedProducts) {
  if (product.categoryName !== currentCategory) {
    if (currentCategory !== '') {
      newLines.push('');
    }
    newLines.push(`  // ${product.categoryName} (Open Food Facts)`);
    currentCategory = product.categoryName;
  }

  // Note: names with quotes are filtered out during import
  newLines.push(`  { barcode: '${product.barcode}', name: '${product.name}', categoryName: '${product.categoryName}' },`);
}

// Insert before closing bracket
const insertCode = '\n' + newLines.join('\n') + '\n';
const updatedContent = existingContent.replace(/(\n]\s*)$/, `${insertCode}$1`);

// Write back
fs.writeFileSync(existingFile, updatedContent, 'utf8');

console.log(`✅ Added ${importedProducts.length} new products to catalog!`);
console.log(`📝 Updated file: ${existingFile}`);
console.log(`\n📊 Total products in catalog: ${existingBarcodes.size + importedProducts.length}\n`);

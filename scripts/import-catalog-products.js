#!/usr/bin/env node

/**
 * Import and clean product catalog from Open Food Facts CSV
 * Usage: node scripts/import-catalog-products.js <csv-file-path>
 *
 * This script:
 * 1. Reads the large CSV file (12GB+)
 * 2. Filters for Philippine products
 * 3. Cleans and deduplicates by barcode
 * 4. Maps to sari-sari store categories
 * 5. Outputs formatted TypeScript code
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Category mapping based on product name keywords
const CATEGORY_MAP = {
  noodles: ['noodle', 'pancit', 'mami', 'canton', 'instant noodles', 'cup noodles', 'yakisoba', 'bihon'],
  beverages: ['coke', 'cola', 'sprite', 'pepsi', 'juice', 'water', 'coffee', 'tea', 'drink', 'beverage', 'soda'],
  snacks: ['chip', 'crackers', 'biscuit', 'cookie', 'snack', 'wafer', 'prawn cracker', 'fish cracker'],
  'canned-goods': ['sardine', 'tuna', 'corned', 'beef', 'meat', 'sausage', 'luncheon', 'meatloaf', 'beef loaf'],
  condiments: ['ketchup', 'catsup', 'sauce', 'vinegar', 'soy', 'patis', 'toyo', 'oyster sauce'],
  candies: ['candy', 'chocolate'],
  'personal-care': ['soap', 'shampoo', 'toothpaste', 'detergent'],
  milk: ['milk', 'yogurt', 'evaporated', 'condensed'],
  bread: ['bread', 'pandesal'],
  rice: ['rice'],
  oil: ['oil'],
};

// Words to filter out (supplements, protein powders, etc.)
const EXCLUDE_KEYWORDS = [
  'formula 1', 'herbalife', 'supplement', 'protein powder', 'whey', 'rebuild', 'axio',
  'nitework', 'bodybuilding', 'isolate', 'gainer', 'collagen', 'probiotic'
];

function categorizeProduct(name) {
  const lowerName = name.toLowerCase();

  // Check exclusions first
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (lowerName.includes(keyword)) return null;
  }

  // Match to category
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        // Convert to title case
        return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }

  return null; // Unknown category
}

function isValidBarcode(barcode) {
  // Must be numeric and 8-14 digits
  return /^[0-9]{8,14}$/.test(barcode);
}

function cleanName(name) {
  return name
    .trim()
    .replace(/\s+/g, ' ');  // Normalize whitespace
}

async function processCSV(csvPath, outputPath) {
  const seenBarcodes = new Set();
  const products = [];
  let totalLines = 0;
  let matchedLines = 0;

  console.log('📂 Reading CSV file:', csvPath);
  console.log('⏳ Processing... (this may take a while for large files)\n');

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let barcodeIndex = 0;
  let nameIndex = 10;
  let countriesIndex = 39;

  for await (const line of rl) {
    totalLines++;

    // Parse header to get column indices
    if (isFirstLine) {
      const headers = line.split('\t');
      barcodeIndex = headers.indexOf('code');
      nameIndex = headers.indexOf('product_name');
      countriesIndex = headers.indexOf('countries');
      console.log(`📋 Found columns: barcode=${barcodeIndex}, name=${nameIndex}, countries=${countriesIndex}\n`);
      isFirstLine = false;
      continue;
    }

    // Check if line contains "philippines"
    if (!line.toLowerCase().includes('philippines')) continue;

    const columns = line.split('\t');
    const barcode = columns[barcodeIndex] || '';
    const name = columns[nameIndex] || '';

    // Skip if invalid
    if (!barcode || !name || !isValidBarcode(barcode)) continue;
    if (seenBarcodes.has(barcode)) continue;
    if (name.includes("'") || name.includes('"')) continue; // Skip names with quotes to avoid escaping issues

    // Categorize and filter
    const category = categorizeProduct(name);
    if (!category) continue;

    // Add to collection
    seenBarcodes.add(barcode);
    products.push({
      barcode,
      name: cleanName(name),
      categoryName: category
    });

    matchedLines++;

    // Progress indicator
    if (totalLines % 100000 === 0) {
      console.log(`📊 Processed ${totalLines.toLocaleString()} lines, found ${matchedLines.toLocaleString()} Philippine products...`);
    }
  }

  console.log(`\n✅ Processing complete!`);
  console.log(`📊 Total lines processed: ${totalLines.toLocaleString()}`);
  console.log(`🇵🇭 Philippine products found: ${matchedLines.toLocaleString()}`);
  console.log(`✨ Clean products (after dedup): ${products.length.toLocaleString()}\n`);

  // Sort by category then name
  products.sort((a, b) => {
    if (a.categoryName !== b.categoryName) {
      return a.categoryName.localeCompare(b.categoryName);
    }
    return a.name.localeCompare(b.name);
  });

  // Generate TypeScript code
  const tsCode = generateTypeScriptCode(products);

  // Write to output file
  fs.writeFileSync(outputPath, tsCode, 'utf8');
  console.log(`💾 Output saved to: ${outputPath}`);
  console.log(`\n📝 To add to catalog, copy the array contents and append to:`);
  console.log(`   lib/db/seeds/filipino-products.ts\n`);

  return products;
}

function generateTypeScriptCode(products) {
  const lines = [
    '// Auto-generated from Open Food Facts',
    `// Generated on: ${new Date().toISOString()}`,
    `// Total products: ${products.length}`,
    '',
    'export const IMPORTED_PRODUCTS = [',
  ];

  let currentCategory = '';

  for (const product of products) {
    // Add category comment
    if (product.categoryName !== currentCategory) {
      if (currentCategory !== '') {
        lines.push('');
      }
      lines.push(`  // ${product.categoryName}`);
      currentCategory = product.categoryName;
    }

    lines.push(`  { barcode: '${product.barcode}', name: '${product.name}', categoryName: '${product.categoryName}' },`);
  }

  lines.push(']');
  lines.push('');

  return lines.join('\n');
}

// Main execution
const csvPath = process.argv[2] || path.join(process.env.HOME, 'Downloads', 'en.openfoodfacts.org.products.csv');
const outputPath = path.join(__dirname, '..', 'lib', 'db', 'seeds', 'imported-products.ts');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ Error: CSV file not found at ${csvPath}`);
  console.error(`Usage: node ${path.basename(__filename)} [csv-file-path]`);
  process.exit(1);
}

processCSV(csvPath, outputPath)
  .then(() => {
    console.log('✅ Import completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

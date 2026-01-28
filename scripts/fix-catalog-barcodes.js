#!/usr/bin/env node

/**
 * Fix barcode formats in catalog
 * Removes incorrect leading zeros from Open Food Facts data
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'db', 'seeds', 'filipino-products.ts');

console.log('🔧 Fixing barcode formats in catalog...\n');

// Read file
let content = fs.readFileSync(filePath, 'utf8');
let fixedCount = 0;

// Fix barcodes with leading zeros that shouldn't be there
// Pattern: { barcode: '0XXXXXXXXX', ... } or { barcode: '00XXXXXXXX', ... }
// Common errors from Open Food Facts:
// - 074848... should be 74848... (12 digits -> remove leading 0)
// - 0074848... should be 74848... (remove leading 00)

// First pass: Fix double leading zeros (00...)
const doubleZeroRegex = /\{\s*barcode:\s*'00(\d{11,12})'/g;
content = content.replace(doubleZeroRegex, (match, digits) => {
  if (digits.length === 11 || digits.length === 12) {
    const firstTwo = digits.substring(0, 2);
    const validPrefixes = ['48', '78', '88', '45', '74', '75', '76', '77', '49'];

    if (validPrefixes.includes(firstTwo)) {
      fixedCount++;
      if (fixedCount <= 15) {
        console.log(`  Fixing: 00${digits} → ${digits}`);
      }
      return `{ barcode: '${digits}'`;
    }
  }
  return match;
});

// Second pass: Fix single leading zeros (0...)
const singleZeroRegex = /\{\s*barcode:\s*'0(\d{12,13})'/g;
content = content.replace(singleZeroRegex, (match, digits) => {
  if (digits.length === 12 || digits.length === 13) {
    const firstTwo = digits.substring(0, 2);
    const validPrefixes = ['48', '78', '88', '45', '74', '75', '76', '77', '49'];

    if (validPrefixes.includes(firstTwo)) {
      fixedCount++;
      if (fixedCount <= 15) {
        console.log(`  Fixing: 0${digits} → ${digits}`);
      }
      return `{ barcode: '${digits}'`;
    }
  }
  return match;
});

// Write back
if (fixedCount > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ Fixed ${fixedCount} barcodes with incorrect leading zeros`);
  console.log(`📝 Updated: ${filePath}\n`);
} else {
  console.log('✅ No barcode fixes needed!\n');
}

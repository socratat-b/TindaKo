# Product Catalog Import Scripts

Scripts to import and manage the product catalog from Open Food Facts dataset.

## Overview

- **import-catalog-products.js**: Extracts Philippine products from the 12GB Open Food Facts CSV file
- **merge-catalog.js**: Merges imported products into the existing catalog (no duplicates)

## Usage

### 1. Import Products from CSV

```bash
# Default: reads from ~/Downloads/en.openfoodfacts.org.products.csv
node scripts/import-catalog-products.js

# Or specify custom path
node scripts/import-catalog-products.js /path/to/openfoodfacts.csv
```

**Output:**
- Creates `lib/db/seeds/imported-products.ts` with cleaned products
- Filters for Philippines country
- Categorizes by product type (Beverages, Snacks, Canned Goods, etc.)
- Removes duplicates, supplements, protein powders
- Skips products with quotes in names (to avoid escaping issues)

### 2. Merge into Main Catalog

```bash
node scripts/merge-catalog.js
```

**Output:**
- Adds new products to `lib/db/seeds/filipino-products.ts`
- Automatically deduplicates by barcode
- Preserves existing products
- Sorts by category then name

## Features

### Smart Filtering

**Included:**
- Noodles (Lucky Me, Payless, Nissin, etc.)
- Beverages (Coke, juice, water, coffee, tea)
- Snacks (chips, crackers, cookies)
- Canned Goods (sardines, tuna, corned beef)
- Condiments (ketchup, soy sauce, vinegar)
- Personal Care (soap, shampoo)
- Milk, Bread, Rice, Cooking Oil

**Excluded:**
- Supplements & protein powders
- Bodybuilding products
- Non-sari-sari store items

### Category Mapping

Products are automatically categorized based on keywords:
- `pancit`, `mami`, `canton` → Noodles
- `sardine`, `tuna`, `corned beef` → Canned Goods
- `ketchup`, `soy sauce`, `vinegar` → Condiments
- etc.

## Results

From the 12GB Open Food Facts dataset:
- **Total lines**: 4.3 million products
- **Philippine products**: 2,313 (filtered & cleaned)
- **Final catalog**: 2,440 products (including existing 127)

## Alternative Barcode Formats

The catalog includes products with multiple barcode formats:
- EAN-13 (13 digits): `4800016644290`
- UPC-A (12 digits): `074848510008`
- EAN-8 (8 digits): `48000166` (short format)
- Leading zeros: `0480001664429` (some retailers)

This ensures compatibility with different barcode scanners and packaging from:
- Direct manufacturers
- Supermarkets/malls (repackaged items)
- Wholesalers
- Import distributors

## Maintenance

To update the catalog with fresh Open Food Facts data:

```bash
# 1. Download latest CSV from openfoodfacts.org
# 2. Run import
node scripts/import-catalog-products.js

# 3. Review imported-products.ts
# 4. Merge if satisfied
node scripts/merge-catalog.js

# 5. Test build
pnpm build
```

## Notes

- Import takes ~1-2 minutes for 12GB CSV (streaming processing)
- Products with single/double quotes in names are filtered out
- Barcode must be 8-14 digits numeric only
- Duplicates are automatically removed by barcode

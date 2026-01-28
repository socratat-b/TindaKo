const fs = require('fs');
const data = JSON.parse(fs.readFileSync('VERIFIED_PRODUCTS_PUREGOLD.json', 'utf8'));

let ts = `// Verified Filipino products from Puregold.com.ph
// Total: ${data.total} products with validated barcodes
// Last updated: ${data.date}
// Source: ${data.source}

import type { ProductCatalog } from '../schema'

export const FILIPINO_PRODUCTS: Omit<ProductCatalog, 'id' | 'createdAt' | 'updatedAt'>[] = [
`;

data.products.forEach((p, i) => {
  const escapedName = p.name.replace(/'/g, "\\'");
  const comma = i < data.products.length - 1 ? ',' : '';
  ts += `  { barcode: '${p.barcode}', name: '${escapedName}', categoryName: '${p.categoryName}' }${comma}\n`;
});

ts += `]
`;

fs.writeFileSync('lib/db/seeds/filipino-products.ts', ts);
console.log('✅ Generated filipino-products.ts with', data.products.length, 'verified products');

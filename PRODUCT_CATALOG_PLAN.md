# Product Catalog Enhancement Plan

## Problem Statement

Philippine products have multiple variants (flavors, sizes, styles) with:
- **Different barcodes per variant** (correct - this is standard retail)
- **Incomplete names in Open Food Facts** (e.g., "Century Tuna" instead of "Century Tuna Flakes in Oil 180g")
- **Missing size/weight information** (critical for pricing)

## Examples

### Century Tuna
- `4800194107723` - "Century Tuna Flakes in Oil" ❌ Should be "Century Tuna Flakes in Oil 180g"
- `4800194107730` - "Century Tuna Chunks in Oil" ❌ Missing size
- `748485102252` - "Century Tuna hot and spicy" ❌ Missing style + size

### 555 Tuna
- `74848570001` - "555 TUNA ADOBO 155G" ✅ Good (has size)
- `748485700021` - "555 tuna caldereta 155g" ✅ Good
- `4800024621096` - "555 Sardines" ❌ Missing variant + size

## Solution Strategy

### Phase 1: Manual Curation (HIGH PRIORITY) ✅
**Focus on top 50-100 Filipino products with accurate names**

Create `lib/db/seeds/curated-filipino-products.ts`:
```typescript
// Manually curated with correct names from actual products
export const CURATED_PRODUCTS = [
  // Century Tuna (Century Pacific Food Inc.)
  { barcode: '4800194107723', name: 'Century Tuna Flakes in Oil 180g', categoryName: 'Canned Goods' },
  { barcode: '4800194107730', name: 'Century Tuna Chunks in Oil 180g', categoryName: 'Canned Goods' },
  { barcode: '748485102252', name: 'Century Tuna Hot & Spicy 155g', categoryName: 'Canned Goods' },
  { barcode: '748485102238', name: 'Century Tuna with Calamansi 155g', categoryName: 'Canned Goods' },

  // 555 Tuna (Century Pacific Food Inc.)
  { barcode: '74848570001', name: '555 Tuna Adobo Style 155g', categoryName: 'Canned Goods' },
  { barcode: '74848570002', name: '555 Tuna Afritada Style 155g', categoryName: 'Canned Goods' },
  { barcode: '748485700021', name: '555 Tuna Caldereta Style 155g', categoryName: 'Canned Goods' },

  // 555 Sardines
  { barcode: '4800024621096', name: '555 Sardines in Tomato Sauce 155g', categoryName: 'Canned Goods' },

  // Argentina (CDO Foodsphere)
  { barcode: '4800024608094', name: 'Argentina Corned Beef 150g', categoryName: 'Canned Goods' },

  // Lucky Me (Monde Nissin)
  { barcode: '4800016644290', name: 'Lucky Me Pancit Canton Original 60g', categoryName: 'Noodles' },
  { barcode: '4800016644306', name: 'Lucky Me Pancit Canton Chilimansi 60g', categoryName: 'Noodles' },

  // Add more as you scan them...
]
```

### Phase 2: User-Contributed Corrections (MEDIUM PRIORITY)
Allow users to suggest name corrections when product found:

**UX Flow:**
1. Scan barcode → Found "Century Tuna" (generic)
2. Show button: "✏️ Suggest Better Name"
3. User enters: "Century Tuna Flakes in Oil 180g"
4. Save to local store, optionally sync to server
5. Other users benefit from corrections

### Phase 3: Crowdsourced Database (FUTURE)
Build community-driven Filipino product database:
- Users submit photos of products
- Verify barcode + name + size
- Vote on accuracy
- Build the most accurate PH product catalog

## Implementation Priority

### ✅ DO NOW (Phase 1)
1. **Create curated list** of top 50 products (scan your actual stock)
2. **Merge curated data** with existing catalog (curated names override Open Food Facts)
3. **Format: `{Brand} {Product} {Variant} {Size}`**
   - ✅ "Lucky Me Pancit Canton Chilimansi 60g"
   - ❌ "Lucky Me Pancit Canton Chilimansi"

### 🔄 DO NEXT (Phase 2)
1. Add "Edit Name" button when catalog product found
2. Save corrections locally
3. Display user's corrected name on future scans

### 🔮 FUTURE (Phase 3)
1. Backend for crowdsourced data
2. Community verification system
3. API for other Filipino POS systems

## Data Sources

### Immediate (You!)
- **Scan your actual stock** - most accurate
- Take photos of product labels
- Record: barcode, full name, size, variant

### Short-term
- DTI Philippines product registry (if accessible)
- Manufacturer websites (Century Pacific, Monde Nissin, URC)
- Supermarket websites (Puregold, SM Supermarket catalogs)

### Long-term
- Community submissions
- Partner with FMCG companies for official data
- Scrape e-commerce sites (Shopee, Lazada PH)

## Recommended Next Steps

1. **Start a spreadsheet** of products in your store:
   ```
   Barcode          | Product Name                              | Brand        | Size  | Category
   4800194107723    | Century Tuna Flakes in Oil               | Century      | 180g  | Canned Goods
   748485102252     | Century Tuna Hot & Spicy                 | Century      | 155g  | Canned Goods
   4800016644290    | Lucky Me Pancit Canton Original          | Lucky Me     | 60g   | Noodles
   ```

2. **Every time you scan a product** that has wrong/incomplete name:
   - Note the correct name from the actual label
   - Add to spreadsheet
   - We'll import as curated data

3. **Focus on your most sold products** (Pareto principle):
   - 20% of products = 80% of sales
   - Get those 20% right first

## Technical Implementation

```typescript
// Priority order for product names:
// 1. User corrections (if any)
// 2. Curated Filipino products (manual)
// 3. Open Food Facts (fallback)

async function lookupProduct(barcode: string) {
  // Try user corrections first
  const userCorrection = await getUserCorrection(barcode)
  if (userCorrection) return userCorrection

  // Try curated list
  const curated = CURATED_PRODUCTS.find(p => p.barcode === barcode)
  if (curated) return curated

  // Fallback to Open Food Facts
  const openFoodFacts = await db.productCatalog.where('barcode').equals(barcode).first()
  return openFoodFacts
}
```

## Naming Convention

**Format:** `{Brand} {Product Line} {Variant} {Size}`

Examples:
- ✅ Lucky Me Pancit Canton Chilimansi 60g
- ✅ Century Tuna Flakes in Oil 180g
- ✅ 555 Sardines in Tomato Sauce 155g
- ✅ Argentina Corned Beef 150g
- ✅ Cobra Energy Drink Original 350ml
- ✅ Fita Crackers 300g

Benefits:
- Clear differentiation between variants
- Helps with pricing (per unit calculations)
- Professional appearance
- Easy inventory management

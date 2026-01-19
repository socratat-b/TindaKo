# TindaKo POS PWA

## Stack

- Next.js 16.1.3 + React 19 + Tailwind v4 (existing)
- Supabase (PostgreSQL + Auth)
- Dexie.js (IndexedDB, offline-first)
- Zustand v5 (state)
- Serwist (PWA)
- html5-qrcode, papaparse

## Architecture

```
UI (React) → Zustand (state) → Dexie (local) ↔ Sync → Supabase (cloud)
```

- Offline-first: all ops hit Dexie first
- Sync: periodic 5min + manual + on-close
- Conflict: last-write-wins via updatedAt

## Folders

```
app/(auth)/login, signup
app/(dashboard)/pos, products, inventory, utang, reports, settings
app/manifest.ts, sw.ts
components/ui, pos, products, utang, layout
lib/db (dexie), lib/supabase, lib/stores, lib/hooks, lib/utils
```

## DB Schema

All tables: id, userId, syncedAt, updatedAt, isDeleted

| Table              | Key Fields                                                                        |
| ------------------ | --------------------------------------------------------------------------------- |
| products           | name, barcode, categoryId, costPrice, sellingPrice, stockQty, lowStockThreshold   |
| categories         | name, color, sortOrder                                                            |
| sales              | items[], subtotal, discount, total, amountPaid, change, paymentMethod, customerId |
| customers          | name, phone, totalUtang                                                           |
| utangTransactions  | customerId, saleId, type, amount, balanceAfter                                    |
| inventoryMovements | productId, type, qty, notes                                                       |

## MVP Features

**Auth**

- Supabase email/pwd login
- Signup flow
- Auth middleware
- Session persist

**Products**

- CRUD products
- Categories CRUD
- Search/filter

**POS**

- Product grid (tap add)
- Cart + qty
- Discount (fixed/%)
- Cash payment + change calc
- Receipt view
- Void sale

**Inventory**

- Auto-deduct on sale
- Low stock alerts
- Manual adjustment

**Utang**

- Customer CRUD
- Credit sale
- Payment recording
- Balance + history

**Technical**

- PWA manifest + SW
- Offline (Dexie)
- Hybrid sync
- Mobile bottom-nav / desktop sidebar
- Sync status indicator

## Phase 2 (later)

- CSV import
- Barcode scanner
- Reports (daily/weekly/monthly)
- Profit calc

## Implementation Status

### ✅ Completed (Phase 1: Database Layer)

**Dependencies Installed:**
- @supabase/supabase-js, @supabase/ssr
- dexie, dexie-react-hooks
- zustand, nanoid, date-fns

**Database Schema (Dexie + Supabase):**
- ✅ All 6 tables created with TypeScript interfaces (`lib/db/schema.ts`)
- ✅ Dexie local database configured (`lib/db/index.ts`)
- ✅ Supabase tables with RLS policies enabled
- ✅ Bidirectional sync logic (`lib/db/sync.ts`)
- ✅ Foreign key constraints configured
- ✅ Auto-updating timestamps via triggers
- ✅ Optimized RLS policies (no performance warnings)

**Tables:**
1. categories - Product categorization
2. customers - Customer management with credit tracking
3. products - Product catalog with inventory
4. sales - POS transactions with JSONB items
5. utang_transactions - Credit/payment ledger
6. inventory_movements - Inventory audit trail

**Infrastructure:**
- ✅ Supabase client (`lib/supabase/client.ts`)
- ✅ Migration files (`supabase/migrations/`)
- ✅ .env.example with required variables
- ✅ .mcp.json.example for Claude Code integration
- ✅ Updated .gitignore for sensitive files

### 🔄 In Progress

None

### 📋 Todo (Phase 2: Authentication & UI)

**Auth:**
- [ ] Supabase server client (`lib/supabase/server.ts`)
- [ ] Auth proxy/middleware (`proxy.ts`)
- [ ] Login/signup pages
- [ ] Session persistence

**State Management:**
- [ ] Zustand stores (cart, sync, auth)
- [ ] Sync orchestration (5min periodic + manual)

**PWA:**
- [ ] Service worker (`app/sw.ts`)
- [ ] Manifest (`app/manifest.ts`)
- [ ] Install dependencies: @serwist/next, serwist

**UI Components & Pages:**
- [ ] Shared UI components
- [ ] Dashboard layout
- [ ] POS page
- [ ] Products page
- [ ] Inventory page
- [ ] Utang page
- [ ] Reports page

**Phase 3:**
- [ ] CSV import (papaparse)
- [ ] Barcode scanner (html5-qrcode)
- [ ] Advanced reports

## Dependencies

**Installed:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr dexie dexie-react-hooks zustand nanoid date-fns
```

**Todo:**
```bash
pnpm add @serwist/next serwist papaparse html5-qrcode
pnpm add -D @types/papaparse
```

## Config Snippets

**next.config.ts**

```ts
import withSerwistInit from "@serwist/next";
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});
export default withSerwist({ reactCompiler: true });
```

**lib/supabase/client.ts**

```ts
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

**lib/db/index.ts**

```ts
import Dexie from "dexie";
const db = new Dexie("TindaKoDB");
db.version(1).stores({
  products: "id, userId, categoryId, barcode, syncedAt",
  categories: "id, userId, syncedAt",
  sales: "id, userId, customerId, createdAt, syncedAt",
  customers: "id, userId, syncedAt",
  utangTransactions: "id, userId, customerId, syncedAt",
  inventoryMovements: "id, userId, productId, syncedAt",
});
export { db };
```

**app/sw.ts**

```ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
declare const self: ServiceWorkerGlobalScope;
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
});
serwist.addEventListeners();
```

**app/manifest.ts**

```ts
export default function manifest() {
  return {
    name: "TindaKo POS",
    short_name: "TindaKo",
    start_url: "/pos",
    display: "standalone",
    theme_color: "#10b981",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

## Key Files (priority order)

1. lib/supabase/client.ts, server.ts
2. proxy.ts
3. lib/db/schema.ts, index.ts, sync.ts
4. lib/stores/cart-store.ts, sync-store.ts
5. app/manifest.ts, sw.ts
6. components/ui/\*
7. app/(auth)/login, signup
8. app/(dashboard)/layout.tsx
9. app/(dashboard)/pos/page.tsx

## Verify

- [ ] Login/signup works
- [ ] PWA installs
- [ ] Offline works (airplane mode)
- [ ] Sync to Supabase
- [ ] Sale flow complete
- [ ] Utang records
- [ ] Stock deducts
- [ ] Multi-device sync

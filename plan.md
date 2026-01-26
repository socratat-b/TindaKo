# TindaKo POS PWA - Implementation Plan

## Stack

Next.js 16.1.3 + React 19 + Tailwind v4 + Supabase + Dexie.js + Zustand v5 + Serwist + Framer Motion

## Architecture

```
UI (React) → Zustand → Dexie (local) ↔ Manual Sync → Supabase (backup)
```

- Offline-first: all operations hit Dexie first
- Sync: manual backup only (user clicks "Backup to cloud" button)
- Auto-restore: pulls backup on first login if local DB empty
- Conflict resolution: last-write-wins via `updatedAt` timestamps

## Database Schema

All tables: `id`, `userId`, `syncedAt`, `updatedAt`, `createdAt`, `isDeleted`

- **products**: name, barcode, categoryId, costPrice, sellingPrice, stockQty, lowStockThreshold
- **categories**: name, color, sortOrder
- **sales**: items[], subtotal, discount, total, amountPaid, change, paymentMethod, customerId
- **customers**: name, phone, address, totalUtang
- **utangTransactions**: customerId, saleId, type, amount, balanceAfter
- **inventoryMovements**: productId, type, qty, notes

## ✅ Completed Features

### Phase 1-3: Core Foundation

- [x] **Database**: Dexie (local) + Supabase (cloud) with RLS policies
- [x] **Authentication**: Supabase email/password, session persistence, DAL security
- [x] **Sync**: Manual backup with last-write-wins conflict resolution, sync stats tracking
- [x] **Testing**: Vitest + React Testing Library (14/14 tests passing)
- [x] **PWA**: Service worker, installable, offline-capable, manifest
- [x] **State Management**: Zustand stores (auth, cart, sync) with localStorage persistence

### Phase 3: Pages & UI

- [x] **POS Page**: Product grid, cart, checkout, barcode scanner, atomic transactions, framer-motion animations
- [x] **Products Page**: CRUD products & categories, search/filter, stock status, auto-seed default categories, framer-motion animations
- [x] **Inventory Page**: Manual adjustments (in/out/adjust), low stock alerts, movement history, framer-motion animations
- [x] **Layout**: Responsive header, sidebar (desktop), drawer (mobile), sync indicator
- [x] **Design System**: Mobile-first font sizing, shadcn/ui components

## 📋 Todo

### Phase 3: All Pages Complete

- [x] **Utang Page**: Customer credit tracking, payment recording, balance history
- [x] **Reports Page**: Daily/weekly/monthly sales reports, date filtering, stats
- [x] **Settings Page**: Theme switching, currency format, data backup/restore

### Phase 4: Future Enhancements

**Centralized Product Database (Open Food Facts)**
- [ ] Store Open Food Facts products in IndexedDB as centralized product catalog
- [ ] Remove auth system - use `store_id` as primary identifier for data access
- [ ] Barcode scanning workflow:
  - **POS**: Scan barcode → auto-add to sale list → set quantity → select payment method
  - **Products**: Scan physical product → search indexed DB by barcode → if match, auto-create product (user only adds selling price)
  - Keep manual product creation option
- [ ] Apply barcode-to-catalog lookup for inventory management
- [ ] Backup/restore uses `store_id` for data isolation

**Other Enhancements**
- [ ] CSV import (papaparse)
- [ ] Advanced barcode scanner (html5-qrcode)
- [ ] Profit calculations
- [ ] Multi-store support

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build (uses --webpack for Serwist)
pnpm start        # Production server
pnpm test         # Run tests
pnpm test:ui      # Vitest UI
```

## Key Files

```
lib/db/              # Dexie schema, sync logic
lib/stores/          # Zustand stores (auth, cart, sync)
lib/hooks/           # React hooks (useAuth, useCart, useSync)
lib/actions/         # Server Actions (auth, pos, products, inventory)
components/pos/      # POS interface components
components/products/ # Products & categories components
components/inventory/# Inventory management components
app/(dashboard)/     # Protected pages (pos, products, inventory)
app/(auth)/          # Login, signup
supabase/migrations/ # Database migrations
```

## Testing Status

- ✅ 14/14 tests passing
- ✅ Unit tests: sync logic, helpers
- ✅ Integration tests: sync store, full workflow
- ✅ Mocked: IndexedDB (fake-indexeddb), Supabase (vi.mock)

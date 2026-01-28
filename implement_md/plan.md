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

All tables: `id`, `storePhone`, `syncedAt`, `updatedAt`, `createdAt`, `isDeleted`

- **stores**: phone (unique), storeName, pinHash, createdAt, updatedAt
- **products**: name, barcode, categoryId, sellingPrice, stockQty, lowStockThreshold, storePhone
- **categories**: name, color, sortOrder, storePhone
- **sales**: items[], subtotal, discount, total, amountPaid, change, paymentMethod, customerId, storePhone
- **customers**: name, phone, address, totalUtang, storePhone
- **utangTransactions**: customerId, saleId, type, amount, balanceAfter, storePhone
- **inventoryMovements**: productId, type, qty, notes, storePhone

## ✅ Completed Features

### Phase 1-3: Core Foundation

- [x] **Database**: Dexie (local) + Supabase (cloud) with manual sync
- [x] **Authentication**: Phone + PIN authentication (replaced Supabase Auth)
- [x] **Sync**: Manual backup with last-write-wins conflict resolution, sync stats tracking
- [x] **Testing**: Vitest + React Testing Library (14/14 tests passing)
- [x] **PWA**: Service worker, installable, offline-capable, manifest
- [x] **State Management**: Zustand stores (auth, cart, sync) with localStorage persistence

### Phase 3: Pages & UI

- [x] **POS Page**: Product grid, cart, checkout, barcode scanner, atomic transactions, framer-motion animations
- [x] **Products Page**: CRUD products & categories, search/filter, stock status, auto-seed default categories, framer-motion animations
- [x] **Inventory Page**: Manual adjustments (in/out/adjust), low stock alerts, movement history, framer-motion animations
- [x] **Utang Page**: Customer credit tracking, payment recording, balance history, framer-motion animations
- [x] **Reports Page**: Daily/weekly/monthly sales reports, date filtering, stats, framer-motion animations
- [x] **Settings Page**: Theme switching, data backup/restore, account management, framer-motion animations
- [x] **Layout**: Responsive header, sidebar (desktop), drawer (mobile), sync indicator
- [x] **Design System**: Mobile-first font sizing, shadcn/ui components

### Phase 4: Auth System Refactor ✅ COMPLETED

- [x] **Phone-based Authentication**: Phone number (09XXXXXXXXX) + 4-6 digit PIN
- [x] **Removed Supabase Auth**: Deleted email/password authentication
- [x] **Database Migration**: userId → storePhone across all tables
- [x] **New stores table**: phone (unique), storeName, pinHash
- [x] **Static Pages**: All 13 pages now static (○) - instant offline capability
- [x] **Session Management**: localStorage + cookies for middleware access
- [x] **PIN Security**: bcrypt hashing with `lib/auth/pin.ts`
- [x] **Multi-device Support**: Login with phone + PIN to restore data from cloud
- [x] **Code Updates**: 89 files changed (components, actions, hooks, stores, types)
- [x] **Simplified UX**: No email required, instant signup, familiar for Filipino users

## 📋 Todo

### Phase 5: Future Enhancements

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

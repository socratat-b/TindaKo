# CLAUDE.md

TindaKo - Offline-first POS PWA for Philippine Sari-Sari stores

## Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build (uses --webpack for Serwist)
pnpm start        # Production server
pnpm lint         # ESLint
pnpm test         # Run tests (Vitest)
pnpm test:ui      # Vitest UI
```

## Architecture

```
UI (React 19) → Zustand (state) → Dexie (IndexedDB) ↔ Manual Sync → Supabase (cloud backup)
```

- **Offline-first**: All operations hit local Dexie/IndexedDB first
- **Sync strategy**: Manual backup only (user clicks "Backup to cloud" button) + auto-restore on first login
- **Conflict resolution**: Last-write-wins via `updatedAt` timestamp comparison
- **Backup/Restore**: Supabase acts as cloud backup, all operations work locally first

## Tech Stack

Next.js 16.1.3 + React 19 + Tailwind v4 + Supabase + Dexie.js + Zustand v5 + Serwist + Framer Motion + Vitest

## Design System

### Mobile-First Font Sizing

```css
/* globals.css - Tailwind v4 @theme directive */
@theme {
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 0.875rem;   /* 14px mobile / 16px desktop */
  --text-lg: 1.125rem;     /* 18px mobile / 20px desktop */
  --text-xl: 1.25rem;      /* 20px mobile / 24px desktop */
}
```

**POS Component Guidelines:**
- Product names: `text-xs`
- Prices: `text-sm` to `text-lg`
- Labels/Metadata: `text-[10px]` or `text-[11px]`
- Stock info: `text-[9px]` to `text-[10px]`
- Totals: `text-xl` to `text-2xl`

**Spacing:**
- Mobile: `p-2` to `p-3`, `gap-1.5` to `gap-2`, `h-9` to `h-10` buttons
- Desktop: `p-4` to `p-6`

## Current Implementation Status

### ✅ Phase 1-3 Completed

**Database & Sync:**
- 6 tables: categories, customers, products, sales, utangTransactions, inventoryMovements
- Dexie (local) + Supabase (cloud) with RLS policies
- Manual backup sync with last-write-wins conflict resolution
- Sync stats tracking (↑uploaded ↓downloaded)
- Migration: `07_add_synced_at_column.sql`

**Authentication:**
- Supabase email/password auth
- Data Access Layer (DAL) security with `verifySession()`
- Session persistence + 30-day offline access
- Encrypted session caching (Web Crypto API)

**Testing:**
- Vitest + React Testing Library
- 14/14 tests passing (unit + integration)
- Mocked IndexedDB (fake-indexeddb) and Supabase (vi.mock)

**PWA:**
- Service worker (Serwist)
- Installable on mobile/desktop
- Offline-capable
- Custom install button (beforeinstallprompt API)
- Production-only (`pnpm build` uses --webpack)

**State Management:**
- Zustand stores: auth, cart, sync
- localStorage persistence
- Hooks: useAuth, useCart, useSync

**Pages & UI:**
- ✅ **POS Page**: Product grid, cart, checkout, barcode scanner, atomic transactions, framer-motion animations
- ✅ **Products Page**: CRUD products & categories, search/filter, auto-seed Filipino categories, framer-motion animations
- ✅ **Inventory Page**: Manual adjustments (in/out/adjust), low stock alerts, movement history, framer-motion animations
- ✅ **Layout**: Responsive header, sidebar (desktop), drawer (mobile), sync indicator
- ✅ **Components**: shadcn/ui (button, input, card, badge, dialog, select, popover, textarea, etc.)

### 📋 Todo: Phase 3 Remaining
- [ ] **Utang Page**: Customer credit tracking, payment recording
- [ ] **Reports Page**: Sales reports (daily/weekly/monthly)
- [ ] **Settings Page**: App configuration

### 🎯 Phase 4: Future Enhancements

- CSV import (papaparse)
- Advanced barcode scanner (html5-qrcode)
- Profit calculations
- Multi-store support

## Key Patterns

### Database & Sync
- **Soft delete only**: Set `isDeleted: true`, never hard delete
- **Client-side IDs**: Use `crypto.randomUUID()` or `nanoid()`
- **Update timestamps**: Always update `updatedAt` and reset `syncedAt: null` on changes
- **Filter deleted**: Query with `.filter(item => !item.isDeleted)`
- **Sync order**: categories, customers, products, sales, utangTransactions, inventoryMovements
- **Case conversion**: Use `toSnakeCase()` and `toCamelCase()` helpers in `lib/db/sync.ts`

### Next.js 16 & React 19
- Use `proxy.ts` instead of `middleware.ts` (Next.js 16 naming)
- Dexie components need dynamic imports with `ssr: false`
- PWA/Serwist requires webpack builds (`--webpack` flag)
- Service worker only generates in production (`NODE_ENV === "production"`)

### Authentication & Security
- **Primary security**: Data Access Layer (`lib/dal.ts`) with `verifySession()`
- Call `verifySession()` in ALL protected Server Components/Actions
- Supabase RLS policies with `(select auth.uid()) = user_id` pattern
- Session cache encrypted with Web Crypto API
- Server Actions use React 19 `useActionState` pattern

### State Management
- **Cart**: `lib/stores/cart-store.ts` - shopping cart with validation & persistence
- **Sync**: `lib/stores/sync-store.ts` - manual backup orchestration & stats tracking
- **Auth**: `lib/stores/auth-store.ts` - client auth state (read-only via useAuth hook)

## Key Files

```
lib/db/              # Dexie schema, sync.ts (manual backup logic)
lib/stores/          # Zustand: auth-store, cart-store, sync-store
lib/hooks/           # useAuth, useCart, useSync
lib/actions/         # Server Actions: auth, pos, products, inventory
components/pos/      # POS interface with framer-motion animations
components/products/ # Products & categories with framer-motion animations
components/inventory/# Inventory management with framer-motion animations
components/layout/   # Header, sidebar, sync indicator
app/(dashboard)/     # Protected pages: pos, products, inventory
app/(auth)/          # Login, signup
supabase/migrations/ # Database migrations
```

## What's Working Now

- ✅ Offline-first POS: sales, cart, checkout, barcode scanning
- ✅ Products & categories management with search/filter
- ✅ Inventory management: manual adjustments, low stock alerts, movement history
- ✅ Manual backup sync ("Backup to cloud" button)
- ✅ Auto-restore from Supabase on first login
- ✅ PWA installable with offline support
- ✅ Framer-motion animations (POS, Products, Inventory)
- ✅ Testing infrastructure (14/14 tests passing)
- ✅ Responsive mobile-first design

## What's Left

- Utang (customer credit) tracking page
- Reports page
- Settings page

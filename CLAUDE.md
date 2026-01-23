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
- Supabase email/password auth (email confirmation disabled)
- Simplified signup flow (removed confirm password field)
- Data Access Layer (DAL) security with `verifySession()`
- Session persistence + 30-day offline access via cookies (server-safe)
- Offline detection with user-friendly error messages
- Proactive offline banner on auth pages

**Testing:**
- Vitest + React Testing Library
- 14/14 tests passing (unit + integration)
- Mocked IndexedDB (fake-indexeddb) and Supabase (vi.mock)

**PWA:**
- Service worker (Serwist)
- Installable on mobile/desktop
- Fully offline-capable (works without internet for 30 days)
- Offline navigation between pages (middleware + DAL handle network errors)
- Custom install button (beforeinstallprompt API)
- Production-only (`pnpm build` uses --webpack)

**State Management:**
- Zustand stores: auth, cart, sync, settings
- localStorage persistence
- Hooks: useAuth, useCart, useSync, useSettings

**Pages & UI:**
- ✅ **POS Page**: Product grid, cart, checkout, barcode scanner, atomic transactions, framer-motion animations
- ✅ **Products Page**: Quick Add dialog, inline category creation, 30 auto-seeded Filipino categories, search/filter, no costPrice (sellingPrice only), framer-motion animations
- ✅ **Inventory Page**: Manual adjustments (in/out/adjust), low stock alerts, movement history, framer-motion animations
- ✅ **Utang Page**: Customer credit tracking, payment recording (partial/full), manual charges, transaction history, framer-motion animations
- ✅ **Reports Page**: Sales analytics with date filtering (today/week/month/custom), stats cards, payment breakdown, transaction list, framer-motion animations
- ✅ **Settings Page**: App configuration, theme switching, currency format, data backup/restore, clear local data, framer-motion animations
- ✅ **Layout**: Responsive header, sidebar (desktop), drawer (mobile), sync indicator
- ✅ **Components**: shadcn/ui (button, input, card, badge, dialog, select, popover, textarea, etc.)

### ✅ Phase 3 Completed
- [x] **Utang Page**: Customer credit tracking, payment recording
- [x] **Reports Page**: Sales analytics with date filtering, stats, payment breakdown
- [x] **Settings Page**: App configuration

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
- **User isolation**: ALWAYS filter by userId: `.where('userId').equals(userId)`
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
- Offline session validation via cookies (server-safe, no localStorage on server)
- Middleware (`proxy.ts`) detects network errors (ENOTFOUND, fetch failures)
- Server Actions use React 19 `useActionState` pattern
- User-friendly offline error messages on auth pages

### State Management
- **Cart**: `lib/stores/cart-store.ts` - shopping cart with validation & persistence
- **Sync**: `lib/stores/sync-store.ts` - manual backup orchestration & stats tracking
- **Auth**: `lib/stores/auth-store.ts` - client auth state (read-only via useAuth hook)
- **Settings**: `lib/stores/settings-store.ts` - app configuration (theme, currency)

## Key Files

```
lib/db/              # Dexie schema, sync.ts (manual backup logic)
lib/stores/          # Zustand: auth-store, cart-store, sync-store, settings-store
lib/hooks/           # useAuth, useCart, useSync, useSettings
lib/actions/         # Server Actions: auth, pos, products, inventory, utang, settings
lib/utils/           # Client-side utilities: customer-utils, utang-utils, reports-utils
components/pos/      # POS interface with framer-motion animations
components/products/ # Products & categories with framer-motion animations
components/inventory/# Inventory management with framer-motion animations
components/utang/    # Customer credit tracking with framer-motion animations
components/reports/  # Sales analytics with date filtering and stats with framer-motion animations
components/settings/ # App settings: theme, currency, data management with framer-motion animations
components/layout/   # Header, sidebar, sync indicator
app/(dashboard)/     # Protected pages: pos, products, inventory, utang, reports, settings
app/(auth)/          # Login, signup
supabase/migrations/ # Database migrations
```

## What's Working Now

- ✅ Offline-first POS: sales, cart, checkout, barcode scanning
- ✅ Products & categories management with search/filter
- ✅ Inventory management: manual adjustments, low stock alerts, movement history
- ✅ Utang (customer credit): customer management, payment recording (partial/full), manual charges, transaction history
- ✅ Reports: sales analytics, date filtering (today/week/month/custom), stats cards, payment breakdown, transaction list
- ✅ Settings: theme switching (light/dark/system), currency format, data backup/restore, clear local data
- ✅ Manual backup sync ("Backup to cloud" button)
- ✅ Auto-restore from Supabase on first login
- ✅ PWA installable with offline support
- ✅ Framer-motion animations (POS, Products, Inventory, Utang, Reports, Settings)
- ✅ Testing infrastructure (14/14 tests passing)
- ✅ Responsive mobile-first design

## What's Next

Phase 4 enhancements: CSV import, advanced barcode scanner, profit calculations, multi-store support

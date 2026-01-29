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
- **Local-first auth**: Phone number + 4-6 digit PIN (no email required)
- **No Supabase Auth**: Removed email/password authentication
- **Phone as identifier**: Unique phone number for multi-device restore
- **PIN security**: Hashed PIN stored locally in IndexedDB
- **Session persistence**: PIN saved locally, only asked on new devices
- **Multi-device support**: Login with phone + PIN to restore data from Supabase
- **Backup/Restore**: Phone number used as foreign key for all user data
- Middleware (`proxy.ts`) checks local session for route protection
- Simple UX: Signup in seconds (phone + store name + PIN)

**Testing:**
- Vitest + React Testing Library
- 42/42 tests passing (unit + integration)
- Mocked IndexedDB (fake-indexeddb) and Supabase (vi.mock)
- Comprehensive backup workflow tests (28 tests)
- Catalog isolation tests
- Offline change tracking tests

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
- ✅ **Settings Page**: App configuration, theme switching, data backup/restore, clear local data, account management, framer-motion animations
- ✅ **Layout**: Responsive header, sidebar (desktop), drawer (mobile), sync indicator
- ✅ **Components**: shadcn/ui (button, input, card, badge, dialog, select, popover, textarea, etc.)

### ✅ Phase 3 Completed
- [x] **Utang Page**: Customer credit tracking, payment recording
- [x] **Reports Page**: Sales analytics with date filtering, stats, payment breakdown
- [x] **Settings Page**: App configuration

### ✅ Phase 4: Auth System Refactor (COMPLETED)

**Goal**: Replace Supabase Auth with simple phone + PIN authentication

**Implemented Changes:**

1. **Removed Supabase Auth**
   - ✅ Deleted email/password authentication
   - ✅ Removed `lib/dal.ts` (verifySession, getUser)
   - ✅ Removed `lib/auth/session-cache.ts`
   - ✅ Removed `components/layout/auth-initializer.tsx`
   - ✅ Cleaned up Supabase auth references

2. **New Phone-Based Auth System**
   - ✅ Phone number (09XXXXXXXXX) as unique identifier
   - ✅ 4-6 digit PIN with bcrypt hashing (`lib/auth/pin.ts`)
   - ✅ Store name for UX (display only, not unique)
   - ✅ Session storage: localStorage + cookies (`lib/auth/session.ts`)
   - ✅ Cookies for middleware access (phone stored in cookie)

3. **Database Schema Migration**
   - ✅ Created `stores` table: `{ id, phone, storeName, pinHash, createdAt, updatedAt }`
   - ✅ Replaced `userId` with `storePhone` in all 6 tables
   - ✅ Migration: `11_phone_auth_migration.sql` (applied)
   - ✅ Disabled RLS policies: `12_simplify_rls_policies.sql` (applied)
   - ✅ Updated all IndexedDB schema (Dexie v2 migration)

4. **Auth Actions & Flows**
   - ✅ `signupAction()`: Phone + Store Name + PIN → create account
   - ✅ `loginAction()`: Phone + PIN → verify & restore session
   - ✅ `logoutAction()`: Clear session + optional backup
   - ✅ Auto-restore data from Supabase on login (new device)
   - ✅ No SMS verification (phone is just an identifier)

5. **Static Pages Architecture**
   - ✅ Removed `getUser()` from all page.tsx files
   - ✅ All 13 pages now static (○) - instant offline capability
   - ✅ Client-side auth via `useAuth()` hook
   - ✅ Middleware (`proxy.ts`) checks auth cookie for route protection
   - ✅ Pages: login, signup, pos, products, inventory, utang, reports, settings

6. **Code Updates (89 files changed)**
   - ✅ Updated all components: userId → storePhone prop
   - ✅ Updated all interfaces: userId → storePhone parameter
   - ✅ Updated all actions: userId → storePhone input
   - ✅ Updated all hooks: userId → storePhone parameter
   - ✅ Updated all stores: userId → storePhone queries
   - ✅ Updated all utils: userId → storePhone logic
   - ✅ Updated all types: userId → storePhone in interfaces
   - ✅ Updated sync system: manual filtering by storePhone
   - ✅ Fixed database queries: `.where('userId')` → `.where('storePhone')`

7. **UI Updates**
   - ✅ Login page: Phone + PIN inputs with validation
   - ✅ Signup page: Phone + Store Name + PIN + Confirm PIN
   - ✅ Settings page: Display phone number (read-only)
   - ✅ Auth provider: Simplified localStorage initialization
   - ✅ Logout dialog: Backup before logout flow

**Results:**
- ✅ Build successful - no TypeScript errors
- ✅ All pages static (○) - fully offline-capable
- ✅ Simpler UX (no email required)
- ✅ Instant signup (no verification)
- ✅ Multi-device support via phone + PIN
- ✅ Familiar for Filipino users (like GCash/PayMaya)
- ✅ Session persists across page refreshes
- ✅ Middleware protects routes with cookie-based auth

### 🔮 Phase 5: Future Enhancements

- CSV import (papaparse)
- Advanced barcode scanner (html5-qrcode)
- Profit calculations
- Multi-store support

## Key Patterns

### Database & Sync
- **Offline-first pattern**: All operations hit local IndexedDB first, Supabase is backup/restore ONLY
- **Soft delete only**: Set `isDeleted: true`, never hard delete
- **Client-side IDs**: Use `crypto.randomUUID()` or `nanoid()`
- **Update timestamps**: Always update `updatedAt` and reset `syncedAt: null` on changes
- **Filter deleted**: Query with `.filter(item => !item.isDeleted)`
- **User isolation**: ALWAYS filter by phone: `.where('storePhone').equals(phone)`
- **Phone as foreign key**: All tables use `storePhone` (local) ↔ `store_phone` (cloud)
- **Sync order**: categories, customers, products, sales, utangTransactions, inventoryMovements
- **Case conversion**: Use `toSnakeCase()` and `toCamelCase()` helpers in `lib/db/sync.ts`
- **Auth table**: `stores` table with phone (unique), storeName, pinHash
- **Catalog isolation**: `productCatalog` is local-only, NEVER synced to cloud
- **Change tracking**: Dynamic `hasUnsyncedChanges()` checks `syncedAt === null` across all tables
- **Schema consistency**: No `user_id` columns - only `store_phone` in Supabase

### Next.js 16 & React 19
- Use `proxy.ts` instead of `middleware.ts` (Next.js 16 naming)
- Dexie components need dynamic imports with `ssr: false`
- PWA/Serwist requires webpack builds (`--webpack` flag)
- Service worker only generates in production (`NODE_ENV === "production"`)

### Authentication & Security
- **Local-first auth**: No Supabase Auth, custom phone + PIN implementation
- **Phone number**: Unique identifier (like username), stored in IndexedDB + Supabase
- **PIN hash**: bcrypt-hashed, stored locally in IndexedDB
- **Session**: Phone + PIN hash stored in localStorage for same-device login
- **Multi-device**: Phone + PIN required on new devices, triggers data restore from Supabase
- **Route protection**: Middleware (`proxy.ts`) checks local session, redirects if missing
- **Supabase RLS**: Filter by `store_phone` instead of `auth.uid()`
  - Example: `CREATE POLICY ON products USING (store_phone = current_setting('app.current_phone'))`
- **No server-side auth checks**: Pages are static, auth handled client-side + middleware
- **Security model**: Device lock + PIN protects data (appropriate for single-user POS)

### State Management & Code Organization

**Pattern: Zustand + Custom Hooks for Complex Components**

For complex components with state and business logic, follow this architecture:

1. **Zustand Store** (`lib/stores/`) - Pure state management
   - Only state and simple setters
   - No business logic or API calls
   - Reusable across components

2. **Custom Hook** (`lib/hooks/`) - Business logic
   - Combines Zustand store with API calls
   - Handles side effects (useEffect, API calls, toasts)
   - Returns clean API for component

3. **Component** (`components/`) - Pure UI
   - Only presentation logic
   - Single custom hook call
   - No useState, minimal useEffect

4. **Types** (`lib/types/`) - Centralized type definitions
   - Component props interfaces
   - Hook parameters interfaces
   - Form data types (local state)
   - Separate from action inputs (API payloads)

**Example Structure (Products feature):**

```
lib/types/products.ts           # All types in one organized file
├── Component Props             # ProductFormDialogProps, ProductsListProps
├── Hook Parameters             # UseProductFormParams, UseProductsListParams
└── Form Data Types             # ProductFormData, CategoryFormData

lib/stores/product-form-store.ts    # State only (formData, isLoading, error)
lib/hooks/use-product-form.ts       # Logic (handleSubmit, validation, API calls)
components/products/
├── product-form-dialog.tsx          # UI only (calls useProductForm hook)
├── quick-add-product-dialog.tsx
└── products-list.tsx

lib/actions/products.ts              # Server Actions with input types
└── CreateProductInput, CreateCategoryInput  # API payloads (parsed numbers, userId)
```

**Type Naming Conventions:**
- Component props: `ComponentNameProps` (e.g., `ProductFormDialogProps`)
- Hook params: `UseHookNameParams` (e.g., `UseProductFormParams`)
- Form state: `FormData` (e.g., `ProductFormData` - strings for inputs)
- Action inputs: `CreateXInput` / `UpdateXInput` (e.g., `CreateProductInput` - parsed types)

**Benefits:**
- ✅ Separation of concerns (state / logic / UI)
- ✅ Testability (hooks can be tested independently)
- ✅ Reusability (stores can be accessed anywhere)
- ✅ Type safety (centralized, organized types)
- ✅ Maintainability (changes in one place)

**Existing Zustand Stores:**
- **Cart**: `lib/stores/cart-store.ts` - shopping cart with validation & persistence
- **Sync**: `lib/stores/sync-store.ts` - manual backup orchestration & stats tracking
- **Auth**: `lib/stores/auth-store.ts` - client auth state (read-only via useAuth hook)
- **Settings**: `lib/stores/settings-store.ts` - app configuration (theme, language, timezone) - currency locked to PHP
- **Products**: `lib/stores/product-form-store.ts`, `quick-add-product-store.ts`, `products-list-store.ts`

## Key Files

```
lib/
├── db/              # Dexie schema, sync.ts (manual backup logic)
├── stores/          # Zustand stores (state only)
├── hooks/           # Custom hooks (business logic + API calls)
├── actions/         # Server Actions: auth, pos, products, inventory, utang, settings
├── types/           # Centralized TypeScript types/interfaces
│   ├── index.ts     # Barrel exports
│   └── products.ts  # Product-related types
├── constants/       # Shared constants
│   ├── index.ts     # Barrel exports
│   └── colors.ts    # PRESET_COLORS for category selection
└── utils/           # Client-side utilities: customer-utils, utang-utils, reports-utils

components/
├── pos/             # POS interface with framer-motion animations
├── products/        # Products & categories with framer-motion animations
├── inventory/       # Inventory management with framer-motion animations
├── utang/           # Customer credit tracking with framer-motion animations
├── reports/         # Sales analytics with date filtering and stats with framer-motion animations
├── settings/        # App settings: theme, language, timezone, account, data management with framer-motion animations
└── layout/          # Header, sidebar, sync indicator

app/
├── (dashboard)/     # Protected pages: pos, products, inventory, utang, reports, settings
└── (auth)/          # Login, signup

supabase/migrations/ # Database migrations
```

## What's Working Now

- ✅ Offline-first POS: sales, cart, checkout, barcode scanning
- ✅ Products & categories management with search/filter
- ✅ Inventory management: manual adjustments, low stock alerts, movement history
- ✅ Utang (customer credit): customer management, payment recording (partial/full), manual charges, transaction history
- ✅ Reports: sales analytics, date filtering (today/week/month/custom), stats cards, payment breakdown, transaction list
- ✅ Settings: theme switching (light/dark/system), language/timezone, data backup/restore, account management, clear local data
- ✅ Manual backup sync ("Backup to cloud" button)
- ✅ Auto-restore from Supabase on first login
- ✅ PWA installable with offline support
- ✅ Framer-motion animations (POS, Products, Inventory, Utang, Reports, Settings)
- ✅ Testing infrastructure (14/14 tests passing)
- ✅ Responsive mobile-first design

## What's Next

Phase 4 enhancements: CSV import, advanced barcode scanner, profit calculations, multi-store support

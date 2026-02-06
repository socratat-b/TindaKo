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
- 7 tables: stores (user profiles), categories, customers, products, sales, utangTransactions, inventoryMovements
- Dexie (local) + Supabase (cloud) with RLS policies
- Manual backup sync with last-write-wins conflict resolution
- Sync stats tracking (↑uploaded ↓downloaded)
- Migration: `14_oauth_migration.sql` (latest - OAuth with userId UUID)

**Authentication:**
- **OAuth-based**: Google/Facebook login via Supabase Auth
- **User profiles**: Stored in `stores` table with UUID primary key
- **Session management**: Supabase Auth with httpOnly cookies
- **Multi-device support**: Login with OAuth to sync data from Supabase
- **Backup/Restore**: User ID (UUID) used as foreign key for all user data
- **Offline-first sync**: Profile synced from Supabase to IndexedDB on login
- Middleware (`proxy.ts`) checks Supabase session for route protection
- Simple UX: Login with OAuth → set store name → start using POS

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

### ✅ Phase 4: OAuth Authentication (COMPLETED)

**Goal**: Implement OAuth authentication with Google/Facebook login

**Implemented Changes:**

1. **OAuth Integration with Supabase Auth**
   - ✅ Google and Facebook OAuth providers
   - ✅ Supabase Auth manages sessions with httpOnly cookies
   - ✅ Server-side session validation in middleware
   - ✅ Client-side auth state management with Zustand

2. **User Profile System**
   - ✅ Created `stores` table: `{ id (uuid), email, store_name, avatar_url, provider, created_at, updated_at }`
   - ✅ User ID is UUID from Supabase auth.users table
   - ✅ Profile synced from Supabase to IndexedDB for offline access
   - ✅ Store name editable by user in settings

3. **Database Schema**
   - ✅ All tables use `user_id` (uuid) foreign key referencing stores(id)
   - ✅ Migration: `14_oauth_migration.sql` (applied)
   - ✅ RLS policies: Automatic user isolation via auth.uid()
   - ✅ Dexie version 4: storePhone → userId migration

4. **Auth Flows**
   - ✅ `setupStoreAction()`: Set store name after first OAuth login
   - ✅ `updateStoreNameAction()`: Update store name in settings
   - ✅ `logoutAction()`: Sign out from Supabase
   - ✅ Auto-restore data from Supabase on login (profile sync)
   - ✅ First-time users redirected to store-setup page

5. **Static Pages Architecture**
   - ✅ All 15 pages static (○) - instant offline capability
   - ✅ Client-side auth via `useAuth()` hook
   - ✅ Middleware (`proxy.ts`) checks Supabase session for route protection
   - ✅ AuthProvider syncs user profile from Supabase to IndexedDB

6. **Code Updates**
   - ✅ All components use userId (UUID) for data queries
   - ✅ All actions use userId parameter
   - ✅ All hooks use userId parameter
   - ✅ All types use userId in interfaces
   - ✅ Database queries: `.where('userId').equals(userId)`
   - ✅ Sync system filters by userId

7. **UI Updates**
   - ✅ Login page: Google/Facebook OAuth buttons
   - ✅ Store setup page: Set store name after first login
   - ✅ Settings page: Display email, store name (editable)
   - ✅ Auth provider: Syncs profile from Supabase to IndexedDB
   - ✅ Logout: Clears Supabase session

**Results:**
- ✅ Build successful - no TypeScript errors
- ✅ All pages static (○) - fully offline-capable
- ✅ Secure OAuth with Google/Facebook
- ✅ Automatic RLS via Supabase Auth
- ✅ Multi-device support via OAuth login
- ✅ Session persists with httpOnly cookies
- ✅ Middleware protects routes with Supabase session

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
- **User isolation**: ALWAYS filter by userId: `.where('userId').equals(userId)`
- **userId as foreign key**: All tables use `userId` (local) ↔ `user_id` (cloud)
- **Sync order**: categories, customers, products, sales, utangTransactions, inventoryMovements
- **Case conversion**: Use `toSnakeCase()` and `toCamelCase()` helpers in `lib/db/sync.ts`
- **Auth table**: `stores` table with id (uuid), email, store_name, avatar_url, provider
- **Catalog isolation**: `productCatalog` is local-only, NEVER synced to cloud
- **Change tracking**: Dynamic `hasUnsyncedChanges()` checks `syncedAt === null` across all tables
- **Schema consistency**: All data tables use `user_id` (uuid) foreign key in Supabase

### Next.js 16 & React 19
- Use `proxy.ts` instead of `middleware.ts` (Next.js 16 naming)
- Dexie components need dynamic imports with `ssr: false`
- PWA/Serwist requires webpack builds (`--webpack` flag)
- Service worker only generates in production (`NODE_ENV === "production"`)

### Authentication & Security
- **OAuth authentication**: Google/Facebook login via Supabase Auth
- **User ID**: UUID from Supabase auth.users table
- **Session**: httpOnly cookies managed by Supabase Auth
- **Profile sync**: User profile synced from Supabase to IndexedDB for offline access
- **Multi-device**: OAuth login syncs data from Supabase to new device
- **Route protection**: Middleware (`proxy.ts`) checks Supabase session, redirects if missing
- **Supabase RLS**: Automatic user isolation via `auth.uid()`
  - Example: `CREATE POLICY ON products USING (auth.uid() = user_id)`
- **No server-side auth checks**: Pages are static, auth handled client-side + middleware
- **Security model**: OAuth + RLS ensures secure multi-user access

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TindaKo is an offline-first POS (Point of Sale) PWA for Sari-Sari stores (Philippine convenience stores). It uses a local-first architecture with cloud sync.

## Commands

```bash
pnpm dev      # Start dev server (Turbopack, default in Next.js 16)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Architecture

```
UI (React 19) → Zustand (state) → Dexie (IndexedDB) ↔ Sync → Supabase (cloud)
```

- **Offline-first**: All operations hit local Dexie/IndexedDB first
- **Sync strategy**: Periodic (5min) + manual + on-close
- **Conflict resolution**: Last-write-wins via `updatedAt` timestamps

## Tech Stack

- Next.js 16.1.3 + React 19 + Tailwind v4
- Supabase (PostgreSQL + Auth)
- Dexie.js (IndexedDB wrapper)
- Zustand v5 (state management)
- Serwist (PWA/service worker)

## Current Implementation Status

### ✅ Phase 1: Database Layer (COMPLETED)

**Implemented Files:**
```
lib/db/
  ├── schema.ts        # TypeScript interfaces for all 6 tables
  ├── index.ts         # Dexie database with indexes
  └── sync.ts          # Bidirectional sync logic (with userId filtering)
lib/supabase/
  └── client.ts        # Browser Supabase client
supabase/migrations/   # SQL migrations for all tables
.env.example           # Environment variable template
.mcp.json.example      # MCP server config template
```

**Database Tables:**
- categories (name, color, sortOrder)
- customers (name, phone, totalUtang)
- products (name, barcode, categoryId, prices, stock)
- sales (items[], totals, payment details)
- utangTransactions (customerId, saleId, type, amount)
- inventoryMovements (productId, type, qty, notes)

All tables include: id, userId, createdAt, updatedAt, syncedAt, isDeleted

### ✅ Phase 2: Authentication (COMPLETED)

**Implemented Files:**
```
lib/
  ├── dal.ts                              # Data Access Layer (PRIMARY SECURITY)
  ├── supabase/server.ts                  # Server-side Supabase client
  ├── actions/auth.ts                     # Server Actions (useActionState pattern)
  ├── stores/auth-store.ts                # Zustand auth state
  └── hooks/use-auth.ts                   # Client auth hook (read-only state)
components/
  ├── auth/submit-button.tsx              # Reusable submit button with pending state
  └── providers/auth-provider.tsx         # Auth state synchronization
app/
  ├── (auth)/
  │   ├── login/page.tsx                  # Login form (useActionState)
  │   └── signup/page.tsx                 # Signup form (useActionState)
  ├── (dashboard)/
  │   ├── layout.tsx                      # Protected layout with DAL
  │   └── pos/page.tsx                    # POS placeholder
  └── layout.tsx                          # Root layout with AuthProvider
proxy.ts                                  # Optimistic auth checks (Next.js 16)
```

**Security Features:**
- Primary security via Data Access Layer (not proxy)
- Server Actions with useActionState (React 19 pattern)
- Progressive enhancement (forms work without JS)
- Optimistic redirects in proxy.ts
- User isolation in all sync operations
- Session persistence in localStorage

### ✅ Phase 3: State Management & Sync Orchestration (COMPLETED)

**Implemented Files:**
```
lib/stores/
  ├── cart-store.ts              # Shopping cart state with persistence
  └── sync-store.ts              # Sync orchestration (periodic + manual + on-close)
lib/hooks/
  ├── use-cart.ts                # Cart management hook with auto pending tracking
  └── use-sync.ts                # Sync state and manual trigger hook
components/providers/
  └── sync-provider.tsx          # Auto-initializes sync when authenticated
app/layout.tsx                   # Updated with SyncProvider
```

**Cart Store Features:**
- Add/remove items with stock validation
- Update quantities with bounds checking
- Customer selection
- Discount management
- Payment method selection (cash/gcash/card)
- Automatic subtotal/total calculation
- localStorage persistence

**Sync Orchestration:**
- **Periodic sync**: Every 5 minutes (configurable interval)
- **Manual sync**: Via `sync()` method
- **Auto-sync on**:
  - Window close/beforeunload (if pending changes)
  - Tab visibility change (when hidden)
  - Window focus (if >5min since last sync)
- Prevents concurrent syncs
- Tracks sync status, errors, and pending changes

**Usage Example:**
```typescript
import { useCart } from '@/lib/hooks/use-cart'
import { useSync } from '@/lib/hooks/use-sync'

function POSComponent() {
  const { items, addItem, total } = useCart()
  const { isSyncing, sync, hasPendingChanges } = useSync()

  // Cart automatically marks pending changes
  // Sync runs automatically in background
  // Manual sync available via sync() method
}
```

### ✅ Phase 3: PWA Setup (COMPLETED & TESTED)

**Implemented Files:**
```
app/
  ├── page.tsx                 # Landing page with PWA install feature
  ├── sw.ts                    # Service worker with Serwist
  └── manifest.ts              # PWA manifest
components/pwa/
  └── install-button.tsx       # Custom PWA install button (uses beforeinstallprompt)
proxy.ts                       # Updated to allow public routes (/, /login, /signup)
next.config.ts                 # Configured with Serwist plugin (webpack mode)
package.json                   # Build script updated with --webpack flag
public/
  ├── icon-192.svg             # PWA icon (192x192)
  ├── icon-512.svg             # PWA icon (512x512)
  └── sw.js                    # Generated service worker (42.8 KB)
```

**PWA Features:**
- **Custom install button** with `beforeinstallprompt` API (Chrome, Edge, Android)
- **iOS fallback instructions** (Safari doesn't support custom install prompts)
- **Landing page** at `/` showcasing app features and install option
- **Public routes** - Landing page accessible without authentication
- Service worker with precaching and runtime caching
- PWA manifest with app metadata and icons
- Offline-capable (disabled in non-production environments)
- Installable on mobile and desktop browsers
- Theme color: #10b981 (emerald-500)
- Standalone display mode
- Start URL: /pos

**Build Configuration:**
- Uses webpack instead of Turbopack (Serwist requirement)
- Build command: `pnpm build` (uses `--webpack` flag)
- Service worker only enabled in production (`NODE_ENV === "production"`)
- Generates service worker at `public/sw.js` during build

**Installation UX:**
- Landing page at `/` with prominent "Install App" button
- Custom install prompt works on Chrome, Edge, Samsung Internet (Android/Desktop)
- iOS users see instructions: "Tap Share → Add to Home Screen"
- Auto-detects if already installed (button hides)
- Auto-detects iOS devices and shows appropriate UI

**Testing Notes:**
- Build verified successful
- Service worker generated correctly
- Manifest accessible at `/manifest.webmanifest`
- Icons use SVG format (replace with PNG/WebP for better browser support)
- Landing page accessible and responsive

**Known Limitations:**
- Serwist doesn't support Next.js 16 Turbopack yet (webpack fallback configured)
- PWA features only work in production build (`pnpm build && pnpm start`)
- SVG icons may not work on all browsers (recommend PNG for production)
- iOS Safari doesn't support `beforeinstallprompt` (fallback instructions provided)

### 📋 Todo: Phase 3 (Remaining)

**Folder Structure to Create:**
```
app/(dashboard)/
  ├── products/        # Product & category management
  ├── inventory/       # Stock adjustments & alerts
  ├── utang/          # Customer credit tracking
  ├── reports/        # Sales reports
  └── settings/       # App settings
components/
  ├── ui/             # Shared UI components
  ├── pos/            # POS-specific components
  ├── products/       # Product components
  └── layout/         # Layout components (sidebar, navbar)
```

## Key Patterns

### Database & Sync
- **Soft delete only**: Set `isDeleted: true`, never hard delete
- **Client-side IDs**: Generate IDs with `crypto.randomUUID()` or `nanoid()`
- **Update timestamps**: Always update `updatedAt` and reset `syncedAt: null` on changes
- **Filter deleted**: Always query with `.where('isDeleted').equals(false)` or `.filter(item => !item.isDeleted)`
- **Sync order**: Sync in dependency order (categories, customers, products, sales, utangTransactions, inventoryMovements)
- **camelCase ↔ snake_case**: Use `toSnakeCase()` and `toCamelCase()` helpers in sync.ts

### Next.js 16 & React 19
- **Use `proxy.ts` instead of `middleware.ts`**: Next.js 16 renamed middleware to proxy
- Dexie components must use dynamic imports with `ssr: false`
- **PWA/Serwist**: Use webpack for builds (`--webpack` flag) as Serwist doesn't support Turbopack yet
- Disable Serwist in non-production environments (`NODE_ENV !== "production"`)
- Service worker only generates on production builds (`pnpm build`)

### Authentication & Security

**Security Architecture (Hybrid Offline-First):**
1. **Primary Security: Data Access Layer (DAL)** - `lib/dal.ts` with `verifySession()` and `getUser()`
   - Uses React `cache()` to avoid duplicate calls
   - Tries online first, falls back to cached session offline
   - Returns `mode: 'online' | 'offline'` and `requiresRefresh` flags
   - Call `verifySession()` in ALL protected Server Components, Server Actions, and Route Handlers
2. **Session Caching** - `lib/auth/session-cache.ts`
   - localStorage with Web Crypto API encryption (AES-GCM 256-bit)
   - 30-day offline access after login
   - Background token refresh (every 5 min when online)
   - Auto-refresh on tab focus/visibility change
3. **Optimistic Checks: proxy.ts** - Quick permission-based redirects for better UX
   - Gracefully handles network errors (allows through, DAL validates)
   - NOT the primary security layer (DAL is)
4. **Auth Operations: Server Actions** - `lib/actions/auth.ts` (signupAction, loginAction, logoutAction)
   - Uses React 19 `useActionState` pattern for forms
   - Server-side validation (password matching, length checks)
   - Progressive enhancement (works without JavaScript)
5. **Client State: Zustand** - `lib/stores/auth-store.ts` for UI state + offline tracking
   - `isOffline: boolean` - Network status
   - `lastSyncTime: number | null` - Last successful sync
   - Read-only access via `useAuth()` hook

**Key Auth Files:**
- `lib/dal.ts` - PRIMARY security with offline fallback
- `lib/auth/session-cache.ts` - Session caching + offline validation
- `lib/hooks/use-online-status.ts` - Online/offline status tracking
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/actions/auth.ts` - Server Actions (useActionState pattern)
- `proxy.ts` - Optimistic redirects with network error handling
- `lib/stores/auth-store.ts` - Client auth state + offline tracking
- `lib/hooks/use-auth.ts` - Read-only auth state hook
- `components/auth/submit-button.tsx` - Reusable form submit button
- `components/providers/auth-provider.tsx` - Session caching + background refresh

**Key State Management Files:**
- `lib/stores/cart-store.ts` - Shopping cart with validation & persistence
- `lib/stores/sync-store.ts` - Sync orchestration & status tracking
- `lib/hooks/use-cart.ts` - Cart management with auto pending tracking
- `lib/hooks/use-sync.ts` - Sync state & manual trigger
- `components/providers/sync-provider.tsx` - Auto-initializes sync

**Offline Capabilities:**
- Login once → Works offline for 30 days
- All local operations (sales, products, inventory) work offline
- Sync queued until online (background sync every 5 min)
- Explicit logout clears cache (requires re-login with internet)
- Token refresh prevents expiry when online

**Important:**
- All Supabase tables have RLS enabled with user-scoped policies
- Use `(select auth.uid()) = user_id` pattern for optimal RLS performance
- Always use `verifySession()` at the start of protected Server Components/Actions
- Session cache encrypted with Web Crypto API (never store tokens in plain text)

## Project Status Summary

### ✅ What Works Now (Phases 1-3 Foundation Complete)
- Database schema with 6 tables (categories, customers, products, sales, utangTransactions, inventoryMovements)
- Bidirectional sync between Dexie (local) and Supabase (cloud)
- **Hybrid offline-first authentication:**
  - Login once → Works offline for 30 days
  - Encrypted session caching (Web Crypto API)
  - Background token refresh (every 5 min)
  - Graceful network error handling
  - Automatic sync when online
- Protected routes with Data Access Layer security
- User-scoped data isolation (RLS + userId filtering)
- Session persistence across page refreshes + offline access
- **State management:**
  - Shopping cart with stock validation and persistence
  - Automatic sync orchestration (5min periodic + manual + on-close)
  - Pending changes tracking
  - Convenient hooks for cart and sync access
- **PWA capabilities (tested & working):**
  - Service worker with precaching and runtime caching
  - Installable on mobile and desktop browsers
  - Offline-ready architecture with IndexedDB
  - App manifest configured (/manifest.webmanifest)
  - Production build generates optimized service worker (42.8 KB)

### 🚧 What's Next (Phase 3 Remaining)
- UI component library
- POS page implementation (product grid, cart, checkout)
- Products & categories management pages
- Inventory management with low stock alerts
- Utang (credit) tracking pages
- Sales reports

### 🎯 Ready to Test

**Development Mode:**
```bash
# Start dev server (no PWA features)
pnpm dev

# Visit http://localhost:3000
# - See landing page with app features
# - Click "Log in" or sign up
# - After auth, redirects to /pos
# - Session persists on refresh
# - Try logging out and back in
```

**Production Mode (with PWA):**
```bash
# Build and start production server
pnpm build
pnpm start

# Visit http://localhost:3000
# - Landing page shows "Install App" button
# - Click "Install App" to trigger browser's install dialog
# - On iOS: Shows instructions for manual "Add to Home Screen"
# - After install, button hides (detects standalone mode)
# - Test PWA installation and offline mode
# - Check Chrome DevTools > Application > Manifest
# - Test offline mode: DevTools > Network > Offline
# - Verify service worker: DevTools > Application > Service Workers
```

**Environment Setup Required:**
- Copy `.env.example` to `.env.local`
- Add your Supabase URL and anon key
- Run migrations via Supabase dashboard or CLI


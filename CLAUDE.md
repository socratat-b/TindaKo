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
  ├── actions/auth.ts                     # Server Actions (signup/login/logout)
  ├── stores/auth-store.ts                # Zustand auth state
  └── hooks/use-auth.ts                   # Client auth hook
components/providers/
  └── auth-provider.tsx                   # Auth state synchronization
app/
  ├── (auth)/
  │   ├── login/page.tsx                  # Login form
  │   └── signup/page.tsx                 # Signup form
  ├── (dashboard)/
  │   ├── layout.tsx                      # Protected layout with DAL
  │   └── pos/page.tsx                    # POS placeholder
  └── layout.tsx                          # Root layout with AuthProvider
proxy.ts                                  # Optimistic auth checks (Next.js 16)
```

**Security Features:**
- Primary security via Data Access Layer (not proxy)
- Server Actions for secure auth operations
- Optimistic redirects in proxy.ts
- User isolation in all sync operations
- Session persistence in localStorage

### 📋 Todo: Phase 3

**Folder Structure to Create:**
```
app/(dashboard)/
  ├── products/        # Product & category management
  ├── inventory/       # Stock adjustments & alerts
  ├── utang/          # Customer credit tracking
  ├── reports/        # Sales reports
  └── settings/       # App settings
app/manifest.ts       # PWA manifest
app/sw.ts             # Service worker
components/
  ├── ui/             # Shared UI components
  ├── pos/            # POS-specific components
  ├── products/       # Product components
  └── layout/         # Layout components (sidebar, navbar)
lib/stores/
  ├── cart-store.ts   # Shopping cart state
  └── sync-store.ts   # Sync orchestration
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
- Disable Serwist in development to avoid cache issues

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
4. **Auth Operations: Server Actions** - `lib/actions/auth.ts` for signup/login/logout
   - More secure than client-side auth (credentials never exposed to client)
5. **Client State: Zustand** - `lib/stores/auth-store.ts` for UI state + offline tracking
   - `isOffline: boolean` - Network status
   - `lastSyncTime: number | null` - Last successful sync

**Key Files:**
- `lib/dal.ts` - PRIMARY security with offline fallback
- `lib/auth/session-cache.ts` - Session caching + offline validation
- `lib/hooks/use-online-status.ts` - Online/offline status tracking
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/actions/auth.ts` - Server Actions for auth operations
- `proxy.ts` - Optimistic redirects with network error handling
- `lib/stores/auth-store.ts` - Client auth state + offline tracking
- `lib/hooks/use-auth.ts` - Client hook for auth operations
- `components/providers/auth-provider.tsx` - Session caching + background refresh

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

### ✅ What Works Now (Phases 1-2 Complete)
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

### 🚧 What's Next (Phase 3)
- PWA setup (manifest + service worker)
- UI component library
- Shopping cart state management
- Sync orchestration (5min periodic + manual + on-close)
- POS page implementation (product grid, cart, checkout)
- Products & categories management pages
- Inventory management with low stock alerts
- Utang (credit) tracking pages
- Sales reports

### 🎯 Ready to Test
```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000
# - Creates/signs in with email/password
# - Redirects to /pos after auth
# - Session persists on refresh
# - Try logging out and back in
```

**Environment Setup Required:**
- Copy `.env.example` to `.env.local`
- Add your Supabase URL and anon key
- Run migrations via Supabase dashboard or CLI


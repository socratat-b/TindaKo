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
  └── sync.ts          # Bidirectional sync logic
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

### 📋 Todo: Phase 2

**Folder Structure to Create:**
```
app/(auth)/          # login, signup
app/(dashboard)/     # pos, products, inventory, utang, reports, settings
app/manifest.ts      # PWA manifest
app/sw.ts            # Service worker
components/ui/       # Shared UI components
components/pos/      # POS-specific components
lib/stores/          # Zustand stores
lib/hooks/           # Custom hooks
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
- Use `proxy.ts` instead of `middleware.ts` for auth (Next.js 16 change)
- Dexie components must use dynamic imports with `ssr: false`
- Disable Serwist in development to avoid cache issues

### Security
- All Supabase tables have RLS enabled with user-scoped policies
- Use `(select auth.uid()) = user_id` pattern for optimal RLS performance

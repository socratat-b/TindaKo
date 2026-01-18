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

## Planned Folder Structure

```
app/(auth)/          # login, signup
app/(dashboard)/     # pos, products, inventory, utang, reports, settings
app/manifest.ts      # PWA manifest
app/sw.ts            # Service worker
components/ui/       # Shared UI components
components/pos/      # POS-specific components
lib/db/              # Dexie database layer
lib/supabase/        # Supabase clients
lib/stores/          # Zustand stores
lib/hooks/           # Custom hooks
```

## Key Patterns

- Use `proxy.ts` instead of `middleware.ts` for auth (Next.js 16 change)
- Dexie components must use dynamic imports with `ssr: false`
- All DB tables include: `id`, `userId`, `syncedAt`, `updatedAt`, `isDeleted`
- Disable Serwist in development to avoid cache issues

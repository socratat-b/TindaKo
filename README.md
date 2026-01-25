# TindaKo

**Business management system for Philippine Sari-Sari stores**

TindaKo is an offline-first Progressive Web App (PWA) designed to help small Filipino retailers manage their stores efficiently. Works completely offline with optional cloud backup.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19-blue)

## Features

- **📱 Point of Sale (POS)** - Fast checkout with barcode scanning, multiple payment methods (Cash, GCash, Utang)
- **📦 Products & Inventory** - Manage products, categories, stock levels with low-stock alerts
- **👥 Utang Management** - Track customer credit (utang), record payments, view transaction history
- **📊 Sales Reports** - View sales analytics with date filtering, transaction history
- **⚙️ Settings** - Theme switching, data backup/restore, account management
- **🔒 Offline-First** - All operations work without internet; data syncs when online
- **📲 PWA** - Install on mobile/desktop, works like a native app

## Tech Stack

- **Frontend**: Next.js 16.1.3, React 19, Tailwind CSS v4
- **State Management**: Zustand v5
- **Local Database**: Dexie.js (IndexedDB)
- **Cloud Backup**: Supabase (PostgreSQL + Auth)
- **PWA**: Serwist (Service Worker)
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library

## Architecture

```
UI (React 19) → Zustand (state) → Dexie (IndexedDB) ↔ Manual Sync → Supabase (cloud backup)
```

- **Offline-first**: All operations hit local IndexedDB first
- **Manual sync**: User clicks "Backup to cloud" button
- **Conflict resolution**: Last-write-wins via timestamp comparison
- **30-day offline access**: Works without internet for extended periods

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account (for cloud backup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/socratat-b/TindaKo.git
   cd TindaKo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**
   - Go to your Supabase project dashboard
   - Execute the SQL files in `supabase/migrations/` in order

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build    # Production build with PWA support
pnpm start    # Start production server
```

## Available Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build (uses --webpack for Serwist)
pnpm start        # Production server
pnpm lint         # ESLint
pnpm test         # Run tests (Vitest)
pnpm test:ui      # Vitest UI
```

## Database Schema

6 core tables with Row Level Security (RLS):
- `categories` - Product categories
- `products` - Product catalog
- `customers` - Customer records
- `sales` - Sales transactions
- `utang_transactions` - Credit/payment records
- `inventory_movements` - Stock adjustments

All tables support:
- Soft delete (`is_deleted`)
- User isolation (`user_id`)
- Sync tracking (`synced_at`, `updated_at`)

## Key Patterns

### Data Operations
- **Soft delete only**: Set `isDeleted: true`, never hard delete
- **Client-side IDs**: Use `crypto.randomUUID()` for offline-first
- **Sync tracking**: `syncedAt: null` marks records as unsynced
- **User isolation**: All queries filter by `userId`

### Change Tracking
Every create/update/delete operation:
1. Sets `syncedAt: null` (marks as unsynced)
2. Updates `updatedAt` timestamp
3. Shows in pending changes indicator
4. Syncs when user clicks "Backup to cloud"

## Project Structure

```
tindako/
├── app/
│   ├── (auth)/              # Login, signup pages
│   └── (dashboard)/         # Protected pages (pos, products, etc.)
├── components/
│   ├── layout/              # Header, sidebar, sync indicator
│   ├── pos/                 # POS interface
│   ├── products/            # Product & category management
│   ├── inventory/           # Inventory management
│   ├── utang/               # Customer credit tracking
│   ├── reports/             # Sales analytics
│   └── settings/            # App settings
├── lib/
│   ├── actions/             # Server Actions
│   ├── db/                  # Dexie schema, sync logic
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
└── supabase/
    └── migrations/          # Database migrations
```

## Testing

14 tests covering:
- Unit tests (customer utils, utang calculations)
- Integration tests (auth flow, multi-user isolation)

```bash
pnpm test       # Run all tests
pnpm test:ui    # Open Vitest UI
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) file for details

## Developer

**Scott Andrew Bedis**
- Email: bedisscottandrew@gmail.com
- GitHub: [@socratat-b](https://github.com/socratat-b)

---

Built with ❤️ for Filipino sari-sari store owners

---
description: Add a new database table to Dexie and Supabase
argument-hint: [table-name]
allowed-tools: Write, Read, Edit
---

Add a new table `$1` to both Dexie (local) and prepare Supabase SQL.

Steps:
1. Add TypeScript interface to lib/db/schema.ts
2. Add table to Dexie stores in lib/db/index.ts
3. Generate Supabase SQL migration with RLS

Follow the schema pattern from plan.md:
- All tables: id, userId, syncedAt, updatedAt, isDeleted
- Add table-specific fields

Reference: @plan.md

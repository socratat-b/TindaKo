---
description: Generate sync logic for a table
argument-hint: [table-name]
allowed-tools: Write, Read, Edit
---

Generate Dexie ↔ Supabase sync logic for the `$1` table.

Include:
1. Push local changes to Supabase
2. Pull remote changes to Dexie
3. Conflict resolution (last-write-wins via updatedAt)
4. Handle soft deletes (isDeleted flag)

Add to lib/db/sync.ts following the hybrid sync strategy:
- Periodic (5 min)
- Manual trigger
- On app close

Reference: @plan.md

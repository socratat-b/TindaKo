---
description: Create a Zustand store
argument-hint: [store-name]
allowed-tools: Write, Read
---

Create a Zustand v5 store `$1-store.ts` in lib/stores/.

Requirements:
- TypeScript interface for state
- Use persist middleware if state should survive refresh
- Follow Next.js SSR-safe patterns
- Include actions for state mutations

Existing stores for reference:
!`ls lib/stores/ 2>/dev/null || echo "No stores yet"`

Pattern from plan.md: @plan.md

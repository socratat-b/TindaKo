---
description: Create a custom React hook
argument-hint: [hook-name]
allowed-tools: Write, Read
---

Create a custom hook `use$1` in lib/hooks/.

Requirements:
- TypeScript with proper return types
- Handle loading/error states if async
- Use Dexie's useLiveQuery for reactive data if DB-related
- Follow React 19 patterns

Existing hooks for reference:
!`ls lib/hooks/ 2>/dev/null || echo "No hooks yet"`

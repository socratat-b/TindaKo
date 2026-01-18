---
description: Scaffold a complete feature
argument-hint: [feature-name]
allowed-tools: Write, Read, Glob, Bash(mkdir:*)
---

Scaffold the `$1` feature based on plan.md requirements.

This will create:
1. Page in app/(dashboard)/$1/
2. Related components in components/$1/
3. Hooks in lib/hooks/ if needed
4. Zustand store if needed
5. Dexie table updates if needed

Reference the plan for feature requirements: @plan.md

Current project structure:
!`find app components lib -type d 2>/dev/null | head -20 || echo "Fresh project"`

---
description: Create a new Next.js page
argument-hint: [page-path]
allowed-tools: Write, Read, Glob, Bash(mkdir:*)
---

Create a new Next.js App Router page at `app/$1/page.tsx`.

Requirements:
- Follow Next.js 16 App Router conventions
- Include proper metadata export if needed
- Use TypeScript
- Reference plan.md for feature context

Current app structure:
!`find app -name "*.tsx" 2>/dev/null || echo "No pages yet"`

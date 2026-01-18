---
description: Create a new React component
argument-hint: [component-name] [folder]
allowed-tools: Write, Read, Glob
---

Create a new React component named `$1` in the `$2` folder (default: components/ui).

Requirements:
- Use TypeScript with proper types
- Use "use client" directive if needed
- Follow existing component patterns in the codebase
- Use Tailwind v4 for styling
- Export as named export
- Include proper props interface

Check existing components first for patterns:
!`ls -la components/ 2>/dev/null || echo "No components folder yet"`

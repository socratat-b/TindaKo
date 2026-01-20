# Git Commit Commands

## Add all UI component files

```bash
git add components/ui/ components/layout/ lib/utils.ts components.json
git add app/(dashboard)/layout.tsx
git add CLAUDE.md plan.md
git add package.json pnpm-lock.yaml
```

## Commit message

```bash
git commit -m "feat: implement UI components and dashboard layout

- Initialize shadcn/ui with Tailwind v4
- Add core UI components (button, input, label, card, badge, separator)
- Create dashboard layout with responsive sidebar and header
- Add sync indicator showing real-time sync status
- Update dashboard layout to use new components
- Create component folders for pos/ and products/

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Or combine in one command

```bash
git add components/ui/ components/layout/ lib/utils.ts components.json app/(dashboard)/layout.tsx CLAUDE.md plan.md package.json pnpm-lock.yaml && git commit -m "feat: implement UI components and dashboard layout

- Initialize shadcn/ui with Tailwind v4
- Add core UI components (button, input, label, card, badge, separator)
- Create dashboard layout with responsive sidebar and header
- Add sync indicator showing real-time sync status
- Update dashboard layout to use new components
- Create component folders for pos/ and products/

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

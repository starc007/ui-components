---
name: beui
description: Install, compose, debug, and contribute beUI motion components — copy-paste React source via the shadcn-compatible @beui registry. Use when working with beUI, beui.dev, @beui/ installs, motion components, agent UI primitives, or the starc007/ui-components repository.
---

# beUI

Animated React components distributed as copy-paste source through the shadcn registry. Live at [beui.dev](https://beui.dev). Namespace: `@beui`.

Install with the project's package runner (`npx`, `pnpm dlx`, or `bunx --bun`):

```bash
npx shadcn@latest add @beui/animated-toast-stack
npx shadcn@latest add https://beui.dev/r/animated-toast-stack.json
```

## Agent endpoints

Fetch these instead of scraping the site:

```txt
https://beui.dev/llms.txt
https://beui.dev/r
https://beui.dev/r/{slug}
https://beui.dev/r/{slug}.json
https://beui.dev/r/{slug}/raw
```

1. Read `llms.txt` or `/r` to discover slugs.
2. Fetch `/r/{slug}.json` for files, deps, and source.
3. Drop files at the listed paths. Internal `@/lib` helpers ship in the `files` array.

Never rename or break `/r/{name}.json` slugs — they are public contract.

## Use existing components first

Before writing custom UI, check the catalog in `AGENTS.md` or `https://beui.dev/llms.txt`. Compose from primitives (`Button`, `Tabs`, `Popover`) rather than inventing a parallel widget.

Common installs:

| Need | Install |
| --- | --- |
| Button / press | `@beui/button-base`, `@beui/button-stateful`, `@beui/button-magnetic` |
| Overlay | `@beui/popover`, `@beui/popover-morph`, `@beui/center-morph-modal`, `@beui/bottom-sheet`, `@beui/drawer` |
| Menu | `@beui/context-menu`, `@beui/command-palette`, `@beui/bloom-menu` |
| Form | `@beui/input`, `@beui/select`, `@beui/combobox`, `@beui/checkbox`, `@beui/signup-form` |
| Chat / agents | `@beui/chat-app`, `@beui/message-bubble`, `@beui/prompt-input`, `@beui/agent-activity` |
| Feedback | `@beui/animated-toast-stack`, `@beui/tooltip` |

## Motion conventions

These are required, not style nits:

- Import easing from `lib/ease.ts`: `EASE_OUT`, `SPRING_PRESS`, `SPRING_SWAP`, `SPRING_PANEL`, `SPRING_LAYOUT`, `SPRING_MOUSE`. No inline `cubic-bezier` or one-off springs unless component-specific, and comment why.
- Gate transform motion with `useReducedMotion()` from `motion/react`. Keep opacity/color; drop movement. CSS `prefers-reduced-motion` does not stop JS springs.
- Gate decorative hover (magnetic, tilt) with `useHoverCapable()` from `lib/hooks/use-hover-capable`.
- Animate `transform` and `opacity` only. Blur ≤ 10px. Exits faster than entrances. UI under ~300ms; press ~100–160ms.
- Named exports. Merge `className` with `cn()` from `lib/utils`. Interactive components are `"use client"`.

```tsx
import { useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function Example({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={SPRING_PRESS}
      className={cn("rounded-full", className)}
    />
  );
}
```

## Overlays

Dialogs (`BottomSheet`, `Drawer`, `CenterMorphModal`, `CommandPalette`) must:

- Close on Escape
- Use a real `role="dialog"` name (`aria-labelledby` a visible heading, or `aria-label`)
- Portal to `document.body` when they would otherwise clip

Do not nest interactive elements. Use a `<button>` for clicks.

## Contributing to this repo

Stack: Next.js App Router, React 19, Tailwind CSS 4, motion v11, TypeScript strict, Bun, Biome.

```bash
bun install
bun run check          # typecheck + lint + registry
bun run test           # bun test
```

Do not start the dev server or run `bun run build` unless asked.

New component = source + preview + `lib/registry.ts` entry in the same change.

- Source: `components/motion/` or `components/agents/`
- Preview: `components/previews/<category>/`
- Registry: `lib/registry.ts`. Set `launchedAt` (`YYYY-MM-DD`) on new entries.
- Run `bun run check:registry` before committing.

Commits: `feat:`, `fix:`, `docs:` — imperative subject. No AI attribution or `Co-Authored-By` lines.

Full layout, catalog, and conventions: [AGENTS.md](../../AGENTS.md).

# beUI v2 — agent guide

React motion component library plus its docs site, distributed as copy-paste source via shadcn-compatible registry endpoints. Stack: Next.js 15 (App Router), React 19, Tailwind CSS 4, motion (framer-motion) v11, TypeScript strict, Bun, Biome. Live at beui.saura3h.xyz.

## Commands

```bash
bun install
bun run dev             # local site
bun run typecheck       # tsc --noEmit
bun run lint            # biome
bun run check:registry  # every registry component can publish its files
bun run check           # all three — run before committing
```

Prefer `typecheck` + `lint` for quick verification. Do not start the dev server or run `bun run build` unless explicitly asked.

## Layout

- `components/motion/` — the library. One file per component; multi-file widgets get a folder (`swap/`, `button/`).
- `components/previews/` — demo per component, registered in `components/previews/index.tsx`. Previews ship through the registry too.
- `components/app/` — site chrome (header, hero, dock, code blocks). Not part of the library.
- `lib/registry.ts` — component catalog (slugs, files, examples). `lib/registry-server.ts` builds registry items by following each file's `@/` and relative imports and bundling everything it finds. Internal imports are therefore safe and encouraged; a component that imports `@/lib/ease` ships `lib/ease.ts` with it.
- `app/r/*` — registry endpoints (shadcn items, raw source, index).
- `lib/ease.ts` — all motion tokens.
- `scripts/check-registry.ts` — validates the catalog.

## Motion conventions

- Use tokens from `lib/ease.ts`: `EASE_OUT`, `EASE_OUT_CSS`, `EASE_IN_OUT`, `EASE_DRAWER`, `SPRING_PRESS`, `SPRING_SWAP`, `SPRING_PANEL`, `SPRING_LAYOUT`, `SPRING_MOUSE`. No inline `cubic-bezier` or one-off spring configs; if tuning is genuinely component-specific, keep it a named local const with a comment saying why.
- Gate transform-based motion behind `useReducedMotion()` (from `motion/react`). Reduced motion keeps opacity/color transitions, drops movement. The global CSS media query cannot stop JS springs, so the hook is required.
- Gate decorative hover effects (magnetic pull, tilt) behind `useHoverCapable()` from `lib/hooks/use-hover-capable` — touch devices get sticky phantom hover otherwise.
- Animate `transform` and `opacity` only; never layout properties. Keep blur ≤ 10px. Exits faster than entrances. UI animations under ~300ms; press feedback ~100-160ms.
- Site CTAs use `PressLink` (`components/app/press-link.tsx`), which matches the library Button's `SPRING_PRESS` feel. Don't reach for the CSS `.press` utility on primary CTAs.

## Code conventions

- Named exports only. Every component accepts `className` merged via `cn()` from `lib/utils`. Interactive components are `"use client"`.
- Larger components support controlled + uncontrolled (`value`/`defaultValue`/`onChange`); simple toggles are controlled-only.
- Biome a11y rules are strict: no redundant ARIA roles on divs/spans; use real elements (`<button>`) for interactive things. `DockItem` renders a `<button>` when given `onClick` and a plain div wrapper when children carry their own link/button — never nest interactive elements.
- New component = source file + preview + `lib/registry.ts` entry in the same change. `bun run check:registry` must pass.

## Commits

Conventional lowercase prefixes (`feat:`, `fix:`, `refactor:`, `docs:`), imperative subject. No AI attribution or Co-Authored-By lines.

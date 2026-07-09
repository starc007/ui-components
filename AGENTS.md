# beUI v2 — agent guide

React motion component library plus its docs site, distributed as copy-paste source via shadcn-compatible registry endpoints. Stack: Next.js 15 (App Router), React 19, Tailwind CSS 4, motion (framer-motion) v11, TypeScript strict, Bun, Biome. Live at beui.dev.

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
- `lib/registry.ts` — component catalog (slugs, files, examples). Two categories: `motion` (display name "Components", primitives) and `blocks` (composed widgets: swap, dynamic island, command palette, expandable action bar). Blocks emit `registry:block` shadcn items. Preview files live under `components/previews/<category>/`. `lib/registry-server.ts` builds registry items by following each file's `@/` and relative imports and bundling everything it finds. Internal imports are therefore safe and encouraged; a component that imports `@/lib/ease` ships `lib/ease.ts` with it.
- `app/r/*` — registry endpoints (shadcn items, raw source, index). beUI is listed in shadcn's official registry directory as the `@beui` namespace with URL template `https://beui.dev/r/{name}.json` — that path shape and existing install slugs are public contract; never break or rename them.
- `lib/ease.ts` — all motion tokens.
- `scripts/check-registry.ts` — validates the catalog.

## Component catalog

Before building a new component, check this list. If it exists, import it. If it doesn't, create it following the conventions below.

### Components (`motion` category — primitives)

| slug | file | what it does |
|---|---|---|
| `tilt-card` | `components/motion/tilt-card.tsx` | 3D perspective tilt on hover with cursor-tracked glare |
| `button` | `components/motion/button/` | Spring-pressed `Button` (optional `ripple` prop for a Material-style press ripple), `StatefulButton` (idle/loading/success/error), `MagneticButton` |
| `marquee` | `components/motion/marquee.tsx` | Infinite horizontal or vertical scroll, pause-on-hover |
| `tabs` | `components/motion/tabs.tsx` | Pill, segment or underline tabs with spring layoutId indicator |
| `switch` | `components/motion/switch.tsx` | Toggle with spring-driven thumb and press feedback |
| `select` | `components/motion/select.tsx`, `select-morph.tsx` | Composable select primitives (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`); panel bouncily unfolds out of the trigger and separates (position-aware). `MorphSelect` (`select-morph.tsx`) is a shared-layout variant where the trigger grows into the panel and back |
| `range-slider` | `components/motion/range-slider.tsx` | Range slider (`RangeSlider`) with tick dots and a bouncy vertical-bar thumb that glides between snapped steps; drag + keyboard, controlled/uncontrolled |
| `wheel-picker` | `components/motion/wheel-picker.tsx` | iOS-style picker wheel (`WheelPicker`): a 3D drum on custom momentum physics (velocity-projected coast, spring-back settle) with a crisp clipped center band; drag, wheel and keyboard, composes side by side for date/time pickers, controlled/uncontrolled, reduced-motion safe |
| `bottom-sheet` | `components/motion/bottom-sheet.tsx` | Draggable bottom sheet with snap points, inertia and glass surface |
| `shared-layout-bg` | `components/motion/shared-layout-bg.tsx` | Pill that glides between hovered items via shared layout |
| `dock` | `components/motion/dock.tsx` | macOS-style dock with grouped actions and gliding active pill |
| `tooltip` | `components/motion/tooltip.tsx` | Hover/focus tooltip with blur enter/exit and spring spawn |
| `popover` | `components/motion/popover.tsx` | Composable gooey popover (`Popover`, `PopoverTrigger`, `PopoverContent`); panel oozes out of the trigger via an SVG goo filter (liquid neck that stretches/pinches) with crisp content fading in on top. Inline-anchored, click or hover trigger, controlled/uncontrolled |
| `morphing-modal` | `components/motion/morphing-modal.tsx` | Panel that morphs height across inner views with blur cross-fade |
| `text-reveal` | `components/motion/text-reveal.tsx` | Word or character reveal with spring slide-up and blur |
| `text-shimmer` | `components/motion/text-shimmer.tsx` | Gradient sweep across text for loading or emphasis |
| `text-cascade` | `components/motion/text-cascade.tsx` | Letter-by-letter slot roll for standalone text |
| `number-ticker` | `components/motion/number-ticker.tsx` | Slot-machine rolling digits with staggered entry |
| `animated-number` | `components/motion/animated-number.tsx` | Spring-driven count-up triggered when in view |
| `animated-badge` | `components/motion/animated-badge.tsx` | Status badge with animated state icons and pulse feedback |
| `action-swap` | `components/motion/action-swap.tsx` | Core swap primitives: `ActionSwapButton`, `ActionSwapText`, `ActionSwapIcon` with blur/roll/cascade variants |
| `action-swap-blur` | `components/motion/action-swap-blur.tsx` | Blur + scale + opacity swap variants |
| `action-swap-roll` | `components/motion/action-swap-roll.tsx` | Vertical roll-in swap variants |
| `action-swap-cascade` | `components/motion/action-swap-cascade.tsx` | Letter-cascade swap variants — `ActionSwapCascadeButton`, `ActionSwapCascadeText`, `ActionSwapCascadeIcon` |
| `animated-toast-stack` | `components/motion/animated-toast-stack.tsx` | Stacked toasts with status morphs, swipe dismissal and layout-aware motion |
| `theme-toggle` | `components/motion/theme-toggle.tsx` | Theme toggle with full-page clip-path reveal via View Transition API |
| `bouncy-accordion` | `components/motion/bouncy-accordion.tsx` | Single-open accordion with weighted spring layout and icon rows |
| `magnetic` | `components/motion/magnetic.tsx` | Cursor-attracted magnetic pull wrapper |
| `scroll-animation` | `components/motion/smooth-scroll.tsx`, `scroll-progress.tsx`, `parallax.tsx`, `scroll-to.tsx`, `scroll-reveal.tsx` | Scroll-driven motion group (variants install as `@beui/smooth-scroll`, `@beui/scroll-progress`, `@beui/parallax`, `@beui/scroll-to`, `@beui/scroll-reveal`). **Smooth Scroll**: Lenis provider (`root` page / `root={false}` contained) + `useSmoothScroll` hook (offset/progress/velocity, `scrollTo`), reduced-motion native. **Scroll Progress**: bar or ring reading `useSmoothScroll().progress`. **Parallax**: drifts children at a speed factor across the viewport, either axis. **Scroll To**: button that smooth-scrolls to a target via the provider. **Scroll Reveal**: spring slide + blur reveal on viewport enter |

### Blocks (`blocks` category — composed product widgets)

| slug | file | what it does |
|---|---|---|
| `swap` | `components/motion/swap.tsx` + `swap/` | Cross-chain swap widget with chain/token selectors and morphing views |
| `dynamic-island` | `components/motion/dynamic-island.tsx` | iOS-style island pill that morphs between live activity views |
| `command-palette` | `components/motion/command-palette.tsx` | ⌘K palette with fuzzy filter and spring-animated active row |
| `expandable-action-bar` | `components/motion/expandable-action-bar.tsx` | Icon actions that expand into labeled controls on hover/focus |
| `overflow-actions` | `components/motion/overflow-actions.tsx` | Connected pill rail that springs open to reveal extra controls |
| `expandable-tabs` | `components/motion/expandable-tabs.tsx` | Icon tab bar where active tab expands to labeled pill with height-morphing panel |
| `swipeable-list` | `components/motion/swipeable-list.tsx` | List rows that swipe left/right to reveal contextual action buttons |
| `file-upload` | `components/motion/file-upload.tsx` | Drag-and-drop upload queue with progress rows and retry/remove actions |
| `prediction-market` | `components/motion/prediction-market.tsx` | Trade ticket with buy/sell modes, outcome prices and rolling amount entry |
| `otp-input` | `components/motion/otp-input.tsx` | One-time-code input with gliding focus ring, roll-in digits, error shake and success draw |
| `bloom-menu` | `components/motion/bloom-menu.tsx` | Button that morphs open into a menu and blooms iris-out from center via shared layout + clip-path, with radially staggered items |

### Site chrome (`components/app/` — not part of the library)

| file | what it does |
|---|---|
| `components/app/copy-button.tsx` | Copy-to-clipboard button using `ActionSwapCascadeIcon` for the copy/check swap |
| `components/app/code-block.tsx` | Syntax-highlighted code block with `CopyButton`, diff/focus transformers and collapsible expand |
| `components/app/press-link.tsx` | `PressLink` — site CTA link with `SPRING_PRESS` feel, use instead of CSS `.press` on primary CTAs |

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

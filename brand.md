# beUI brand

The motion toolkit for React and Next.js. This file is the design system for the site and every library component: type, radius, size, color, surfaces, motion and voice. `AGENTS.md` stays authoritative for code, motion implementation, accessibility and registry rules. `src/styles/globals.css` holds the executable tokens.

A live version of this file renders at `/brand` in `bun run dev`.

## Character

Precise, quiet, tactile. The components carry the personality; the chrome stays neutral. One shape language everywhere: **every control is a pill**.

## Typography

| Family | Role | Token |
|---|---|---|
| Plus Jakarta Sans | Headings (`h1` to `h3`, `font-display`) | `--font-head` |
| Inter | Body and UI | `--font-ui` |
| JetBrains Mono | Code, commands, changing numbers | `--font-code` |

Loaded from `@fontsource-variable/*`, exposed as `font-display`, `font-sans` and `font-mono`. Social cards and blog banners use the same families from static files in `public/og/fonts`.

### Scale

Only these sizes. No other arbitrary `text-[Npx]` values.

| Role | Class | Size / line | Weight |
|---|---|---|---|
| Display | `text-5xl tracking-tight` | 48 / 48 | 600 |
| Page title | `text-3xl tracking-tight` | 30 / 36 | 500 |
| Section title | `text-xl tracking-tight` | 20 / 28 | 500 |
| Subsection | `text-base` | 16 / 24 | 500 |
| Body and UI (default) | `text-sm` | 14 / 20 | 400 |
| Caption, small controls | `text-xs` | 12 / 16 | 400 or 500 |
| Micro (axis ticks, badges, counters) | `text-[11px]` | 11 / 16 | 500 |
| Code | `font-mono text-[13px]` in code blocks, `text-xs` inline | 13 / 20 | 400 |

- Weights: 400 body, 500 labels, buttons, headings and page titles, 600 display only. Nothing above 600.
- Display means `text-3xl` and up used as a readout or showcase (balances, prices, big counters, hero text), plus logo-letter marks and numbers on physical game cards. A page title at `text-3xl` is still 500.
- Headings use `tracking-tight`. Body text keeps normal tracking.
- Changing numbers use `tabular-nums`.
- Retire `text-[9px]`, `text-[10px]`, `text-[12px]` (use `text-xs`), `text-[13px]` outside code, and `text-[15px]`.

## Radius

**Controls are fully rounded. Containers are rounded and concentric.**

| Element | Radius |
|---|---|
| Buttons, icon buttons, inputs, select and combobox triggers, search, tabs, segmented controls, chips, badges, switches, pagination, toasts, single-line tooltips, OTP cells | `rounded-full` |
| Rows inside menus, listboxes, selects and command palettes | `rounded-full` |
| Floating panels (menu, select list, popover, combobox list) | `rounded-3xl` with `p-2` |
| Cards, previews, code blocks, rich tooltips | `rounded-2xl` |
| Dialogs, sheets, drawers, large containers | `rounded-3xl` |

### Concentric rule

Inner radius = outer radius − gap. A floating panel is `rounded-3xl` (24px) with `p-2` (8px) around `h-8` rows, whose pill radius is 16px: 24 − 8 = 16, so the corners line up. When you change a panel's padding, change its radius with it.

### Exceptions

- **Checkbox** stays a rounded square (`rounded-md`). A round checkbox reads as a radio.
- **Multi-line inputs** (textarea, prompt input) use `rounded-3xl`, since a pill can't hold several lines.
- **Data marks** in charts (bars, cells, swatches in a legend) keep their small radii (2 to 4px).
- **Rows whose text can wrap** (citations, approval options, prompt actions) use `rounded-2xl`, which stays concentric inside a `rounded-3xl p-2` panel. Rows with a fixed title and one truncated subtitle line (search results, combobox options with an avatar) stay `rounded-full`.
- **Range slider tracks** keep `rounded-lg`: the fill offset and handle stretch are tuned to 8px ends.
- **Physical objects** (playing cards, books, folders, device and terminal frames, game boards and tiles) keep their own shapes.
- **Inline `code` and `kbd` keycaps** keep a small radius.

## Size

Control heights on a 4px grid. Every control in a row shares one height.

| Size | Height | Padding | Text | Icon |
|---|---|---|---|---|
| sm | `h-8` (32) | `px-3` | `text-xs` | `size-3.5` |
| md (default) | `h-10` (40) | `px-5` (button), `px-4` (field) | `text-sm` | `size-4` |
| lg | `h-12` (48) | `px-6` | `text-base` | `size-4` |
| Icon button | `size-8`, `size-10`, `size-12` | none | | `size-4` |

- Menu and list rows: `h-8 px-3 text-sm`.
- Spacing uses the 4px grid: `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`.
- Density is compact: `text-sm` by default, tight rows, little description text.

## Color

Near-monochrome neutrals, one blue for emphasis, semantic status colors. Source of truth: `src/styles/globals.css`. Use semantic utilities (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`), never raw values.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `oklch(99% 0 0)` | `#151515` | Page |
| `card` | `oklch(97% 0 0)` | `#1c1c1c` | Raised surfaces, hover fills |
| `foreground` | `oklch(15% 0 0)` | `oklch(96% 0 0)` | Text |
| `muted-foreground` | `oklch(50% 0 0)` | `oklch(62% 0 0)` | Secondary text |
| `border` | `oklch(15% 0 0 / 0.06)` | `rgb(255 255 255 / 0.05)` | Hairlines |
| `border-strong` | `oklch(15% 0 0 / 0.12)` | `rgb(255 255 255 / 0.1)` | Inputs, focus |
| `primary` | `#0285f7` | `#0285f7` | Filled emphasis: primary buttons, selected tab, checked controls |
| `accent` | `oklch(72% 0.18 195)` | `oklch(80% 0.18 195)` | Small highlights only |
| `success`, `warning`, `danger` | | | Status only |

- Filled emphasis is `primary` blue, never a black `bg-foreground` fill: primary buttons, selected chips and dates, active pagination, filled slider tracks, progress, the solid message bubble, chart value labels.
- Thin markers stay `foreground`: menu radio dots, text carets, slider handle lines. Neutral chips (avatar overflow, icon tiles, workspace marks) use `bg-muted text-foreground`. Things that depict a device (the dynamic island) keep their own color.
- No purple, violet, indigo or fuchsia, in tokens, chart palettes or previews. `--gradient-accent` runs from the cyan accent to primary blue.

## Surfaces and elevation

- Cards: `rounded-2xl border border-border`, no shadow, no gray fill, no extra outer border.
- Floating panels: `rounded-3xl border border-border bg-background p-2` plus one soft shadow, `shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)]`. This is the only shadow in the system.
- Focus: a visible `ring-2` in `ring-foreground/20` or the primary color. Never remove focus without a replacement.

## Icons

- Lucide or Hugeicons, never the Sparkles icon.
- `size-4` in md controls, `size-3.5` in sm controls.
- Icon-only buttons are `rounded-full` and get a tooltip.
- Icon chips use a neutral background, not a colored one.

## Motion

Tokens live in `lib/ease.ts`. No inline curves or one-off springs.

| Token | Use | Feel |
|---|---|---|
| `EASE_OUT` | Most entrances and transitions | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `EASE_IN` | Falls and exits only | fast out |
| `SPRING_PRESS` | Press feedback | about 120ms |
| `SPRING_SWAP` | Label and icon swaps in a control | quick, no overshoot |
| `SPRING_PANEL` | Modals and sheets | settled |
| `SPRING_LAYOUT` | Sliding pills and indicators | smooth glide |

- UI motion stays under about 300ms; press feedback 100 to 160ms; exits faster than entrances and mirror them.
- Animate `transform` and `opacity` only. Blur at most 10px.
- Reduced motion keeps opacity and color, drops movement.

## Voice

Sparse, precise, active. Name the component, say what it does, show the install command. Short words, no hype, no em dashes, no emoji in UI.

Avoid: revolutionary, powerful, seamless, simply, just, unlock, supercharge, and exclamation marks.

> A spring-pressed button with loading, success, and error states. Copy the source or install it from the registry.

## Off-system today

The radius and type pass (2026-11-23) moved every control, menu row and floating panel in `components/motion` and `components/agents` onto this system, and every chart and component onto the type scale. What is left:

| Area | Now | Target |
|---|---|---|
| Returns calendar cell numbers | `text-[9px]` | Cells are about 17px wide on mobile, so 11px overflows. Needs a layout decision. |
| Swap chain sub-badge letter | `text-[7px]` | Larger badge, or drop the letter |

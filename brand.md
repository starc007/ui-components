# beUI brand

The motion toolkit for React and Next.js. This file is the design system for the site and every library component: type, radius, size, color, surfaces, motion and voice. `AGENTS.md` stays authoritative for code, motion implementation, accessibility and registry rules. `src/styles/globals.css` holds the executable tokens.

A live version of this file is public at [beui.dev/brand](https://beui.dev/brand) (`src/routes/-pages/brand-page.tsx`); keep the two in sync.

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
| Rows inside menus, listboxes, selects, multi-selects, comboboxes and command palettes | `rounded-lg` (8px, concentric inside a `rounded-2xl p-2` panel) |
| Floating panels (dropdown and context menus, select, combobox and multi-select lists, table menus, popovers) | `rounded-2xl` with `p-2` |
| Cards, previews, code blocks, rich tooltips | `rounded-2xl` |
| Dialogs (modals, command palette, search overlay) | `rounded-2xl` |
| Sheets, drawers, floating and inset sidebars | `rounded-2xl` on the corners facing the page; an edge against the viewport stays square |
| Large containers | `rounded-3xl` |

### Concentric rule

Inner radius = outer radius − gap. The docs preview frame is `rounded-3xl` (24px) with `p-2` (8px) around `rounded-2xl` panels: 24 − 8 = 16, so the corners line up. When you change a container's padding, change its radius with it.

Floating panels, dialogs, sheets and drawers use `rounded-2xl` (16px) for a tighter look. Their `p-2` leaves 8px, so their rows are `rounded-lg`: 16 − 8 = 8.

### Exceptions

- **Checkbox** stays a rounded square (`rounded-md`). A round checkbox reads as a radio.
- **Multi-line inputs** (textarea, prompt input) use `rounded-3xl`, since a pill can't hold several lines.
- **Data marks** in charts (bars, cells, swatches in a legend) keep their small radii (2 to 4px).
- **Rows whose text can wrap** (citations, approval options) use `rounded-2xl`, which stays concentric inside a `rounded-3xl p-2` container. Inside a floating panel (`rounded-2xl p-2`) every row, wrapping or not, uses `rounded-lg`.
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

- Menu and list rows: `h-8 px-3 text-sm rounded-lg`.
- Spacing uses the 4px grid: `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`.
- Density is compact: `text-sm` by default, tight rows, little description text.

## Color

Monochrome: neutrals, a near-black primary (white in dark mode) for emphasis, semantic status colors. Source of truth: `src/styles/globals.css`. Use semantic utilities (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`), never raw values.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `oklch(99% 0 0)` | `#151515` | Page |
| `card` | `oklch(97% 0 0)` | `#1c1c1c` | Raised surfaces, hover fills |
| `foreground` | `oklch(15% 0 0)` | `oklch(96% 0 0)` | Text |
| `muted-foreground` | `oklch(50% 0 0)` | `oklch(62% 0 0)` | Secondary text |
| `border` | `oklch(15% 0 0 / 0.06)` | `rgb(255 255 255 / 0.05)` | Hairlines |
| `border-strong` | `oklch(15% 0 0 / 0.12)` | `rgb(255 255 255 / 0.1)` | Inputs, focus |
| `primary` | `#171717` | `#f5f5f5` | Filled emphasis: primary buttons, selected tab, checked controls, emphasis text |
| `primary-foreground` | `#fafafa` | `#151515` | Text and icons on a primary fill |
| `accent` | `oklch(72% 0.18 195)` | `oklch(80% 0.18 195)` | Small highlights only |
| `success`, `warning`, `danger` | | | Status only |

- Filled emphasis goes through the `primary` token, never a raw `bg-foreground` or `bg-black`, so a theme can recolour it in one place: primary buttons, selected chips and dates, active pagination, filled slider tracks, progress, the solid message bubble, chart value labels.
- Thin markers stay `foreground`: menu radio dots, text carets, slider handle lines. Neutral chips (avatar overflow, icon tiles, workspace marks) use `bg-muted text-foreground`. Things that depict a device (the dynamic island) keep their own color.
- No purple, violet, indigo or fuchsia, in tokens, chart palettes or previews.
- Where a tier or series needs a hue, use a real colour, not primary: casino heat goes neutral, green, amber, rose. Charts keep their own data palettes.

## Surfaces and elevation

- Cards: `rounded-2xl border border-border`, no shadow, no gray fill, no extra outer border.
- Floating panels (menus, context menus, selects, popovers, tooltips, drawers): `bg-background` with one soft shadow, `shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)]`. This is the only shadow in the system. Menus add `rounded-2xl border border-border p-2`.
- Focus: a visible `ring-2` in `ring-foreground/20` or the primary color. Never remove focus without a replacement.

## Icons

- Lucide or Hugeicons, never the Sparkles icon.
- `size-4` in md controls, `size-3.5` in sm controls.
- Icon-only buttons are `rounded-full` and get a tooltip.
- Icon chips use a neutral background, not a colored one.
- Selection marks (the check on a selected menu, select or radio row) sit at the end of the row, never before the label. Labels stay flush with the other rows.

## Motion

Tokens live in `lib/ease.ts`. No inline curves or one-off springs.

| Token | Use | Feel |
|---|---|---|
| `EASE_OUT` | Most entrances and transitions | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `EASE_IN` | Things that fall; never UI entrances | accelerating |
| `EASE_IN_OUT` | Moves between two resting places | slow, fast, slow |
| `EASE_DRAWER` | Drawers and sheets sliding in and out | the iOS sheet curve |
| `SPRING_PRESS` | Press feedback | about 120ms |
| `SPRING_SWAP` | Label and icon swaps in a control | quick, no overshoot |
| `SPRING_PANEL` | Modals and sheets | settled |
| `SPRING_LAYOUT` | Sliding pills and indicators | smooth glide |
| `SPRING_MORPH` | A trigger growing into its panel and back | weighted, slight bounce |
| `SPRING_MOUSE` | Cursor-follow effects (magnetic, tilt, dock) | loose |
| `SPRING_GLIDE` | Dragged slider handles and fills | critically damped |

- UI motion stays under about 300ms; press feedback 100 to 160ms; exits faster than entrances and mirror them.
- Animate `transform` and `opacity` only. Blur at most 10px.
- Reduced motion keeps opacity and color, drops movement.

## Voice

Sparse, precise, active. Name the component, say what it does, show the install command. Short words, no hype, no em dashes, no emoji in UI.

Avoid: revolutionary, powerful, seamless, simply, just, unlock, supercharge, and exclamation marks.

> A spring-pressed button with loading, success, and error states. Copy the source or install it from the registry.

## Contrast

Primary passes WCAG AAA in both themes, as a fill and as text: `#171717` with `#fafafa` in light mode, `#f5f5f5` with `#151515` in dark mode (both above 15:1). Always pair `bg-primary` with `text-primary-foreground`, never `text-white`: the fill flips to white in dark mode.

## Off-system today

Nothing. The 2026-11-23 passes moved every control, row and panel onto the radius system, every size onto the type scale, weights onto 400/500/600, emphasis fills onto primary, and removed violet. On 2026-11-25 rows inside floating panels moved from pills to `rounded-lg`, and the context menu, tooltips and drawers moved onto the one panel shadow. Two calls made along the way:

- **Returns calendar** cells show their number at 11px only when the grid is 26.5rem or wider (cells of about 24px). Narrower grids keep the colour; the value stays in the tooltip and the cell's label.
- **Swap token badge**: the chain sub-badge is a colour dot with no letter (it had to be 7px to fit). The token picker names the chain in each row instead ("USDC · Base").

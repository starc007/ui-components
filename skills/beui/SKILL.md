---
name: beui
description: >-
  Picks and installs beUI (@beui) animated React components from the shadcn
  registry. Use when building motion UI, agent or chat interfaces, toasts,
  docks, bottom sheets, drawers, popovers, sliders, loaders, 404 pages, or any
  beui.dev / @beui component. Maps user intent to the exact install slug
  (including variants like popover-morph, range-slider-wave, thinking-shimmer)
  instead of inventing custom motion widgets.
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *), Bash(curl *)
---

# beUI

Animated React components as copy-paste source via the `@beui` shadcn registry.

This skill is for **using** beUI in the user's app. Do not invent a parallel widget when a slug exists.

## Live catalog

The JSON below is fetched from beUI when this skill loads. `items[].name` is the install slug. **Always pick from this list** (or refresh it). Do not use a memorized catalog — new components show up here when they ship.

```json
!`curl -fsS https://beui.dev/r/registry.json`
```

If that block is empty, fetch `https://beui.dev/r/registry.json` yourself or run `npx shadcn@latest search @beui -q "<need>"`. Do not scrape beui.dev HTML.

## Hard rules

1. **Look up, then install, then compose.** Never freehand a toast, sheet, dock, chat bubble, thinking indicator, or slider.
2. **Install the variant slug**, not the family page. `popover` ≠ `popover-morph`. `range-slider` ≠ `range-slider-wave`.
3. **Read the added files** before writing JSX. Exports are named (`BottomSheet`, `StatefulButton`, `ThinkingShimmer`). There is no default export barrel.

## Workflow

Use the project's package runner (`npx`, `pnpm dlx`, or `bunx --bun`).

```bash
# 1. Confirm against the live catalog (injected above, or)
npx shadcn@latest search @beui -q "toast"

# 2. Inspect source and files before installing
npx shadcn@latest view @beui/animated-toast-stack

# 3. Install into the project
npx shadcn@latest add @beui/animated-toast-stack

# Direct URL also works
npx shadcn@latest add https://beui.dev/r/animated-toast-stack.json
```

If a beUI MCP server is connected (`https://mcp.beui.dev/mcp`), use `search_components` → `get_component` → `get_install_command` instead of guessing.

After `add`: read the written files, use those exports and props, and compose. Do not restyle internals; pass `className` for layout.

## Pick the component

Match the user's ask to **one install slug**. If two could fit, prefer the more specific row.

| User wants | Install `@beui/…` | Do not use |
| --- | --- | --- |
| Toast / snackbar | `animated-toast-stack` | `notification-stack` |
| Notification inbox that expands | `notification-stack` | `animated-toast-stack` |
| Bottom sheet / Vaul / mobile drawer | `bottom-sheet` | `drawer`, `center-morph-modal` |
| Side panel | `drawer` | `bottom-sheet` |
| App chrome sidebar | `animated-sidebar` | `bounce-sidebar`, `ai-sidebar` |
| Nav with a bouncing active dot | `bounce-sidebar` | `animated-sidebar` |
| AI files / folders / bookmarks | `ai-sidebar` | `animated-sidebar` |
| Modal that unfolds from center | `center-morph-modal` | `morphing-modal` |
| Panel that morphs height across inner views | `morphing-modal` | `center-morph-modal` |
| Liquid / gooey popover | `popover` | `popover-morph` |
| Clip-morph popover from a corner | `popover-morph` | `popover` |
| Dropdown select | `select` | `select-morph`, `combobox` |
| Select that grows into the panel | `select-morph` | `select` |
| Searchable select | `combobox` | `select` |
| ⌘K command palette | `command-palette` | `combobox` |
| Right-click / long-press menu | `context-menu` | `bloom-menu` |
| Button that blooms into a menu | `bloom-menu` | `context-menu` |
| Press button | `button-base` | custom `motion.button` |
| Submit with loading → success / error | `button-stateful` | `button-base` + spinner |
| Magnetic cursor pull on a button | `button-magnetic` | hand-rolled mouse tracking |
| Hold to confirm | `hold-action-button` | `button-base` |
| Slide to confirm | `slide-action-button` | `swipeable-list` |
| Hover CTA with expanding arrow | `expanding-arrow-button` | `button-base` |
| Spinner / dots / bars loader | `loader` | `thinking-shimmer`, `text-shimmer` |
| “Thinking…” status text | `thinking-shimmer` | `loader`, `text-shimmer` |
| Cycling reasoning phrases | `reasoning-text` | `text-cascade` |
| Timed agent progress glyph | `agent-progress` | `loader` |
| Shimmer on headline text | `text-shimmer` | `thinking-shimmer` |
| Word / letter reveal | `text-reveal` | `text-cascade` |
| Chromatic sweep on a cycling word | `chromatic-text-reveal` | `text-shimmer` |
| Slot-machine letters | `text-cascade` | `text-scramble` |
| Character scramble resolve | `text-scramble` | `text-cascade` |
| Rolling digits | `number-ticker` | `animated-number` |
| Count-up when in view | `animated-number` | `number-ticker` |
| Tick-dot slider | `range-slider` | other `range-slider-*` |
| Liquid fill slider (no thumb) | `range-slider-fluid` | `range-slider` |
| Equalizer / wave slider | `range-slider-wave` | `range-slider` |
| Value bubble that tilts while dragging | `range-slider-bubble` | `range-slider` |
| Ruler that scrolls under a needle | `range-slider-ruler` | `range-slider` |
| iOS wheel / date-time drum | `wheel-picker` | `select` |
| macOS dock | `dock` | `expandable-action-bar` |
| Icon actions that grow labels | `expandable-action-bar` | `dock` |
| Pill rail that springs extra actions | `overflow-actions` | `expandable-action-bar` |
| Icon tabs; active one becomes a labeled pill | `expandable-tabs` | `tabs` |
| Tabs that morph into a content room | `morphing-tabs` | `tabs`, `expandable-tabs` |
| Simple pill / underline tabs | `tabs` | `expandable-tabs` |
| Hover pill gliding between items | `shared-layout-bg` | `tabs` |
| Codex-style preview ticks | `preview-rail` | `bounce-sidebar` |
| iOS Dynamic Island | `dynamic-island` | `notification-stack` |
| Swipe row to reveal actions | `swipeable-list` | `slide-action-button` |
| Pull to refresh | `pull-to-refresh` | custom touch math |
| Dropzone / upload queue | `file-upload` | `attachment-upload` |
| Mixed attachments (files, audio, images) | `attachment-upload` | `file-upload` |
| OTP / PIN boxes | `otp-input` | `input` |
| Sign-up form | `signup-form` | composing `input` + `button-stateful` from scratch |
| Dark / light theme wipe | `theme-toggle` | toggling a class only |
| Shader / mesh / grain background | `shader-background` | custom canvas |
| 3D cylinder carousel | `cylinder-carousel` | `marquee` |
| Infinite logo / text strip | `marquee` | `cylinder-carousel` |
| Virtualized table | `table` | HTML `<table>` |
| Editable cells | `table-editable` | `table` |
| Async / loading rows | `table-async` | `table` |
| Tournament bracket | `knockout-bracket` | `knockout-wheel` |
| Radial tournament wheel | `knockout-wheel` | `knockout-bracket` |
| 404 page | `not-found-glitch` (or `not-found-magnetic`, `not-found-spotlight`, `not-found-stacked`, `not-found-terminal`) | custom 404 |
| Token / chain swap | `swap` | |
| Weekly availability editor | `availability-scheduler` | |
| Wallet overview card | `wallet-card` | |
| Prediction market ticket | `prediction-market` | |
| Feedback popup | `feedback-widget` | `animated-toast-stack` |
| Infinite masonry grid | `infinite-masonry` | CSS columns |
| Accordion | `bouncy-accordion` | |
| 3D tilt card | `tilt-card` | |
| Tooltip | `tooltip` | `popover` |
| Switch / checkbox / radio / input | `switch`, `checkbox`, `radio`, `input` | native controls with custom motion |

The table is only for lookalikes. Anything else — a new component, an unfamiliar name — comes from the live catalog above.

## Agent / chat UI

Do not hand-roll bubbles, stick-to-bottom scroll, or thinking indicators.

| User wants | Install `@beui/…` |
| --- | --- |
| Whole agent workspace | `chat-app` (compose from it; do not rebuild the shell) |
| Conversation thread + follow-the-stream | `message-scroller` + `message` |
| Just a bubble surface | `message-bubble` |
| Composer / prompt box | `prompt-input` |
| Streamed answer + copy / retry | `streaming-response` |
| Reasoning / search / tool trace | `agent-activity` |
| Agent task plan | `todo-list` |
| Syntax-highlighted code | `code-block` |
| File diff | `file-diff` |
| Terminal / HTTP tool output | `tool-result` |
| “Allow this tool?” | `tool-approval` |
| HITL questions / approvals | `approval-card` |
| Inline citations | `citations` |
| Generated image canvas | `image-generation` |

A typical chat screen: `chat-app` or `ai-sidebar` + `message-scroller` + `message` + `prompt-input`, then add `agent-activity`, `thinking-shimmer`, `streaming-response`, `code-block`, `tool-result` as the product needs them.

## After install

- Components are `"use client"` source in the project. Import from the installed path, not from `beui` npm (there isn't a runtime package).
- Helpers such as `@/lib/ease` and `@/lib/utils` arrive in the registry `files` array — do not skip them.
- Gate new motion with `useReducedMotion()` from `motion/react`. Decorative hover (tilt, magnetic) also needs `useHoverCapable()`.
- Animate `transform` and `opacity` only. Prefer tokens from the shipped `lib/ease.ts` (`SPRING_PRESS`, `SPRING_PANEL`, `EASE_OUT`).

## If this repo is beUI itself

You are contributing to the library. Follow `AGENTS.md`: new component = source + preview + `lib/registry.ts` in the same change. Do not rename `/r/{name}.json` slugs.

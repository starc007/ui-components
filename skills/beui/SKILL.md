---
name: beui
description: Pick and install beUI (@beui) animated React components from the shadcn registry. Use when building motion UI, agent/chat interfaces, toasts, docks, bottom sheets, drawers, popovers, sliders, loaders, 404 pages, or any beui.dev component. Maps user intent to exact @beui install slugs instead of inventing custom widgets.
---

# beUI

Use beUI as copy-paste source through the `@beui` shadcn registry.

## Workflow

1. Fetch the live registry before choosing a component:

```bash
curl -fsS https://beui.dev/r/registry.json
```

2. Pick the closest install slug from `items[].name`.
3. Inspect before installing:

```bash
npx shadcn@latest view @beui/<slug>
```

4. Install with the user's package runner:

```bash
npx shadcn@latest add @beui/<slug>
# or
pnpm dlx shadcn@latest add @beui/<slug>
# or
bunx --bun shadcn@latest add @beui/<slug>
```

5. Read the files that were added, then compose with the named exports. There is no `beui` runtime package.

The live registry is the source of truth. Use the table below only to resolve common lookalikes.

## Picker

| User asks for | Install `@beui/...` | Avoid |
| --- | --- | --- |
| Toast or snackbar | `animated-toast-stack` | `notification-stack` |
| Expanding notification inbox | `notification-stack` | `animated-toast-stack` |
| Mobile bottom sheet, Vaul-style panel | `bottom-sheet` | `drawer` |
| Side panel or app drawer | `drawer` | `bottom-sheet` |
| App chrome sidebar | `animated-sidebar` | `bounce-sidebar`, `ai-sidebar` |
| AI files, folders, bookmarks | `ai-sidebar` | `animated-sidebar` |
| Whole agent workspace | `chat-app` | hand-rolled chat shell |
| Streaming thread that follows tokens | `message-scroller`, `message` | custom scroll math |
| Just a chat bubble | `message-bubble` | custom bubble |
| Prompt box or composer | `prompt-input` | textarea plus custom buttons |
| Agent reasoning, search, tool trace | `agent-activity` | plain log list |
| Task plan | `todo-list` | custom checklist |
| Code surface | `code-block` | pre/code from scratch |
| File diff | `file-diff` | custom diff renderer |
| Tool output | `tool-result` | raw terminal block |
| Tool permission card | `tool-approval` | alert dialog |
| Approval or HITL question | `approval-card` | custom form |
| Inline citations | `citations` | plain numbered links |
| Generated image canvas | `image-generation` | image card from scratch |
| Liquid popover | `popover` | `popover-morph` |
| Corner morph popover | `popover-morph` | `popover` |
| Dropdown select | `select` | `select-morph`, `combobox` |
| Select that grows into panel | `select-morph` | `select` |
| Searchable select | `combobox` | `select` |
| Cmd+K palette | `command-palette` | `combobox` |
| Right-click or long-press menu | `context-menu` | `bloom-menu` |
| Button that blooms into a menu | `bloom-menu` | `context-menu` |
| Press button | `button-base` | custom `motion.button` |
| Loading/success/error button | `button-stateful` | spinner button |
| Magnetic button | `button-magnetic` | custom pointer tracking |
| Hold to confirm | `hold-action-button` | `button-base` |
| Slide to confirm | `slide-action-button` | `swipeable-list` |
| Hover CTA with expanding arrow | `expanding-arrow-button` | `button-base` |
| Spinner, dots, bars loader | `loader` | `thinking-shimmer` |
| Agent thinking status | `thinking-shimmer` | `loader`, `text-shimmer` |
| Cycling reasoning phrases | `reasoning-text` | `text-cascade` |
| Timed agent progress glyph | `agent-progress` | `loader` |
| Shimmer headline text | `text-shimmer` | `thinking-shimmer` |
| Word or letter reveal | `text-reveal` | `text-cascade` |
| Chromatic cycling word | `chromatic-text-reveal` | `text-shimmer` |
| Slot-machine letters | `text-cascade` | `text-scramble` |
| Scramble resolving text | `text-scramble` | `text-cascade` |
| Rolling digits | `number-ticker` | `animated-number` |
| Count-up on view | `animated-number` | `number-ticker` |
| Tick-dot slider | `range-slider` | other `range-slider-*` |
| Liquid fill slider | `range-slider-fluid` | `range-slider` |
| Equalizer slider | `range-slider-wave` | `range-slider` |
| Tilting value bubble slider | `range-slider-bubble` | `range-slider` |
| Ruler slider | `range-slider-ruler` | `range-slider` |
| iOS wheel picker | `wheel-picker` | `select` |
| macOS dock | `dock` | `expandable-action-bar` |
| Icon actions with labels | `expandable-action-bar` | `dock` |
| Overflow action rail | `overflow-actions` | `expandable-action-bar` |
| Icon tabs with active label | `expandable-tabs` | `tabs` |
| Morphing tab content room | `morphing-tabs` | `tabs` |
| Pill or underline tabs | `tabs` | `expandable-tabs` |
| Hover gliding background | `shared-layout-bg` | `tabs` |
| Preview ticks or rail | `preview-rail` | `bounce-sidebar` |
| Dynamic Island | `dynamic-island` | `notification-stack` |
| Swipe row actions | `swipeable-list` | `slide-action-button` |
| Pull to refresh | `pull-to-refresh` | custom touch math |
| Basic upload queue | `file-upload` | `attachment-upload` |
| Mixed file, audio, image attachments | `attachment-upload` | `file-upload` |
| OTP or PIN boxes | `otp-input` | `input` |
| Sign-up form | `signup-form` | manual form assembly |
| Theme wipe | `theme-toggle` | class toggle only |
| Shader background | `shader-background` | custom canvas |
| Cylinder carousel | `cylinder-carousel` | `marquee` |
| Logo or text marquee | `marquee` | `cylinder-carousel` |
| Data table | `table` | HTML table from scratch |
| Editable table | `table-editable` | `table` |
| Async table | `table-async` | `table` |
| Tournament bracket | `knockout-bracket` | `knockout-wheel` |
| Radial tournament wheel | `knockout-wheel` | `knockout-bracket` |
| 404 page | `not-found-glitch` | custom 404 |
| Project folder card | `project-folder` | folder card from scratch |
| Token or chain swap | `swap` | custom swap form |
| Weekly availability editor | `availability-scheduler` | custom calendar grid |
| Wallet overview card | `wallet-card` | custom wallet card |
| Prediction market ticket | `prediction-market` | custom trade ticket |
| Feedback popup | `feedback-widget` | `animated-toast-stack` |
| Infinite masonry grid | `infinite-masonry` | CSS columns |
| Accordion | `bouncy-accordion` | custom accordion |
| 3D tilt card | `tilt-card` | custom glare math |
| Tooltip | `tooltip` | `popover` |
| Switch, checkbox, radio, input | `switch`, `checkbox`, `radio`, `input` | restyled native controls |

## Composition rules

- Prefer installed beUI source over custom one-off motion widgets.
- Import named exports from the files shadcn adds.
- Use `className` for layout and small styling changes. Do not fork internals unless the user asks.
- Keep helpers installed by the registry, such as `@/lib/ease`, `@/lib/utils`, and hooks.
- If adding new motion around beUI components, use `useReducedMotion()` from `motion/react`.
- Gate decorative hover effects like magnetic pull and tilt behind `useHoverCapable()`.
- Animate `transform` and `opacity`; avoid layout-property animation.

## In this repo

When contributing to beUI itself, follow `AGENTS.md`. A new public component needs source, preview, registry entry, and a passing `bun run check:registry`. Never rename existing `/r/{name}.json` slugs.

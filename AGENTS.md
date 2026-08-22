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

- `components/motion/` and `components/agents/` — the library. One file per component; multi-file widgets get a folder (`swap/`, `button/`, `loading-states/`).
- `components/previews/` — demo per component, registered in `components/previews/index.tsx`. Previews ship through the registry too. When an interactive preview uses internal demo helpers, set the registry entry's `usageFile` to a separate public composition so the Usage tab stays copyable.
- `components/app/` — site chrome (header, hero, dock, code blocks). Not part of the library.
- `lib/registry.ts` — component catalog (slugs, files, examples). Three categories: `motion` (display name "Components", primitives), `agents` (AI and agent interface primitives), and `blocks` (composed widgets: swap, dynamic island, command palette, expandable action bar). Blocks emit `registry:block` shadcn items. Preview files live under `components/previews/<category>/`. `lib/registry-server.ts` builds registry items by following each file's `@/` and relative imports and bundling everything it finds. Internal imports are therefore safe and encouraged; a component that imports `@/lib/ease` ships `lib/ease.ts` with it.
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
| `combobox` | `components/motion/combobox.tsx` | Composable searchable selection primitives whose input is the trigger; the measured list springs open from the field and detaches without page reflow, with stable collision-aware placement through exit, grouped filtering, keyboard navigation that is live as soon as the list appears, a spring-gliding active row and controlled/uncontrolled state |
| `range-slider` | `components/motion/range-slider.tsx`, `range-slider-fluid.tsx`, `range-slider-wave.tsx`, `range-slider-bubble.tsx`, `range-slider-ruler.tsx` | Five slider designs, one per `examples` entry with its own `installSlug`. `RangeSlider` (base) has tick dots and a vertical-bar thumb that bounces onto each step. `FluidSlider` has no thumb: the fill runs behind a rounded liquid cap and the label flips color under it. `WaveSlider` is equalizer bars that peak around the handle. `BubbleSlider` pops a value bubble that tilts and squashes with drag velocity. `RulerSlider` scrolls the scale under a fixed needle with drag momentum. All share value/step/drag/keyboard plumbing from `lib/hooks/use-slider.ts`; controlled/uncontrolled, reduced-motion safe |
| `wheel-picker` | `components/motion/wheel-picker.tsx` | iOS-style picker wheel (`WheelPicker`): a 3D drum on custom momentum physics (velocity-projected coast, spring-back settle) with a crisp clipped center band; drag, wheel and keyboard, optional synthesized tick sound per row crossed (`sound` prop, default off), composes side by side for date/time pickers, controlled/uncontrolled, reduced-motion safe |
| `bottom-sheet` | `components/motion/bottom-sheet.tsx` | Draggable bottom sheet with snap points, inertia and glass surface |
| `pull-to-refresh` | `components/motion/pull-to-refresh.tsx` | Native-feeling refresh container with touch and mouse pull resistance, threshold feedback and async refresh handling |
| `shared-layout-bg` | `components/motion/shared-layout-bg.tsx` | Pill that glides between hovered items via shared layout |
| `bounce-sidebar` | `components/motion/bounce-sidebar.tsx` | Vertical navigation whose active dot jumps between rows on a curved spring path; controlled/uncontrolled, links or buttons, reduced-motion safe |
| `animated-sidebar` | `components/motion/animated-sidebar.tsx` | Shadcn-style application sidebar with provider-managed desktop/mobile state, icon or off-canvas collapse, morphing nested-menu primitives, animated content inset, toggle rail, keyboard shortcut and a focus-managed mobile sheet |
| `preview-rail` | `components/motion/preview-rail.tsx` | Vertical or horizontal link/button navigation ticks that form a pyramid around the hovered item with an optionally positioned gliding preview card |
| `dock` | `components/motion/dock.tsx` | macOS-style dock with grouped actions and gliding active pill |
| `tooltip` | `components/motion/tooltip.tsx` | Hover/focus tooltip with blur enter/exit and spring spawn |
| `context-menu` | `components/motion/context-menu.tsx` | Composable right-click/long-press menu with a pointer-origin clip morph, a spring-gliding active row, checkbox/radio choices, keyboard navigation and typeahead |
| `popover` | `components/motion/popover.tsx`, `popover-morph.tsx` | Composable popover, two variants. **Gooey** (`Popover`, `PopoverTrigger`, `PopoverContent`, install `@beui/popover`): panel oozes out of the trigger via an SVG goo filter (liquid neck that stretches/pinches) with crisp content fading in on top. **Morph** (`MorphPopover`, `MorphPopoverTrigger`, `MorphPopoverContent`, install `@beui/popover-morph`): panel laid out full size but clipped to the corner nearest the trigger, then unclips as one piece with a drop-shadow that hugs the shape; side/align aware. Both render through a body portal so they escape clipping and stacking contexts; click trigger, controlled/uncontrolled |
| `morphing-modal` | `components/motion/morphing-modal.tsx` | Panel that morphs height across inner views with blur cross-fade |
| `center-morph-modal` | `components/motion/center-morph-modal.tsx` | Composable modal whose full-size surface unfolds from its exact center toward every edge, then folds back the same way with an inset close control |
| `chromatic-text-reveal` | `components/motion/chromatic-text-reveal.tsx` | Fixed sentence prefix with a cycling final word revealed by a chromatic sweep |
| `text-reveal` | `components/motion/text-reveal.tsx` | Word or character reveal with spring slide-up and blur |
| `text-shimmer` | `components/motion/text-shimmer.tsx` | Gradient sweep across text for loading or emphasis |
| `text-cascade` | `components/motion/text-cascade.tsx` | Letter-by-letter slot roll for standalone text |
| `text-scramble` | `components/motion/text-scramble.tsx` | Controlled character scramble that resolves changed text while exposing a stable accessible value |
| `number-ticker` | `components/motion/number-ticker.tsx` | Slot-machine rolling digits with staggered entry |
| `animated-number` | `components/motion/animated-number.tsx` | Spring-driven count-up triggered when in view |
| `animated-badge` | `components/motion/animated-badge.tsx` | Status badge with animated state icons and pulse feedback |
| `action-swap` | `components/motion/action-swap.tsx` | Core swap primitives: `ActionSwapButton`, `ActionSwapText`, `ActionSwapIcon` with blur/roll/cascade variants |
| `action-swap-blur` | `components/motion/action-swap-blur.tsx` | Blur + scale + opacity swap variants |
| `action-swap-roll` | `components/motion/action-swap-roll.tsx` | Vertical roll-in swap variants |
| `action-swap-cascade` | `components/motion/action-swap-cascade.tsx` | Letter-cascade swap variants — `ActionSwapCascadeButton`, `ActionSwapCascadeText`, `ActionSwapCascadeIcon` |
| `animated-toast-stack` | `components/motion/animated-toast-stack.tsx` | Stacked toasts with status morphs, swipe dismissal and layout-aware motion |
| `theme-toggle` | `components/motion/theme-toggle.tsx` | Theme toggle with a full-page reveal via the View Transition API. `variant`: `rectangle` / `circle` / `circle-blur` are clip-path reveals from a `start` corner; `blinds` masks the new snapshot with a repeating gradient whose slats widen shut (band anchored to the tile's far end so it closes without seams, driven by an `@property`-registered length) |
| `bouncy-accordion` | `components/motion/bouncy-accordion.tsx` | Single-open accordion with weighted spring layout and icon rows |
| `magnetic` | `components/motion/magnetic.tsx` | Cursor-attracted magnetic pull wrapper |
| `scroll-animation` | `components/motion/smooth-scroll.tsx`, `scroll-progress.tsx`, `parallax.tsx`, `scroll-to.tsx`, `scroll-reveal.tsx` | Scroll-driven motion group (variants install as `@beui/smooth-scroll`, `@beui/scroll-progress`, `@beui/parallax`, `@beui/scroll-to`, `@beui/scroll-reveal`). **Smooth Scroll**: Lenis provider (`root` page / `root={false}` contained) + `useSmoothScroll` hook (offset/progress/velocity, `scrollTo`), reduced-motion native. **Scroll Progress**: bar or ring reading `useSmoothScroll().progress`. **Parallax**: drifts children at a speed factor across the viewport, either axis. **Scroll To**: button that smooth-scrolls to a target via the provider. **Scroll Reveal**: spring slide + blur reveal on viewport enter |

### AI Agents (`agents` category — agent interface primitives)

| slug | file | what it does |
|---|---|---|
| `chat-app` | `components/agents/chat-app.tsx` | Composable agent workspace shell (`ChatApp`) backed by the animated sidebar provider; its complete usage example combines navigation, messages, streaming, planning, approvals, tool results, code, diffs, generated media, sources, and prompt input |
| `ai-sidebar` | `components/agents/ai-sidebar.tsx` | Collapsible AI workspace sidebar (`AISidebar`) for folders, projects, files, and bookmarks with full-row drag and keyboard moves, optimistic rollback, inline rename, persistent menu hover, open-folder icons, and overflow-only marquee labels |
| `message-bubble` | `components/agents/message-bubble.tsx` | Focused conversational surface (`MessageBubble`) with six visual treatments, independent alignment, an opt-in mount-only surface pop, compact grouping, polymorphic links/buttons, and `MessageBubbleCollapsible` for long responses; streaming geometry updates immediately |
| `message` | `components/agents/message.tsx` | Composable conversation message (`Message`) with bubble, avatar, header, footer, group, marker, and typing primitives plus an opt-in mount-only trailing-edge pop-up for newly sent rows; re-exports the independently installable `MessageScroller` for compatibility |
| `message-scroller` | `components/agents/message-scroller.tsx` | Reader-aware conversation viewport (`MessageScroller`) that follows streamed growth only at the live edge, releases on deliberate navigation, and can add a compact message rail that previews, tracks, and scrolls to rendered messages |
| `prompt-input` | `components/agents/prompt-input.tsx` | Auto-growing agent composer (`PromptInput`) with controlled/uncontrolled prompt and model state, a configurable animated actions menu, model selection, Enter-to-send, multiline input, and send/stop actions |
| `todo-list` | `components/agents/todo-list.tsx` | Collapsible agent task plan (`TodoList`) with pending/in-progress/completed/cancelled states, morphing progress-to-check marks, a completion count, stable streaming rows, bounded smooth following, and compact per-task metadata |
| `code-block` | `components/agents/code-block.tsx` | Syntax-highlighted agent code surface (`CodeBlock`) with stable streamed updates, optional line numbers and focused lines, bounded smooth following, filename/language metadata, and copy feedback |
| `approval-card` | `components/agents/approval-card/` | Human-in-the-loop decision surface (`ApprovalCard`) for approval/rejection/revision actions and single-choice, multiple-choice, freeform, or multi-step questions; single choices advance by default, with controlled/uncontrolled answers and step state, reduced-motion safe transitions, and collapsed submitted outcomes |
| `file-diff` | `components/agents/file-diff.tsx` | Progressive syntax-highlighted file change disclosure (`FileDiff`) with stable line rows, live addition/deletion counts, bounded smooth following, copy support, and completion collapse |
| `tool-result` | `components/agents/tool-result.tsx` | Lightweight execution disclosure (`ToolResult`) for syntax-highlighted terminal output and request responses; bounded auto-following output, success/error/cancelled states, completion collapse, copy/retry actions, and the reusable `ToolResultOutput` renderer |
| `loading-states` | `components/agents/loading-states/` | Three agent loading states: `ThinkingShimmer`, compact live-timed `AgentProgress`, and `ReasoningText` with an ASCII loader, shimmering phrases, and cascade/swap/scramble styles; each variant is independently installable and reduced-motion safe |
| `agent-activity` | `components/agents/agent-activity/` | Adaptive agent activity disclosure (`AgentActivity`): renders compact streaming text, reasoning steps, search results, tool calls, structured execution traces, or a chronological mix; derives a matching active/completed summary, smoothly follows entries in a capped viewport, then collapses into a reopenable disclosure |
| `streaming-response` | `components/agents/streaming-response.tsx` | Renderer-agnostic streamed answer surface (`StreamingResponse`) with completion-only copy, retry, feedback, an optional expandable source summary, and controls for actions and nested live-region announcements |
| `image-generation` | `components/agents/image-generation.tsx` | Stable generated-media canvas (`ImageGeneration`) with queued, generating, refining, complete, and recoverable error states; progressively resolves supplied media without remounting or shifting the surrounding conversation |
| `tool-approval` | `components/agents/tool-approval.tsx` | Human-in-the-loop permission card (`ToolApproval`) with controlled execution states, expandable parameters, allow-once/always-allow/deny actions, optional Shiki-powered `ToolApprovalCode` values, and reduced-motion behavior |
| `citations` | `components/agents/citations.tsx` | Collapsible progressive citation collection (`Citations`) paired with inline `Citation` links; derives real favicons from each URL via `lib/favicon.ts` and renders compact numbered title/domain rows with controlled disclosure and reduced motion |

### Blocks (`blocks` category — composed product widgets)

| slug | file | what it does |
|---|---|---|
| `infinite-masonry` | `components/motion/infinite-masonry.tsx` | Responsive virtualized masonry with measured variable-height cards, automatic lanes and infinite loading near the scroll boundary |
| `notification-stack` | `components/motion/notification-stack.tsx` | Compact notification cards that spring from a stacked summary into a readable list on hover, focus or tap |
| `project-folder` | `components/motion/project-folder.tsx` | Project folder whose file fan opens on hover/focus, morphs into a focus-managed overlay on click, and retraces the complete path when closed; controlled/uncontrolled open and expanded state, reduced-motion safe |
| `swap` | `components/motion/swap.tsx` + `swap/` | Cross-chain swap widget with chain/token selectors and morphing views |
| `dynamic-island` | `components/motion/dynamic-island.tsx` | iOS-style island pill that morphs between live activity views |
| `command-palette` | `components/motion/command-palette.tsx` | ⌘K palette with fuzzy filter and spring-animated active row |
| `morphing-search` | `components/motion/morphing-search.tsx` | Search field that morphs into a focus-managed results surface on click or plain-key shortcut, then returns to the same shell on close |
| `expandable-action-bar` | `components/motion/expandable-action-bar.tsx` | Icon actions that expand into labeled controls on hover/focus |
| `overflow-actions` | `components/motion/overflow-actions.tsx` | Connected pill rail that springs open to reveal extra controls |
| `expandable-tabs` | `components/motion/expandable-tabs.tsx` | Icon tab bar where active tab expands to labeled pill with height-morphing panel |
| `swipeable-list` | `components/motion/swipeable-list.tsx` | List rows that swipe left/right to reveal contextual action buttons |
| `file-upload` | `components/motion/file-upload.tsx`, `attachment-upload.tsx` | Two upload patterns. `AttachmentUpload` mixes staggered file/image rows, upload/success/failure/removal feedback with retry, shared-layout image previews, and an audio waveform; `FileUpload` is the original progress queue with retry/remove actions |
| `prediction-market` | `components/motion/prediction-market.tsx` | Trade ticket with buy/sell modes, outcome prices and rolling amount entry |
| `otp-input` | `components/motion/otp-input.tsx` | One-time-code input with gliding focus ring, roll-in digits, error shake and success draw |
| `signup-form` | `components/motion/signup-form.tsx` | Composed sign-up form (`SignUpForm`) over `Input`, `Checkbox` and `StatefulButton`. Validation is "reward early, punish late": errors compute on every change but only render once a field has been blurred, so first entry is never flagged mid-typing while an errored field clears the instant it becomes valid; submit touches every field at once. Ships a length-weighted `passwordStrength` heuristic (NIST SP 800-63B — length dominates, character classes only nudge), password reveal toggle, and idle/loading/success/error submit states driven by a returned promise. Zero new dependencies; pass `validate` to swap in a schema library. Controlled/uncontrolled, reduced-motion safe |
| `bloom-menu` | `components/motion/bloom-menu.tsx` | Button that morphs open into a menu and blooms iris-out from center via shared layout + clip-path, with radially staggered items |
| `knockout-bracket` | `components/motion/knockout-bracket.tsx` | Page is "Fixtures", a generic tournament-fixtures page whose versions live in the entry's `examples` (404 / Not Found has the same shape). Version one is Knockout Bracket (`KnockoutBracket`): pages one round at a time, later rounds center on their feeders, optional `thirdPlace` match under a rule. Data-driven for any single-elimination draw — `rounds` widest first (`matches[k]` fed by `2k`/`2k+1`), `Team` takes a `logo` URL or a country `code` (neither falls back to initials), `date`/`time`/`status` optional, per-match `badge` overrides the "FT" chip, `thirdPlaceLabel` renames the play-off. Add a fixture style as another `examples` item with its own `installSlug`, and keep `knockout-bracket` as one of them so `/r/knockout-bracket.json` still resolves |
| `knockout-wheel` | `components/motion/knockout-wheel.tsx` | Version two of the Fixtures page. `KnockoutWheel` draws the same tournament radially: champion at the hub, one ring per round outward, teams on the rim, siblings joined by an arc at the midpoint radius. Nodes spring in ring by ring and hovering one isolates that team; with no pointer on it the champion's path stays lit. Takes the same `rounds` array as the bracket, so one dataset feeds both; rings and geometry follow the draw while the stage keeps a fixed 32rem floor (node radius grows with depth, so a shallow draw has the smallest marks and needs the width most), and teams render a `logo`, a flag from `code`, or initials. Carries its own copy of the `Match`/`Round` types so the install stays standalone, and they stay structurally compatible with the bracket's |
| `availability-scheduler` | `components/motion/availability-scheduler/` | Weekly availability editor (`AvailabilityScheduler`): each day springs between available/unavailable via a shared-layout toggle, time ranges add/remove with blur-slide + layout reflow, times pick from a self-contained scrollable dropdown, and a copy menu clones a day's hours to selected days or every day; controlled/uncontrolled, reduced-motion safe |

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
- Unmount overlays while closed: wrap the chrome in `AnimatePresence`. A transparent full-viewport fixed layer is costly on iOS Safari (see `tests/fixed-overlay-edge-sampling.test.tsx`). If an overlay must stay mounted, hide it on the close path only. Flip the hidden state from the exit animation's completion callback, not from a duration constant. Open instantly: focus and measurement effects fail against a hidden element. Re-test the open path after you change show/hide code.
- Gate overlay interaction on presence, not on `open`. During the exit, `open` is already false but the chrome is still the topmost element on the page. Spread the `gate` from `PresenceGate` (`lib/presence-gate.tsx`) onto every layer that takes pointer events. The gate removes pointer events, focus order, and accessibility exposure (through `inert`) in the same commit that starts the exit; the visual exit continues. Put `inert={!isPresent}` alone on a wrapper that never takes pointer events. An always-mounted overlay gates on its own open state instead; that state flips on the same render.
- Every `position: fixed` overlay layer must paint a colour, or have no children, or stay off the viewport edges. The sweep test checks every overlay in each state; add a row for each new overlay, and copy the layer shapes from an existing overlay rather than inventing new ones. When you move padding between layers, keep the panel's content box unchanged at every viewport. Render the backdrop and the dialog as separate top-level layers; never put the backdrop inside the dialog's scroll container (iOS Safari positions `fixed` elements against an ancestor scroller, so a nested backdrop stops covering the viewport).

## Code conventions

- Named exports only. Every component accepts `className` merged via `cn()` from `lib/utils`. Interactive components are `"use client"`.
- Resolve which row of a list is active — highlighted, or the owner of a roving `tabIndex` — **during render**, never in a passive effect. A passive effect runs after the commit, so the component holds a wrong or absent active row for a window of milliseconds: a key pressed in that window acts on the wrong row, and a roving `tabIndex` chosen in an effect leaves the list untabbable in its first commit and in server-rendered markup. `lib/hooks/use-row-cursor.ts` is the ordinary case; `components/motion/combobox/use-active-option.ts` is the same model with wrap-around stepping, `first`/`last`, a disabled-row filter and a not-yet-opened state.
  - Hold the cursor as the row's **identity**, not its position — a position cannot tell a list that shrank from one that swapped its rows for a different set of the same length.
  - Clear a stale cursor rather than ignoring it, so rows that come back cannot revive it.
  - Step the cursor through a functional update, so two keys in one batch move two rows.
  - Give the returned callbacks an identity stable for the component's life. The exhaustive-deps rule will put them in a caller's effect dependencies, and one rebuilt per keystroke re-runs that effect per keystroke. Keep any value a stable callback reads in a ref written from a layout effect, never during render.
  - Start a fresh session in the render that opens (`lib/hooks/use-on-open.ts`), and set only the component's own state there: a consumer's callback, a DOM write or a focus move is a side effect and belongs in an effect keyed to `open`.
- Larger components support controlled + uncontrolled (`value`/`defaultValue`/`onChange`); simple toggles are controlled-only.
- Biome a11y rules are strict: no redundant ARIA roles on divs/spans; use real elements (`<button>`) for interactive things. `DockItem` renders a `<button>` when given `onClick` and a plain div wrapper when children carry their own link/button — never nest interactive elements.
- New component = source file + preview + `lib/registry.ts` entry in the same change. `bun run check:registry` must pass.
- A `new` component's registry entry must set `launchedAt` to the ship date (`YYYY-MM-DD`). The landing "Recently launched" section sorts by it newest-first, so the just-added component leads.
- A change to a component's public behavior or docs must bump `updatedAt` in `lib/component-dates.ts` to the ship date (`YYYY-MM-DD`) for every registry item that bundles a changed file, not just the one you were editing. A shared file usually ships in several entries, and the category slug is not the directory, so resolve the set from the entries' file lists rather than by path. Site-wide maintenance must not refresh every component's date.
- A test helper that models an external rule must implement every clause its comment cites. Give the helper its own fixture tests. Do not infer semantics from class-name prefixes: `bg-*` includes non-painting utilities and `bg-transparent`.

## Commits

Conventional lowercase prefixes (`feat:`, `fix:`, `refactor:`, `docs:`), imperative subject. No AI attribution or Co-Authored-By lines.

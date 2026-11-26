/**
 * The beUI skill's picker: what a user asks for, the install slugs that answer
 * it, and the lookalikes to avoid. `bun scripts/sync-skill.ts` writes it into
 * skills/beui/SKILL.md, and `check:registry` fails when the two differ or a
 * slug here is not a real install slug, so the table an agent reads cannot
 * drift from the registry. `avoid` is Markdown: name slugs in backticks.
 */
export type PickerRow = { ask: string; install: string[]; avoid: string };

export const agentPicker: PickerRow[] = [
  { ask: "Toast or snackbar", install: ["animated-toast-stack"], avoid: "`notification-stack`" },
  { ask: "Expanding notification inbox", install: ["notification-stack"], avoid: "`animated-toast-stack`" },
  { ask: "Mobile bottom sheet, Vaul-style panel", install: ["bottom-sheet"], avoid: "`drawer`" },
  { ask: "Side panel or app drawer", install: ["drawer"], avoid: "`bottom-sheet`" },
  { ask: "App chrome sidebar", install: ["animated-sidebar"], avoid: "`bounce-sidebar`, `ai-sidebar`" },
  { ask: "AI files, folders, bookmarks", install: ["ai-sidebar"], avoid: "`animated-sidebar`" },
  { ask: "Whole agent workspace", install: ["chat-app"], avoid: "hand-rolled chat shell" },
  { ask: "Streaming thread that follows tokens", install: ["message-scroller","message"], avoid: "custom scroll math" },
  { ask: "Just a chat bubble", install: ["message-bubble"], avoid: "custom bubble" },
  { ask: "Prompt box or composer", install: ["prompt-input"], avoid: "textarea plus custom buttons" },
  { ask: "Agent reasoning, search, tool trace", install: ["agent-activity"], avoid: "plain log list" },
  { ask: "Task plan", install: ["todo-list"], avoid: "custom checklist" },
  { ask: "Code surface", install: ["code-block"], avoid: "pre/code from scratch" },
  { ask: "File diff", install: ["file-diff"], avoid: "custom diff renderer" },
  { ask: "Tool output", install: ["tool-result"], avoid: "raw terminal block" },
  { ask: "Tool permission card", install: ["tool-approval"], avoid: "alert dialog" },
  { ask: "Approval or HITL question", install: ["approval-card"], avoid: "custom form" },
  { ask: "Inline citations", install: ["citations"], avoid: "plain numbered links" },
  { ask: "Generated image canvas", install: ["image-generation"], avoid: "image card from scratch" },
  { ask: "Liquid popover", install: ["popover"], avoid: "`popover-morph`" },
  { ask: "Corner morph popover", install: ["popover-morph"], avoid: "`popover`" },
  { ask: "Dropdown select", install: ["select"], avoid: "`select-morph`, `combobox`" },
  { ask: "Select that grows into panel", install: ["select-morph"], avoid: "`select`" },
  { ask: "Searchable select", install: ["combobox"], avoid: "`select`" },
  { ask: "Cmd+K palette", install: ["command-palette"], avoid: "`combobox`" },
  { ask: "Right-click or long-press menu", install: ["context-menu"], avoid: "`bloom-menu`" },
  { ask: "Button that blooms into a menu", install: ["bloom-menu"], avoid: "`context-menu`" },
  { ask: "Press button", install: ["button-base"], avoid: "custom `motion.button`" },
  { ask: "Loading/success/error button", install: ["button-stateful"], avoid: "spinner button" },
  { ask: "Magnetic button", install: ["button-magnetic"], avoid: "custom pointer tracking" },
  { ask: "Hold to confirm", install: ["hold-action-button"], avoid: "`button-base`" },
  { ask: "Slide to confirm", install: ["slide-action-button"], avoid: "`swipeable-list`" },
  { ask: "Hover CTA with expanding arrow", install: ["expanding-arrow-button"], avoid: "`button-base`" },
  { ask: "Spinner, dots, bars loader", install: ["loader"], avoid: "`thinking-shimmer`" },
  { ask: "Agent thinking status", install: ["thinking-shimmer"], avoid: "`loader`, `text-shimmer`" },
  { ask: "Cycling reasoning phrases", install: ["reasoning-text"], avoid: "`text-cascade`" },
  { ask: "Timed agent progress glyph", install: ["agent-progress"], avoid: "`loader`" },
  { ask: "Shimmer headline text", install: ["text-shimmer"], avoid: "`thinking-shimmer`" },
  { ask: "Word or letter reveal", install: ["text-reveal"], avoid: "`text-cascade`" },
  { ask: "Chromatic cycling word", install: ["chromatic-text-reveal"], avoid: "`text-shimmer`" },
  { ask: "Slot-machine letters", install: ["text-cascade"], avoid: "`text-scramble`" },
  { ask: "Scramble resolving text", install: ["text-scramble"], avoid: "`text-cascade`" },
  { ask: "Rolling digits", install: ["number-ticker"], avoid: "`animated-number`" },
  { ask: "Count-up on view", install: ["animated-number"], avoid: "`number-ticker`" },
  { ask: "Tick-dot slider", install: ["range-slider"], avoid: "other `range-slider-*`" },
  { ask: "Inline label slider", install: ["range-slider-inline"], avoid: "`range-slider`" },
  { ask: "Liquid fill slider", install: ["range-slider-fluid"], avoid: "`range-slider`" },
  { ask: "Equalizer slider", install: ["range-slider-wave"], avoid: "`range-slider`" },
  { ask: "Tilting value bubble slider", install: ["range-slider-bubble"], avoid: "`range-slider`" },
  { ask: "Ruler slider", install: ["range-slider-ruler"], avoid: "`range-slider`" },
  { ask: "iOS wheel picker", install: ["wheel-picker"], avoid: "`select`" },
  { ask: "macOS dock", install: ["dock"], avoid: "`expandable-action-bar`" },
  { ask: "Icon actions with labels", install: ["expandable-action-bar"], avoid: "`dock`" },
  { ask: "Overflow action rail", install: ["overflow-actions"], avoid: "`expandable-action-bar`" },
  { ask: "Icon tabs with active label", install: ["expandable-tabs"], avoid: "`tabs`" },
  { ask: "Morphing tab content room", install: ["morphing-tabs"], avoid: "`tabs`" },
  { ask: "Pill or underline tabs", install: ["tabs"], avoid: "`expandable-tabs`" },
  { ask: "Hover gliding background", install: ["shared-layout-bg"], avoid: "`tabs`" },
  { ask: "Preview ticks or rail", install: ["preview-rail"], avoid: "`bounce-sidebar`" },
  { ask: "Dynamic Island", install: ["dynamic-island"], avoid: "`notification-stack`" },
  { ask: "Swipe row actions", install: ["swipeable-list"], avoid: "`slide-action-button`" },
  { ask: "Pull to refresh", install: ["pull-to-refresh"], avoid: "custom touch math" },
  { ask: "Basic upload queue", install: ["file-upload"], avoid: "`attachment-upload`" },
  { ask: "Mixed file, audio, image attachments", install: ["attachment-upload"], avoid: "`file-upload`" },
  { ask: "OTP or PIN boxes", install: ["otp-input"], avoid: "`input`" },
  { ask: "Sign-up form", install: ["signup-form"], avoid: "manual form assembly" },
  { ask: "Theme wipe", install: ["theme-toggle"], avoid: "class toggle only" },
  { ask: "Shader background", install: ["shader-background"], avoid: "custom canvas" },
  { ask: "Cylinder carousel", install: ["cylinder-carousel"], avoid: "`marquee`" },
  { ask: "Logo or text marquee", install: ["marquee"], avoid: "`cylinder-carousel`" },
  { ask: "Data table", install: ["table"], avoid: "HTML table from scratch" },
  { ask: "Activity heatmap, contribution graph", install: ["heat-calendar"], avoid: "custom grid" },
  { ask: "Monthly returns grid", install: ["returns-calendar"], avoid: "`heat-calendar`" },
  { ask: "Analyst price target chart, forecast fan", install: ["price-target-fan"], avoid: "custom svg chart" },
  { ask: "Editable table", install: ["table-editable"], avoid: "`table`" },
  { ask: "Async table", install: ["table-async"], avoid: "`table`" },
  { ask: "Tournament bracket", install: ["knockout-bracket"], avoid: "`knockout-wheel`" },
  { ask: "Radial tournament wheel", install: ["knockout-wheel"], avoid: "`knockout-bracket`" },
  { ask: "404 page", install: ["not-found-glitch"], avoid: "custom 404" },
  { ask: "Project folder card", install: ["project-folder"], avoid: "folder card from scratch" },
  { ask: "Token or chain swap", install: ["swap"], avoid: "custom swap form" },
  { ask: "Weekly availability editor", install: ["availability-scheduler"], avoid: "custom calendar grid" },
  { ask: "Wallet overview card", install: ["wallet-card"], avoid: "custom wallet card" },
  { ask: "Prediction market ticket", install: ["prediction-market"], avoid: "custom trade ticket" },
  { ask: "Feedback popup", install: ["feedback-widget"], avoid: "`animated-toast-stack`" },
  { ask: "Infinite masonry grid", install: ["infinite-masonry"], avoid: "CSS columns" },
  { ask: "Accordion", install: ["bouncy-accordion"], avoid: "custom accordion" },
  { ask: "3D tilt card", install: ["tilt-card"], avoid: "custom glare math" },
  { ask: "Tooltip", install: ["tooltip"], avoid: "`popover`" },
  { ask: "Switch, checkbox, radio, input", install: ["switch","checkbox","radio","input"], avoid: "restyled native controls" },
];

export const PICKER_START = "<!-- picker:start (generated from lib/agent-picker.ts; run bun scripts/sync-skill.ts) -->";
export const PICKER_END = "<!-- picker:end -->";

/** The picker as the Markdown table SKILL.md shows. */
export function pickerTable() {
  return [
    "| User asks for | Install `@beui/...` | Avoid |",
    "| --- | --- | --- |",
    ...agentPicker.map(
      (row) => `| ${row.ask} | ${row.install.map((slug) => `\`${slug}\``).join(", ")} | ${row.avoid} |`,
    ),
  ].join("\n");
}

/** Slugs a row names: its installs, and any backticked slug in `avoid`. */
export function pickerSlugs(row: PickerRow) {
  const avoided = [...row.avoid.matchAll(/`([a-z0-9-]+)`/g)].map((match) => match[1] ?? "");
  return [...row.install, ...avoided];
}

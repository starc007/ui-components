/**
 * One-line summaries shown under each component page title, keyed by registry
 * slug. One sentence, 80 characters or fewer, no em dashes.
 * `scripts/check-registry.ts` fails when a page has none or one runs long.
 */
export const SUMMARY_MAX = 80;

export const componentSummaries: Record<string, string> = {
  bookshelf: "Book spines that slide out and turn in 3D to show the cover.",
  "dropdown-menu":
    "Menus with a gliding highlight, submenus and full keyboard control.",
  "before-after-slider": "Compare two images with a draggable divider.",
  timeline: "A draggable timeline of dated events around a focused card.",
  alert: "Inline feedback messages that animate in and out by status.",
  collapsible: "Expandable sections that reveal their content with a soft spring.",
  "aspect-ratio": "Media frames that hold a ratio and animate when it changes.",
  "arc-picker":
    "Pick text from a curved wheel that snaps a bracket around each label.",
  "sortable-stack":
    "Reorder rows by drag or keyboard, with springy layout and undo.",
  "image-viewer": "Galleries that open into a lightbox with swipe, keys and zoom.",
  "date-range-picker":
    "Pick a start and end date from a popover calendar with presets.",
  card: "Outlined or muted content cards with an optional selectable state.",
  "color-picker":
    "A swatch that morphs into a color area with hue and opacity sliders.",
  "color-selector":
    "Color swatches with a selection ring that glides between them.",
  pagination: "Page numbers that slide under a gliding current-page pill.",
  "avatar-group":
    "Stacked avatars that fan apart on hover and expand from a +N count.",
  breadcrumb:
    "Path navigation with soft transitions and a dropdown for long trails.",
  "tilt-card": "Cards that tilt in 3D toward the cursor with a tracking glare.",
  button: "Spring-pressed buttons, plus stateful, magnetic and metallic styles.",
  "expanding-arrow-button":
    "Call-to-action buttons that expand, hold to confirm or slide to act.",
  "expandable-control":
    "Buttons and chips that open to reveal a label or trailing action.",
  "adaptive-stepper":
    "A number stepper that rolls its value and reshapes at the limits.",
  marquee: "Endless horizontal or vertical scroll that pauses on hover.",
  tabs: "Pill, segment or underline tabs with a springy sliding indicator.",
  switch: "A toggle with a spring-driven thumb and press feedback.",
  input: "Text fields with icons, an error shake and a drawn success check.",
  select: "Option lists that unfold from the trigger or morph out of it.",
  combobox: "Searchable select with grouped filtering and keyboard navigation.",
  "multi-select":
    "Pick many options as removable tokens from a searchable panel.",
  checkbox: "Checkboxes with a draw-on checkmark and an indeterminate state.",
  radio: "Single-choice options with a dot that glides to the selection.",
  "bottom-sheet": "A draggable sheet that snaps to set heights with inertia.",
  "pull-to-refresh":
    "Pull down past a threshold to refresh, with native-style resistance.",
  "shared-layout-bg":
    "A hover pill that glides between items and blurs in and out.",
  "bounce-sidebar":
    "Sidebar nav whose active dot jumps between items on a curved path.",
  "animated-sidebar":
    "App sidebar that folds into an icon rail and becomes a sheet on mobile.",
  "file-tree":
    "Folders that spring open, with a gliding selection and full key support.",
  "preview-rail":
    "A rail of ticks that rise on hover and preview each destination.",
  dock: "A macOS-style bar of grouped actions with a gliding active pill.",
  tooltip: "Hints on hover, focus or tap that flip sides to stay on screen.",
  "context-menu": "Right-click or long-press menus that grow from the pointer.",
  popover: "Panels that ooze out of their trigger like liquid or morph from it.",
  "morphing-modal":
    "One dialog panel that resizes as you move between its views.",
  "center-morph-modal":
    "A full-size dialog that unfolds from its center to every edge.",
  "text-animation": "Text effects for reveals, shimmers, cascades and scrambles.",
  number: "Numbers that count up, roll like a ticker or swap digit by digit.",
  "animated-badge": "Status badges with animated icons and a pulse on change.",
  "action-swap":
    "Swap a button's label and icon with blur, roll or cascade motion.",
  "animated-toast-stack": "Toasts in one island that springs from pill to card to list.",
  "theme-toggle":
    "Switch themes with a full-page wipe, circle or shutter reveal.",
  "wave-reveal": "A colourful wave that carries one screen into the next.",
  "bouncy-accordion":
    "A single-open accordion with weighted, bouncy spring layout.",
  drawer: "A side panel that slides in with a blurred backdrop and scroll lock.",
  "scroll-animation":
    "Scroll-driven effects for smooth scrolling, progress, parallax and reveals.",
  "range-slider":
    "Sliders in six styles, from ruler to wave, with keyboard and drag.",
  "wheel-picker": "An iOS-style 3D drum that snaps to the nearest value.",
  table: "A virtualized data table for 10k+ rows with sorting and resizing.",
  "shader-background":
    "Animated canvas backgrounds from gradients, grain, waves and more.",
  "cylinder-carousel":
    "Items lined inside a cylinder that you drag, scroll or key to roll.",
  loader: "Seventeen loading indicators, from spinners to ASCII terminal art.",
  "line-chart":
    "Line and area charts that morph with data and snap a crosshair.",
  "bar-chart":
    "Grouped, stacked or horizontal bars that grow, rescale and reorder.",
  sparkline: "A tiny inline trend line for stat cards and tables.",
  "sankey-chart":
    "Weighted flows between stages that draw in and morph with data.",
  treemap: "Proportional tiles sized by value, with share tooltips.",
  "candlestick-chart":
    "Live OHLC candles with volume and a crosshair price readout.",
  "donut-chart":
    "Rounded share segments linked to a center readout and legend.",
  "volume-profile":
    "Volume by price with point of control and value area highlights.",
  "status-bar": "Uptime-style history in rounded bars with period tooltips.",
  "composition-chart":
    "Stacked shares over time as bars or areas, with a toggleable legend.",
  "funnel-chart":
    "Curved funnel stages, vertical or horizontal, with counting tooltips.",
  "liquidity-heatmap": "Liquidity bands over price and time with a price trace.",
  "bump-chart":
    "Rankings over time drawn as curved paths with hoverable rank dots.",
  "order-book": "Live bids and asks with depth bars, spread and volume balance.",
  "heat-calendar":
    "An activity grid of daily intensity with range selection and tooltips.",
  "returns-calendar": "Monthly returns by year in a grid with compounded totals.",
  "price-target-fan":
    "Price history that fans out to analyst targets as you scrub.",
  crash: "A crash game where the multiplier climbs until the round busts.",
  mines:
    "Pick tiles for gems to raise the multiplier and cash out before a mine.",
  plinko: "Balls drop through pegs, bounce row by row and land in prize slots.",
  "slide-game":
    "A reel of multiplier cards races past and slows onto your result.",
  "like-button": "A heart that pops, throws sparks and rolls its count up.",
  "bookmark-button":
    "A ribbon drops into the bookmark and the label turns to Saved.",
  "upvote-button":
    "An arrow that fills, shoots up and floats a +1 as the count rolls.",
  "copy-button":
    "Copy text and watch the icon blur into a check as Copy becomes Copied.",
  "text-morph":
    "Shared letters glide into place as one string morphs into another.",
  "follow-button":
    "A pill that closes into a spinner, draws a check and opens as Following.",
  "star-rating":
    "Stars that hop and fill in a wave, with sparks on the chosen one.",
  "add-to-cart":
    "A cart button that morphs into a quantity stepper with a rolling count.",
  "delete-button":
    "A bin that asks to confirm, spins while deleting, then checks off.",
  "download-button":
    "The whole button fills as a progress bar, then folds into a check.",
  "send-button":
    "A paper plane that winds up, takes off with a contrail and loops back.",
  "refresh-button":
    "Arrows that wind back, spin up and settle on a check as it updates.",
  "message-status":
    "Chat delivery ticks that close from a ring and turn blue when read.",
  "notification-bell":
    "A bell that swings and rings, with a badge that pops and bumps.",
  "reaction-picker":
    "A tray of reactions grows out, and your pick arcs back onto the button.",
  "share-button": "A round button that fans share actions out on an arc.",
  "mute-toggle":
    "A speaker whose waves fold in under a slash and pump back out.",
  "lock-toggle": "A padlock whose shackle drops shut and swings open again.",
  "poll-vote":
    "A one-tap poll where bars race to their shares as totals count up.",
  "status-icon": "One icon that spins while syncing, then closes into its result.",
  confetti: "A confetti burst you call like a toast, from any button.",
  "click-burst": "A burst of stars and dots from wherever you click.",
  "voice-orb": "A breathing liquid orb that reacts to voice level.",
  "voice-note": "A mic button that opens into a recording bar with a live waveform.",
  "message-bubble":
    "Chat bubbles with tones, grouping, avatars and show-more content.",
  message: "Conversation rows with grouped bubbles that pop in when sent.",
  "message-scroller":
    "A chat viewport that follows streaming output until you scroll away.",
  "prompt-input":
    "An auto-growing prompt box with model choice and send and stop states.",
  "todo-list":
    "An agent's task plan with morphing status marks and a done count.",
  "code-block":
    "Highlighted code that streams in stably, with line focus and copy.",
  "approval-card":
    "Ask the user to approve, choose or answer across multi-step reviews.",
  "file-diff":
    "A collapsible file diff that streams rows in with live change counts.",
  "tool-result":
    "Terminal or request output that collapses once the tool finishes.",
  "streaming-response":
    "An agent reply that renders as it streams, with actions and sources.",
  "image-generation":
    "Generated images that refine from queued to done without layout shift.",
  "tool-approval":
    "Let users allow a tool once, always, or deny it after reviewing details.",
  citations: "Inline source markers with a collapsible list of references.",
  "agent-activity": "One stream for reasoning, searches, tool calls and traces.",
  "loading-states":
    "Thinking states for AI: shimmering text, live progress, cycling phrases.",
  "ai-sidebar":
    "A sidebar for AI chats and files with drag moves and inline rename.",
  "chat-app":
    "A full agent chat workspace with streaming, plans, approvals and tools.",
  "infinite-masonry":
    "A virtualized masonry grid that loads more as you near the end.",
  "notification-stack":
    "Stacked notifications that spread into a list on hover or tap.",
  "project-folder":
    "A folder that fans its files on hover and opens into an overlay.",
  "card-folder":
    "A card that lifts out of a stitched pocket as the purse squeezes.",
  "knockout-bracket":
    "Tournament fixtures as a paging bracket or a wheel around the winner.",
  "availability-scheduler":
    "A weekly hours editor where days toggle and time ranges add in place.",
  swap: "A cross-chain swap with chain and token pickers and a live quote.",
  "dynamic-island": "An iOS-style pill that morphs between live activity views.",
  "command-palette":
    "A Cmd+K launcher with fuzzy search, a gliding active row and key hints.",
  "morphing-search":
    "A search field or icon that morphs into a glass results panel.",
  "expandable-action-bar":
    "Icon actions that expand into labeled controls on hover or focus.",
  "overflow-actions":
    "A pill rail of main actions that springs open to show more.",
  "expandable-tabs":
    "Icon tabs where the active one widens into a labeled pill.",
  "morphing-tabs":
    "Reorderable tabs where the selected one grows into its content.",
  "swipeable-list": "List rows you swipe left or right to reveal actions.",
  "file-upload": "Attach files, links and audio, or track uploads with retry.",
  "prediction-market":
    "Market cards with live odds and a buy or sell trade ticket.",
  "wallet-card":
    "A wallet overview with account switching and a cascading balance.",
  "otp-input": "Code entry with a gliding focus ring and digits that roll in.",
  "signup-form":
    "A sign-up form with fair validation and a password strength meter.",
  "card-dealer":
    "Cards that arc and flip between a deck, a fanned hand and a discard pile.",
  "bloom-menu":
    "A button that blooms open from its center into a grid of items.",
  "feedback-widget":
    "A corner button that morphs into a feedback form with send states.",
  "not-found": "404 pages in five styles, from glitch text to a typed terminal.",
  "sound-kit": "48 interface sounds, synthesized live. No audio files.",
  "tap-sound": "A fingertip on glass: a crisp click over a soft knock, for taps.",
  "press-sound": "A physical button click over a soft thump, for buttons.",
  "type-sound": "A keystroke with a soft thock and random pitch, for text inputs.",
  "select-sound": "A crisp detent, like a dial notch, for tabs and menu choices.",
  "toggle-sound": "A two-stage snap, rising for on and falling for off.",
  "open-sound": "A soft rising whoosh for menus, popovers and dialogs opening.",
  "close-sound": "A quick falling whoosh that settles, for things closing.",
  "navigate-sound": "An airy slide for moving between pages, steps or slides.",
  "success-sound": "Two mallet notes on a wooden bar, rising a fifth, for a done action.",
  "error-sound": "Two dull wooden knocks falling, for a failed action.",
  "warning-sound": "Two even taps on a small glass block, for a heads-up.",
  "notify-sound": "A small struck bell with a shimmer, for a new message or toast.",
  "copy-sound": "Two quick rising glass ticks, for copying to the clipboard.",
  "delete-sound": "A short paper crumple that drops away, for removing an item.",
  "drop-sound": "A soft thud with a small bounce, for dropping an item in place.",
  "tick-sound": "A tiny dry tick for sliders, pickers, counters and loading steps.",
  "bell-sound": "A resonant brass bell chime with rich partials, for alarms and reminders.",
  "bubble-sound": "A rounded liquid droplet pop, for chat bubbles, reactions and comments.",
  "burst-sound": "A celebratory triple-pop sparkle, for rewards and confetti celebrations.",
  "buzz-sound": "A short low haptic buzz for rejected input and boundary collisions.",
  "camera-sound": "A two-stroke camera shutter with a mirror-flip click and curtain strike.",
  "check-sound": "A crisp tactile stroke and warm upward knock for completing a task.",
  "chime-sound": "A three-note ascending bell arpeggio, for milestones and completions.",
  "coin-sound": "A bright metallic coin chime with a high ping and long overtone.",
  "collapse-sound": "An inward folding tone settling into a soft tap, for collapsing panels.",
  "connect-sound": "A positive two-step connection chord for integrations and devices.",
  "disconnect-sound": "A gentle downward release pop for unlinking accounts or devices.",
  "dismiss-sound": "A quick airy flick that drops away, for dismissing toasts.",
  "dock-sound": "A cushioned magnetic dock thump, for pinning side panels and windows.",
  "expand-sound": "A gentle blooming whoosh opening outward, for expanding accordions.",
  "heart-sound": "A warm two-beat acoustic pulse, for likes, favorites and bookmarks.",
  "lift-sound": "A soft lift click with rising resonance, for picking up dragged items.",
  "lock-sound": "A solid mechanical latch click and deep lock body thump.",
  "ping-sound": "A pure high crystalline bell ring, for mentions and live alerts.",
  "pop-sound": "A rounded bubbly pop sweeping upward, for badges and chips.",
  "receive-sound": "Two soft descending mallet notes for incoming chat messages.",
  "refresh-sound": "A springy upward swirl with a release chime for feed updates.",
  "reveal-sound": "A soft upward glass flourish, for revealing hidden content.",
  "send-sound": "An upward airy whoosh with a release tap for sending messages.",
  "shutter-sound": "A rapid mechanical aperture leaf snap with a metallic ring.",
  "snap-sound": "A sharp mechanical latch click for magnets and grid docking.",
  "star-sound": "A bright crystalline sparkle chime for starring items.",
  "swipe-sound": "An airy whoosh with subtle friction, for swipes and carousels.",
  "switch-sound": "A tactile hardware rocker switch with a double micro-click.",
  "timer-sound": "A dry hollow woodblock pulse for countdown timers and intervals.",
  "trash-sound": "A wooden-metallic drop with a textured rustle for discarding items.",
  "unlock-sound": "Two rising metal clicks, like a mechanical tumbler releasing.",
  "whisper-sound": "An ultra-soft acoustic puff for subtle hover hints and tooltips.",
};

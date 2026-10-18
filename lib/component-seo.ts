/**
 * Search titles and meta descriptions for every component page, keyed by
 * registry slug. Titles lead with the phrase people search for and stay short
 * enough to survive the " · beUI" suffix; descriptions name what the page
 * actually ships. `scripts/check-registry.ts` fails when a component has no
 * entry or a field runs past the limits below.
 */
export type ComponentSeo = {
  title: string;
  description: string;
};

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 165;

export const componentSeo: Record<string, ComponentSeo> = {
  // Components
  alert: {
    title: "Animated Alert Component for React and Tailwind",
    description:
      "Dismissible React alert with five variants, icon, title, action and close parts, polite or urgent announcements and a spring exit. Copy the source or use shadcn.",
  },
  collapsible: {
    title: "Animated Collapsible for React (Framer Motion)",
    description:
      "Composable React collapsible with a spring height reveal, custom triggers, controlled or uncontrolled state and focus handoff. Free source, shadcn install.",
  },
  "aspect-ratio": {
    title: "React Aspect Ratio Component with Smooth Resizing",
    description:
      "Responsive React aspect ratio frame and image that morph between ratios on a spring with cover cropping. Free, open source, copy-paste or install with shadcn.",
  },
  "arc-picker": {
    title: "Arc Picker: Radial Scroll Picker for React",
    description:
      "Curved React picker that selects labels as they cross center, with wheel, drag momentum and keyboard input and a bracket frame that morphs to each choice.",
  },
  "sortable-stack": {
    title: "Animated Sortable List for React (Drag and Drop)",
    description:
      "React sortable list with drag handles, spring layout, keyboard reordering, screen reader position announcements and undo. Copy the source or install with shadcn.",
  },
  "image-viewer": {
    title: "React Image Viewer and Lightbox with Zoom",
    description:
      "Animated React image viewer and lightbox with morphing thumbnails, swipe and keyboard navigation, zoom and pan, and focus management. Free, open source.",
  },
  "date-range-picker": {
    title: "React Date Range Picker Component (Tailwind)",
    description:
      "Composable React date range picker with inline and dropdown layouts, presets, month and year selection and full keyboard navigation. Free source, shadcn install.",
  },
  card: {
    title: "React Card Component for Tailwind and shadcn",
    description:
      "Composable React card with header, title, action, content and footer parts, compact spacing and an opt-in selectable state with press feedback. Free source.",
  },
  "color-picker": {
    title: "React Color Picker Component with Hex, RGB, HSL",
    description:
      "Animated React color picker with saturation area, hue and alpha sliders, hex, RGB and HSL fields, eye dropper, presets and keyboard control. Free and open source.",
  },
  "color-selector": {
    title: "Animated Color Swatch Selector for React",
    description:
      "React color swatch picker built on native radio inputs, with a gliding selection ring, press feedback and keyboard navigation. Copy the source or use shadcn.",
  },
  breadcrumb: {
    title: "Animated Breadcrumb Component for React",
    description:
      "React breadcrumb navigation that collapses long paths into an overflow dropdown, with slide-and-fade transitions, custom separators and router link support.",
  },
  "tilt-card": {
    title: "3D Tilt Card for React with Hover Glare",
    description:
      "React 3D tilt card with perspective rotation and a cursor-tracked glare on hover, disabled on touch and for reduced motion. Free, open source, copy-paste.",
  },
  button: {
    title: "Animated Button Components for React (Framer Motion)",
    description:
      "Spring-pressed React buttons: ripple, loading and success states, magnetic pull and a metallic finish. Tailwind styled, free source, install with shadcn.",
  },
  "expanding-arrow-button": {
    title: "Animated Call to Action Buttons for React",
    description:
      "Three animated CTA buttons for React: an arrow that expands on hover, hold to confirm with a liquid fill, and slide to confirm. Free source, shadcn install.",
  },
  "expandable-control": {
    title: "Expandable Button and Chip Controls for React",
    description:
      "React button and chip that expand on click to reveal a label or trailing action with spring layout motion. Controlled or uncontrolled, free and open source.",
  },
  "adaptive-stepper": {
    title: "Animated Number Stepper Input for React",
    description:
      "React number stepper whose value rolls between steps and whose controls adapt at the min and max without shifting layout. Keyboard safe, free source.",
  },
  marquee: {
    title: "React Marquee Component: Infinite Scroll Loop",
    description:
      "Infinite horizontal or vertical React marquee for logos and testimonials, with pause on hover and adjustable speed. Tailwind styled, free source, shadcn install.",
  },
  tabs: {
    title: "Animated Tabs for React with Framer Motion",
    description:
      "Accessible React tabs with a sliding spring indicator in pill, segment and underline styles, optional icons and scrollable overflow. Free source, shadcn install.",
  },
  switch: {
    title: "Animated Toggle Switch for React and Tailwind",
    description:
      "React toggle switch with a spring-driven thumb and press feedback, accessible switch semantics and reduced-motion support. Copy the source or install with shadcn.",
  },
  input: {
    title: "Animated Input Field for React with Validation",
    description:
      "React text input with label, icons, a stable error row, error shake and a success check draw. Tailwind styled, accessible, free source and shadcn install.",
  },
  select: {
    title: "Animated Select Dropdown for React (shadcn)",
    description:
      "Composable React select whose panel unfolds from the trigger on one spring, plus a morph variant where the trigger grows into the list. Free and open source.",
  },
  combobox: {
    title: "Animated Combobox for React: Searchable Select",
    description:
      "React combobox with search, grouped filtering, keyboard navigation and a spring-animated list that opens from the input. Controlled or uncontrolled, free source.",
  },
  "multi-select": {
    title: "React Multi Select with Search and Tags",
    description:
      "Searchable React multi select with removable animated tags and a collision-aware panel that morphs open. Keyboard accessible, free source, shadcn install.",
  },
  checkbox: {
    title: "Animated Checkbox for React and Tailwind",
    description:
      "React checkbox with a draw-on checkmark, spring press feedback, indeterminate state and optional description. Accessible, free source, install with shadcn.",
  },
  radio: {
    title: "Animated Radio Group for React and Tailwind",
    description:
      "React radio group with a gliding indicator dot, press feedback, descriptions and native keyboard navigation. Free, open source, copy-paste or shadcn install.",
  },
  "bottom-sheet": {
    title: "React Bottom Sheet with Snap Points (Vaul Style)",
    description:
      "Draggable React bottom sheet with snap points, inertia, a blurred backdrop and Escape to close, in the style of Vaul. Free source, install with the shadcn CLI.",
  },
  "pull-to-refresh": {
    title: "Pull to Refresh Component for React",
    description:
      "Native-feeling React pull to refresh with touch and mouse drag resistance, threshold feedback and async refresh handling. Free source, shadcn install.",
  },
  "shared-layout-bg": {
    title: "Animated Hover Background for React Nav Items",
    description:
      "A highlight pill that glides between hovered React menu items using Framer Motion shared layout, with blur enter and exit. Free, open source, copy-paste.",
  },
  "bounce-sidebar": {
    title: "Animated Sidebar Navigation with Bouncing Indicator",
    description:
      "Vertical React navigation whose active dot jumps between items on a curved spring path. Works with links or buttons, controlled or uncontrolled, free source.",
  },
  "animated-sidebar": {
    title: "Animated Sidebar for React and Next.js (shadcn)",
    description:
      "Collapsible React sidebar with an animated icon rail, morphing nested menus, a keyboard shortcut and a focus-managed mobile sheet. Free source, shadcn install.",
  },
  "file-tree": {
    title: "Animated File Tree Component for React",
    description:
      "React file and folder tree with springing branches, a gliding selection and full keyboard navigation. Composable parts, free source and shadcn install.",
  },
  "preview-rail": {
    title: "Navigation Rail with Hover Preview for React",
    description:
      "Compact React navigation rail whose ticks form a pyramid around the hovered item and reveal a floating preview card. Vertical or horizontal, free source.",
  },
  dock: {
    title: "macOS Dock Component for React",
    description:
      "macOS-style React dock with grouped actions and a gliding active pill, built with Framer Motion and Tailwind CSS. Free, open source, copy-paste or shadcn.",
  },
  tooltip: {
    title: "Animated Tooltip for React with Floating UI",
    description:
      "Composable React tooltip with collision-aware placement, optional arrow, hoverable content, keyboard focus reveal, touch support and cursor follow. Free source.",
  },
  "context-menu": {
    title: "Animated Context Menu for React (Right Click)",
    description:
      "React right-click and long-press menu that morphs open from the pointer, with checkbox and radio items, keyboard navigation and typeahead. Free source.",
  },
  popover: {
    title: "Animated Popover for React: Gooey and Morph",
    description:
      "Two React popovers: a gooey panel that oozes out of the trigger, and a morph panel that unfolds from its corner on a spring. Portalled, free source.",
  },
  "morphing-modal": {
    title: "Morphing Modal for React with Animated Height",
    description:
      "React modal that morphs its height between inner views with a blur cross-fade, in the style of the Family wallet. Free source, install with the shadcn CLI.",
  },
  "center-morph-modal": {
    title: "Animated Modal Dialog for React (Center Unfold)",
    description:
      "Composable React modal dialog that unfolds from its center toward every edge and folds back on close, with focus management. Free source, shadcn install.",
  },
  "text-animation": {
    title: "React Text Animations: Reveal, Shimmer, Scramble",
    description:
      "Five React text animations: spring word reveal, shimmer loading text, letter cascade, character scramble and a cycling color sweep. Free, open source.",
  },
  number: {
    title: "Animated Number Counter and Ticker for React",
    description:
      "React number animations: count-up on scroll, rolling slot-machine ticker and fixed-slot digit swaps. Framer Motion and Tailwind, free source, shadcn install.",
  },
  "animated-badge": {
    title: "Animated Status Badge Component for React",
    description:
      "React status badge with animated state icons, pulse feedback and compact sizes for live, success, warning and error states. Free source, shadcn install.",
  },
  "action-swap": {
    title: "Animated Button Text and Icon Swap for React",
    description:
      "React primitives that swap button labels and icons with blur, roll or letter cascade motion, for copy, save and send states. Free source, shadcn install.",
  },
  "animated-toast-stack": {
    title: "Animated Toast Notifications for React",
    description:
      "Stacked React toast notifications with status morphs, swipe to dismiss, actions and layout-aware motion. Tailwind styled, free source, shadcn install.",
  },
  "theme-toggle": {
    title: "Animated Theme Toggle for React (View Transitions)",
    description:
      "Dark mode toggle for React and Next.js that repaints the page with a circle, rectangle or blinds reveal through the View Transition API. Free source.",
  },
  "bouncy-accordion": {
    title: "Animated Accordion Component for React",
    description:
      "Single-open React accordion with a weighted spring layout, icon rows and reduced-motion-safe reveals. Tailwind styled, free source, install with shadcn.",
  },
  drawer: {
    title: "Animated Side Drawer for React and Tailwind",
    description:
      "React side drawer that springs in from the left or right with backdrop blur, scroll lock and Escape to close. Free, open source, copy-paste or shadcn install.",
  },
  "scroll-animation": {
    title: "React Scroll Animations: Smooth Scroll, Parallax",
    description:
      "React scroll animation kit: Lenis smooth scroll, reading progress bar, parallax, scroll to and reveal on scroll. Framer Motion, free source, shadcn install.",
  },
  "range-slider": {
    title: "React Range Slider: 6 Animated Slider Designs",
    description:
      "Six animated React range sliders: stepped ticks, inline label, fluid fill, wave bars, value bubble and ruler. Keyboard accessible, free source, shadcn install.",
  },
  "wheel-picker": {
    title: "React Wheel Picker: iOS Style Scroll Picker",
    description:
      "iOS-style React wheel picker with a 3D drum, momentum flicks, snapping, keyboard control and optional tick sound. Combine wheels for date and time pickers.",
  },
  table: {
    title: "React Data Table: Virtualized, Sortable, Editable",
    description:
      "Virtualized React data table that stays smooth at 10k+ rows, with sorting, selection, column resize and reorder, inline editing and async loading. Free source.",
  },
  "shader-background": {
    title: "React Shader Background: WebGL Mesh Gradients",
    description:
      "Animated WebGL shader backgrounds for React: mesh gradient, grain, warp, waves, voronoi, dithering and 15 more from one variant prop. Free, open source.",
  },
  "cylinder-carousel": {
    title: "3D Cylinder Carousel Component for React",
    description:
      "React 3D carousel whose items line the inside of a cylinder, with drag, scroll and arrow key control and a springy snap. Free source, install with shadcn.",
  },
  loader: {
    title: "React Loader: 17 Animated Loading Spinners",
    description:
      "Seventeen React loading spinners: dots, bars, dot matrix, dither, metaballs, helix, percent and terminal ASCII styles. One size prop, currentColor, free source.",
  },

  // Charts
  treemap: {
    title: "Animated React Treemap Chart Component",
    description:
      "React treemap chart with tiles that morph on data updates, nested hierarchies, tooltips, keyboard navigation and an accessible data table. Free source.",
  },
  "candlestick-chart": {
    title: "React Candlestick Chart for Live OHLC Data",
    description:
      "Animated React candlestick chart with volume bars, a live last-price line and a crosshair OHLC readout for real-time trading data. Free, open source.",
  },
  "donut-chart": {
    title: "Animated React Donut Chart Component",
    description:
      "React donut chart with rounded segments, a linked center readout, legend with share bars, keyboard focus and optional selection. Free source, shadcn install.",
  },
  "volume-profile": {
    title: "React Volume Profile Chart (Volume by Price)",
    description:
      "Animated volume profile chart for React with point of control, value area, tooltips and keyboard inspection for trading interfaces. Free, open source.",
  },
  "status-bar": {
    title: "React Uptime Status Bar Chart Component",
    description:
      "Animated uptime and status history bars for React status pages, with custom statuses, period tooltips and keyboard inspection. Free source, shadcn install.",
  },
  "composition-chart": {
    title: "React Stacked Bar and Area Chart (100% Stacked)",
    description:
      "Normalized stacked bar and area chart for React with period tooltips, series pinning, an interactive legend and keyboard inspection. Free, open source.",
  },
  "funnel-chart": {
    title: "Animated React Funnel Chart Component",
    description:
      "React funnel chart with curved stages in vertical or horizontal layouts, conversion and drop-off tooltips and animated numbers. Free source, shadcn install.",
  },
  "liquidity-heatmap": {
    title: "React Liquidity Heatmap Chart for Order Books",
    description:
      "Animated liquidity heatmap for React showing depth across price and time, with a price trace, tooltips and keyboard inspection. Free, open source.",
  },
  "bump-chart": {
    title: "React Bump Chart: Animated Ranking Chart",
    description:
      "Animated React bump chart for rankings over time, with curved paths, interactive rank dots, tooltips and series pinning. Free source, install with shadcn.",
  },
  "order-book": {
    title: "React Order Book Component with Depth Bars",
    description:
      "Animated React order book with bid and ask depth bars, spread, volume balance and average fill inspection for trading UIs. Free, open source, copy-paste.",
  },
  "heat-calendar": {
    title: "React Contribution Heatmap Calendar Component",
    description:
      "GitHub-style activity heatmap calendar for React with tooltips, range selection, a filterable legend and wave animations. Free source, install with shadcn.",
  },
  "returns-calendar": {
    title: "React Monthly Returns Calendar Heatmap",
    description:
      "Monthly returns calendar heatmap for React portfolios, with tooltips, year totals and compounded returns across a selected span. Free, open source.",
  },
  "price-target-fan": {
    title: "React Price Target Chart for Analyst Forecasts",
    description:
      "Analyst price target fan chart for React with dated price history, high, average and low targets, and a scrubbable tooltip. Free source, shadcn install.",
  },

  // AI agents
  "voice-orb": {
    title: "AI Voice Orb for React: Audio Reactive Sphere",
    description:
      "Animated AI voice orb for React: a liquid shader sphere that reacts to microphone or audio levels, with custom colors and reduced motion. Free source.",
  },
  "message-bubble": {
    title: "Chat Message Bubble Component for React",
    description:
      "React chat message bubbles for AI and messaging apps, with six styles, alignment, grouping, links and a collapsible long reply. Free source, shadcn install.",
  },
  message: {
    title: "React Chat Message Component for AI Apps",
    description:
      "Composable React chat message rows with bubbles, avatars, headers, typing indicators and a pop-in for new messages. Free source, install with shadcn.",
  },
  "message-scroller": {
    title: "Auto Scroll Chat Container for Streaming AI",
    description:
      "React chat scroll container that follows streamed AI output at the bottom and stops when the reader scrolls up, with an optional message rail. Free source.",
  },
  "prompt-input": {
    title: "AI Prompt Input Component for React Chat",
    description:
      "Auto-growing React chat input for AI apps with a model picker, actions menu, Enter to send and animated send and stop states. Free source, shadcn install.",
  },
  "todo-list": {
    title: "AI Agent Task List Component for React",
    description:
      "Collapsible React todo list for AI agent plans, with pending, in-progress and done states, morphing check marks and a progress count. Free source.",
  },
  "code-block": {
    title: "Streaming Code Block for React AI Chat",
    description:
      "Syntax-highlighted React code block that updates smoothly while AI streams code, with line numbers, highlighted lines and copy. Free source, shadcn install.",
  },
  "approval-card": {
    title: "Human in the Loop Approval UI for React Agents",
    description:
      "React approval card for AI agents: approve, reject or revise, plus single, multiple choice and multi-step questions. Free source, install with shadcn.",
  },
  "file-diff": {
    title: "React File Diff Viewer for AI Code Changes",
    description:
      "Syntax-highlighted React diff viewer that streams AI code edits line by line with live addition and deletion counts and copy. Free, open source.",
  },
  "tool-result": {
    title: "AI Tool Call Result Component for React",
    description:
      "React disclosure for AI tool calls with syntax-highlighted terminal output and API responses, success and error states, copy and retry. Free source.",
  },
  "streaming-response": {
    title: "Streaming AI Response Component for React",
    description:
      "React surface for streamed AI answers with copy, retry, feedback and an expandable source list once complete. Works with any renderer, free source.",
  },
  "image-generation": {
    title: "AI Image Generation Loading UI for React",
    description:
      "React AI image generation component with queued, generating, refining, complete and error states, no layout shift. Free source, install with shadcn.",
  },
  "tool-approval": {
    title: "AI Tool Permission Prompt for React Agents",
    description:
      "React permission card for AI agent tool calls: review parameters, then allow once, always allow or deny. Free, open source, copy-paste or shadcn install.",
  },
  citations: {
    title: "AI Citations and Sources Component for React",
    description:
      "Inline React citation links with a collapsible numbered source list and real favicons, for grounded AI answers. Free source, install with shadcn.",
  },
  "agent-activity": {
    title: "AI Agent Activity Feed for React",
    description:
      "React activity feed for AI agents showing reasoning, web searches, tool calls and traces in one stream that collapses when done. Free, open source.",
  },
  "loading-states": {
    title: "AI Loading States: Thinking Animations for React",
    description:
      "Three AI loading states for React: shimmering thinking text, live agent progress with a timer and cycling reasoning phrases. Free source, shadcn install.",
  },
  "ai-sidebar": {
    title: "AI Workspace Sidebar for React Chat Apps",
    description:
      "React sidebar for AI chat apps with folders, projects, files and bookmarks, drag to move, inline rename and keyboard control. Free, open source.",
  },
  "chat-app": {
    title: "React AI Chat App Template (shadcn)",
    description:
      "Complete React AI chat interface with sidebar, messages, streaming, planning, approvals, tool results, code, diffs and prompt input. Free source.",
  },

  // Blocks
  "infinite-masonry": {
    title: "React Masonry Grid with Infinite Scroll",
    description:
      "Virtualized React masonry layout with variable-height cards, responsive columns and infinite loading near the end. Free source, install with shadcn.",
  },
  "notification-stack": {
    title: "Stacked Notifications Component for React",
    description:
      "React notification stack that springs from a stacked summary into a readable list on hover, focus or tap. Framer Motion, free source, shadcn install.",
  },
  "project-folder": {
    title: "Animated Folder Component for React",
    description:
      "React project folder that fans out its files on hover, then expands into a focus-managed overlay and folds back on close. Free source, shadcn install.",
  },
  "card-folder": {
    title: "Animated Wallet Card Pocket for React",
    description:
      "React card folder where a card lifts out of a stitched pocket as the pocket compresses, with controlled open and detail states. Free, open source.",
  },
  "knockout-bracket": {
    title: "React Tournament Bracket and Fixtures Component",
    description:
      "Animated tournament bracket for React with round-by-round paging and a radial wheel layout, both from one rounds array. Free source, install with shadcn.",
  },
  "availability-scheduler": {
    title: "Weekly Availability Scheduler for React",
    description:
      "React weekly availability editor with per-day toggles, time ranges, a time dropdown and copy hours to other days. Free source, install with shadcn.",
  },
  swap: {
    title: "Crypto Swap Widget for React (Multi Chain)",
    description:
      "Animated cross-chain token swap widget for React with chain and token selectors, morphing views, a flip button and quote. Free, open source.",
  },
  "dynamic-island": {
    title: "Dynamic Island Component for React (iOS Style)",
    description:
      "iPhone-style Dynamic Island for React that morphs between live activity views with a bouncy resize and blur cross-fade. Free source, shadcn install.",
  },
  "command-palette": {
    title: "React Command Palette (Cmd K Menu)",
    description:
      "Cmd K command palette for React with fuzzy search, a spring-animated active row, keyboard navigation and a glass surface. Free source, shadcn install.",
  },
  "morphing-search": {
    title: "Animated Search Bar for React with Results",
    description:
      "Two React search bars: one morphs into a results panel, one docks as a pill with chips, recents and suggestions. Keyboard accessible, free source.",
  },
  "expandable-action-bar": {
    title: "Expandable Icon Action Bar for React",
    description:
      "React toolbar whose icon buttons expand into labeled controls on hover or focus with shared layout motion. Free, open source, copy-paste or shadcn.",
  },
  "overflow-actions": {
    title: "Overflow Actions Menu Button for React",
    description:
      "Connected React pill rail for primary actions that springs open to reveal more controls. Framer Motion and Tailwind, free source, shadcn install.",
  },
  "expandable-tabs": {
    title: "Expandable Icon Tabs for React",
    description:
      "React icon tab bar where the active tab expands into a labeled pill and the panel above morphs height between views. Free source, shadcn install.",
  },
  "morphing-tabs": {
    title: "Morphing Tabs Component for React",
    description:
      "Reorderable React tabs whose selected tab grows into its content surface, with a gliding active shape and shared morphs. Free, open source.",
  },
  "swipeable-list": {
    title: "React Swipeable List with Swipe Actions",
    description:
      "Mobile-style React list rows that swipe left or right to reveal action buttons like delete and archive. Touch and mouse, free source, shadcn install.",
  },
  "file-upload": {
    title: "React File Upload with Progress and Preview",
    description:
      "Two React file upload components: an attachment area with image previews and audio, and a progress queue with retry and remove. Free source.",
  },
  "prediction-market": {
    title: "Prediction Market UI Components for React",
    description:
      "React prediction market cards with outcome prices and probabilities, plus a buy and sell trade ticket with rolling amount entry. Free, open source.",
  },
  "wallet-card": {
    title: "Crypto Wallet Card Component for React",
    description:
      "React crypto wallet card with account switcher, search, animated balance, privacy toggle, copy address and send, swap and buy actions. Free source.",
  },
  "otp-input": {
    title: "Animated OTP Input for React (One Time Code)",
    description:
      "React OTP and verification code input with a gliding focus ring, rolling digits, error shake and success check. Paste support, free source, shadcn install.",
  },
  "signup-form": {
    title: "React Sign Up Form with Validation",
    description:
      "Animated React sign up form with on-blur validation, a password strength meter, password reveal and loading and success states. Free, open source.",
  },
  "bloom-menu": {
    title: "Animated Bloom Menu Button for React",
    description:
      "React button that morphs into a menu and blooms open from its center with radially staggered items. Framer Motion, free source, install with shadcn.",
  },
  "feedback-widget": {
    title: "Feedback Widget Component for React",
    description:
      "React feedback widget that morphs from a corner button into a form, with sending, success and retry states. Free source, install with the shadcn CLI.",
  },
  "not-found": {
    title: "Animated 404 Page Templates for React",
    description:
      "Five animated 404 pages for React and Next.js: glitch, magnetic digits, cursor spotlight, card stack and terminal. Free source, install with shadcn.",
  },
};

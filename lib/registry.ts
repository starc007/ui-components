export type ComponentExample = {
  slug: string;
  name: string;
  description?: string;
  /** Optional install slug for variants that have their own registry command. */
  installSlug?: string;
  /** Source file shown under Source tab. */
  file: string;
  /** Key into the previews registry (e.g. "motion/button-base"). */
  previewKey: string;
  /** Path to the preview file used for the Usage tab. */
  previewFile: string;
};

export type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  file: string;
  badge?: "new";
  /** ISO date the component shipped. Drives newest-first order in the landing
   * "Recently launched" section. Set it when adding a "new" component. */
  launchedAt?: string;
  /** Optional hand-tuned SEO keywords, merged on top of generated ones. */
  keywords?: string[];
  /** Extra source files bundled under this slug (e.g. multi-file components). */
  extraFiles?: string[];
  /** Per-variant breakdown rendered as separate Preview / Usage / Source on the page. */
  examples?: ComponentExample[];
};

export type CategoryEntry = {
  slug: string;
  name: string;
  description: string;
  components: ComponentEntry[];
};

export const registry: CategoryEntry[] = [
  {
    slug: "motion",
    name: "Components",
    description:
      "Free, open-source animated React components built with Motion and Tailwind CSS, available as copy-paste source through the shadcn registry.",
    components: [
      {
        slug: "tilt-card",
        name: "Tilt Card",
        description: "3D perspective tilt on hover with cursor-tracked glare.",
        file: "components/motion/tilt-card.tsx",
      },
      {
        slug: "button",
        name: "Button",
        description: "Spring-pressed Button plus StatefulButton (idle → loading → success / error) and MagneticButton.",
        file: "components/motion/button/index.tsx",
        extraFiles: [
          "components/motion/button/base.tsx",
          "components/motion/button/stateful.tsx",
          "components/motion/button/magnetic.tsx",
        ],
        examples: [
          {
            slug: "base",
            name: "Button",
            description: "Press scale, hover lift, variants and sizes.",
            installSlug: "button-base",
            file: "components/motion/button/base.tsx",
            previewKey: "motion/button-base",
            previewFile: "components/previews/motion/button-base.preview.tsx",
          },
          {
            slug: "stateful",
            name: "Stateful Button",
            description: "Idle → loading → success / error with blur-swap slots and morphing width.",
            installSlug: "button-stateful",
            file: "components/motion/button/stateful.tsx",
            previewKey: "motion/button-stateful",
            previewFile: "components/previews/motion/button-stateful.preview.tsx",
          },
          {
            slug: "magnetic",
            name: "Magnetic Button",
            description: "Button composed with the Magnetic wrapper for cursor-attracted pull.",
            installSlug: "button-magnetic",
            file: "components/motion/button/magnetic.tsx",
            previewKey: "motion/button-magnetic",
            previewFile: "components/previews/motion/button-magnetic.preview.tsx",
          },
        ],
      },
      {
        slug: "expanding-arrow-button",
        name: "Animated CTA Buttons",
        description:
          "Expressive call-to-action buttons with expanding, hold, and slide interactions.",
        file: "components/motion/expanding-arrow-button.tsx",
        extraFiles: [
          "components/motion/hold-action-button.tsx",
          "components/motion/slide-action-button.tsx",
        ],
        badge: "new",
        launchedAt: "2026-07-16",
        examples: [
          {
            slug: "expanding-arrow",
            name: "Expanding Arrow Button",
            description:
              "An accent tile that expands into a dotted-arrow trail on hover or focus.",
            file: "components/motion/expanding-arrow-button.tsx",
            previewKey: "motion/expanding-arrow-button",
            previewFile:
              "components/previews/motion/expanding-arrow-button.preview.tsx",
          },
          {
            slug: "hold-action",
            name: "Hold Action Button",
            description:
              "Hold to complete with a vertical or horizontal liquid fill; release early to cancel.",
            installSlug: "hold-action-button",
            file: "components/motion/hold-action-button.tsx",
            previewKey: "motion/hold-action-button",
            previewFile:
              "components/previews/motion/hold-action-button.preview.tsx",
          },
          {
            slug: "slide-action",
            name: "Slide Action Button",
            description:
              "Drag the thumb to the end to confirm an action; release early to spring back.",
            installSlug: "slide-action-button",
            file: "components/motion/slide-action-button.tsx",
            previewKey: "motion/slide-action-button",
            previewFile:
              "components/previews/motion/slide-action-button.preview.tsx",
          },
        ],
      },
      {
        slug: "marquee",
        name: "Marquee",
        description: "Infinite horizontal or vertical scroll with pause-on-hover.",
        file: "components/motion/marquee.tsx",
      },
      {
        slug: "tabs",
        name: "Tabs",
        description: "Pill, segment or underline tabs with a spring layoutId indicator.",
        file: "components/motion/tabs.tsx",
      },
      {
        slug: "switch",
        name: "Switch",
        description: "Toggle with a spring-driven thumb and press feedback.",
        file: "components/motion/switch.tsx",
      },
      {
        slug: "input",
        name: "Input",
        description: "Text input with label, left/right icons, error shake and success check draw.",
        file: "components/motion/input.tsx",
        keywords: [
          "react animated input",
          "input error shake",
          "floating label input",
          "react form input animation",
          "animated text field",
        ],
      },
      {
        slug: "select",
        name: "Select",
        description: "Composable select primitives whose panel bouncily unfolds out of the trigger and separates, plus a Morph variant where the trigger grows into the panel via shared layout.",
        file: "components/motion/select.tsx",
        badge: "new",
        launchedAt: "2026-06-28",
        examples: [
          {
            slug: "default",
            name: "Select",
            description: "Composable primitives (Select, SelectTrigger, SelectValue, SelectContent, SelectItem); the panel pinches off the trigger and separates, with staggered items. Position-aware (opens upward when needed).",
            installSlug: "select",
            file: "components/motion/select.tsx",
            previewKey: "motion/select",
            previewFile: "components/previews/motion/select.preview.tsx",
          },
          {
            slug: "morph",
            name: "Morph Select",
            description: "Composable primitives (MorphSelect, MorphSelectTrigger, MorphSelectValue, MorphSelectContent, MorphSelectItem) where the trigger morphs into the panel via a shared layoutId — one continuous surface that grows open and shrinks back, never detaching.",
            installSlug: "select-morph",
            file: "components/motion/select-morph.tsx",
            previewKey: "motion/select-morph",
            previewFile: "components/previews/motion/select-morph.preview.tsx",
          },
        ],
      },
      {
        slug: "checkbox",
        name: "Checkbox",
        description:
          "Form choice control with a draw-on checkmark, spring press feedback and indeterminate state support.",
        file: "components/motion/checkbox.tsx",
        badge: "new",
        launchedAt: "2026-06-23",
      },
      {
        slug: "radio",
        name: "Radio Group",
        description:
          "Single-select choice control with a gliding layoutId indicator dot and spring press feedback.",
        file: "components/motion/radio.tsx",
        badge: "new",
        launchedAt: "2026-06-23",
      },
      {
        slug: "bottom-sheet",
        name: "Bottom Sheet",
        description: "Vaul-inspired draggable bottom sheet with snap points, inertia and glass surface.",
        file: "components/motion/bottom-sheet.tsx",
      },
      {
        slug: "pull-to-refresh",
        name: "Pull to Refresh",
        description:
          "Native-feeling pull-to-refresh container with drag resistance, threshold feedback and async refresh handling.",
        file: "components/motion/pull-to-refresh.tsx",
        badge: "new",
        launchedAt: "2026-07-17",
        keywords: [
          "pull to refresh react",
          "swipe to refresh",
          "mobile refresh gesture",
          "touch refresh component",
          "overscroll refresh",
        ],
      },
      {
        slug: "shared-layout-bg",
        name: "Shared Layout Background",
        description: "A pill that glides between hovered items via motion's shared layout, with blur enter/exit.",
        file: "components/motion/shared-layout-bg.tsx",
      },
      {
        slug: "bounce-sidebar",
        name: "Bounce Sidebar",
        description:
          "A vertical sidebar whose active dot jumps between destinations on a curved, spring-loaded path.",
        file: "components/motion/bounce-sidebar.tsx",
        badge: "new",
        launchedAt: "2026-07-22",
        keywords: [
          "animated sidebar react",
          "bounce sidebar",
          "sidebar navigation",
          "spring navigation indicator",
          "curved motion path",
          "active navigation dot",
        ],
      },
      {
        slug: "preview-rail",
        name: "Preview Rail",
        description: "Codex app-inspired navigation rail with compact ticks that form a hover pyramid and reveal a floating destination preview.",
        file: "components/motion/preview-rail.tsx",
        badge: "new",
        launchedAt: "2026-07-11",
        keywords: [
          "codex app navigation",
          "codex style navigation",
          "openai codex navigation",
          "codex navigation react",
          "preview rail",
          "navigation rail",
          "hover navigation",
          "navigation preview",
          "vertical navigation react",
          "horizontal navigation react",
        ],
      },
      {
        slug: "dock",
        name: "Dock",
        description: "macOS-style dock with grouped actions and a gliding active pill.",
        file: "components/motion/dock.tsx",
      },
      {
        slug: "tooltip",
        name: "Tooltip",
        description: "Hover or focus tooltip with blur enter/exit and spring spawn.",
        file: "components/motion/tooltip.tsx",
      },
      {
        slug: "popover",
        name: "Popover",
        description:
          "Gooey popover whose panel oozes out of the trigger through an SVG goo filter — a liquid neck that stretches and pinches — with crisp content fading in on top, plus a Morph variant that clip-morphs open from the trigger corner. Click or hover trigger, controlled or uncontrolled.",
        file: "components/motion/popover.tsx",
        badge: "new",
        launchedAt: "2026-07-07",
        keywords: [
          "react popover",
          "gooey popover",
          "animated popover",
          "svg goo filter",
          "metaball popover",
          "hover popover react",
          "morph popover react",
          "dropdown menu react",
        ],
        examples: [
          {
            slug: "gooey",
            name: "Gooey Popover",
            description:
              "Composable Popover, PopoverTrigger, PopoverContent; the panel oozes out of the trigger through an SVG goo filter with a liquid neck, crisp content fading in on top. Click or hover, controlled or uncontrolled.",
            installSlug: "popover",
            file: "components/motion/popover.tsx",
            previewKey: "motion/popover",
            previewFile: "components/previews/motion/popover.preview.tsx",
          },
          {
            slug: "morph",
            name: "Morph Popover",
            description:
              "Composable MorphPopover, MorphPopoverTrigger, MorphPopoverContent; the panel is laid out full size but clipped to the corner nearest the trigger, then unclips as one piece — a single-surface morph with a drop-shadow that hugs the shape. Side/align aware, controlled or uncontrolled.",
            installSlug: "popover-morph",
            file: "components/motion/popover-morph.tsx",
            previewKey: "motion/popover-morph",
            previewFile: "components/previews/motion/popover-morph.preview.tsx",
          },
        ],
      },
      {
        slug: "morphing-modal",
        name: "Morphing Modal",
        description: "Family-app-style modal. A single panel that morphs its height as you navigate between inner views, with blur cross-fade on content.",
        file: "components/motion/morphing-modal.tsx",
      },
      {
        slug: "center-morph-modal",
        name: "Center Morph Modal",
        description:
          "A composable modal whose full-size surface unfolds from its exact center toward every edge, then folds back the same way with an inset close control.",
        file: "components/motion/center-morph-modal.tsx",
        badge: "new",
        launchedAt: "2026-07-21",
        keywords: [
          "react morph modal",
          "center expanding modal",
          "animated modal react",
          "framer motion modal",
          "radial modal animation",
        ],
      },
      {
        slug: "text-animation",
        name: "Text Animation",
        description: "Animated text primitives for reveal sequences, shimmer loading states and letter-cascade swaps.",
        file: "components/motion/text-reveal.tsx",
        extraFiles: [
          "components/motion/text-shimmer.tsx",
          "components/motion/text-cascade.tsx",
        ],
        examples: [
          {
            slug: "reveal",
            name: "Text Reveal",
            description: "Word or character reveal with spring slide-up and blur.",
            installSlug: "text-reveal",
            file: "components/motion/text-reveal.tsx",
            previewKey: "motion/text-reveal",
            previewFile: "components/previews/motion/text-reveal.preview.tsx",
          },
          {
            slug: "shimmer",
            name: "Text Shimmer",
            description: "Gradient sweep across text for loading or emphasis.",
            installSlug: "text-shimmer",
            file: "components/motion/text-shimmer.tsx",
            previewKey: "motion/text-shimmer",
            previewFile: "components/previews/motion/text-shimmer.preview.tsx",
          },
          {
            slug: "cascade",
            name: "Text Cascade",
            description: "Letter-by-letter slot roll for standalone text — old letters drop away as new ones land, left to right.",
            installSlug: "text-cascade",
            file: "components/motion/text-cascade.tsx",
            previewKey: "motion/text-cascade",
            previewFile: "components/previews/motion/text-cascade.preview.tsx",
          },
        ],
      },
      {
        slug: "number",
        name: "Number Animation",
        description: "Animated number primitives for count-up values and rolling digit tickers.",
        file: "components/motion/animated-number.tsx",
        extraFiles: ["components/motion/number-ticker.tsx"],
        examples: [
          {
            slug: "ticker",
            name: "Number Ticker",
            description: "Slot-machine rolling digits with staggered entry.",
            installSlug: "number-ticker",
            file: "components/motion/number-ticker.tsx",
            previewKey: "motion/number-ticker",
            previewFile: "components/previews/motion/number-ticker.preview.tsx",
          },
          {
            slug: "animated",
            name: "Animated Number",
            description: "Spring-driven count-up triggered when in view.",
            installSlug: "animated-number",
            file: "components/motion/animated-number.tsx",
            previewKey: "motion/animated-number",
            previewFile: "components/previews/motion/animated-number.preview.tsx",
          },
        ],
      },
      {
        slug: "animated-badge",
        name: "Animated Badge",
        description: "Status badge with animated state icons, pulse feedback and compact size variants.",
        file: "components/motion/animated-badge.tsx",
      },
      {
        slug: "action-swap",
        name: "Action Swap",
        description: "CTA button and slot primitives for swapping text and icons with blur motion.",
        file: "components/motion/action-swap.tsx",
        examples: [
          {
            slug: "cascade",
            name: "Cascade",
            description: "Letter-by-letter slot roll — the old label's letters drop away as the new ones land, left to right.",
            installSlug: "action-swap-cascade",
            file: "components/motion/action-swap-cascade.tsx",
            previewKey: "motion/action-swap-cascade",
            previewFile: "components/previews/motion/action-swap-cascade.preview.tsx",
          },
          {
            slug: "blur",
            name: "Blur",
            description: "Copy-button style swap with blur, opacity and scale.",
            installSlug: "action-swap-blur",
            file: "components/motion/action-swap-blur.tsx",
            previewKey: "motion/action-swap-blur",
            previewFile: "components/previews/motion/action-swap-blur.preview.tsx",
          },
          {
            slug: "roll",
            name: "Roll",
            description: "The next text or icon rolls in from below with blur.",
            installSlug: "action-swap-roll",
            file: "components/motion/action-swap-roll.tsx",
            previewKey: "motion/action-swap-roll",
            previewFile: "components/previews/motion/action-swap-roll.preview.tsx",
          },
        ],
      },
      {
        slug: "animated-toast-stack",
        name: "Animated Toast Stack",
        description: "Stacked toasts with status morphs, swipe dismissal, actions and layout-aware motion.",
        file: "components/motion/animated-toast-stack.tsx",
      },
      {
        slug: "theme-toggle",
        name: "Theme Toggle",
        description: "Theme toggle button with a full-page rectangle clip-path reveal via the View Transition API.",
        file: "components/motion/theme-toggle.tsx",
      },
      {
        slug: "bouncy-accordion",
        name: "Bouncy Accordion",
        description: "Single-open accordion with weighted spring layout, icon rows and reduced-motion-safe content reveals.",
        file: "components/motion/bouncy-accordion.tsx",
      },
      {
        slug: "drawer",
        name: "Drawer",
        description: "Side panel that slides in from the left or right with a spring, backdrop blur, body scroll lock and esc-to-close.",
        file: "components/motion/drawer.tsx",
      },
      {
        slug: "scroll-animation",
        name: "Scroll Animation",
        description: "Scroll-driven motion: a Lenis smooth-scroll provider and a reading-progress indicator that reads from it.",
        file: "components/motion/smooth-scroll.tsx",
        extraFiles: [
          "components/motion/scroll-progress.tsx",
          "components/motion/parallax.tsx",
          "components/motion/scroll-to.tsx",
          "components/motion/scroll-reveal.tsx",
        ],
        keywords: [
          "smooth scroll",
          "lenis",
          "scroll progress",
          "reading progress",
          "momentum scroll",
          "scroll velocity",
        ],
        examples: [
          {
            slug: "smooth-scroll",
            name: "Smooth Scroll",
            description: "Smooth-scroll provider over Lenis with a useSmoothScroll hook exposing scroll offset, progress and velocity. Reduced-motion safe.",
            installSlug: "smooth-scroll",
            file: "components/motion/smooth-scroll.tsx",
            previewKey: "motion/smooth-scroll",
            previewFile: "components/previews/motion/smooth-scroll.preview.tsx",
          },
          {
            slug: "scroll-progress",
            name: "Scroll Progress",
            description: "Reading-progress indicator — fixed bar or circular ring — driven by scroll position via useSmoothScroll, with spring smoothing.",
            installSlug: "scroll-progress",
            file: "components/motion/scroll-progress.tsx",
            previewKey: "motion/scroll-progress",
            previewFile: "components/previews/motion/scroll-progress.preview.tsx",
          },
          {
            slug: "parallax",
            name: "Parallax",
            description: "Wrapper that drifts its children at a speed factor as they cross the viewport, on either axis. Reduced-motion safe.",
            installSlug: "parallax",
            file: "components/motion/parallax.tsx",
            previewKey: "motion/parallax",
            previewFile: "components/previews/motion/parallax.preview.tsx",
          },
          {
            slug: "scroll-to",
            name: "Scroll To",
            description: "Button that smooth-scrolls to a target (offset, selector or element) via the active SmoothScroll provider; reduced-motion jumps instantly.",
            installSlug: "scroll-to",
            file: "components/motion/scroll-to.tsx",
            previewKey: "motion/scroll-to",
            previewFile: "components/previews/motion/scroll-to.preview.tsx",
          },
          {
            slug: "scroll-reveal",
            name: "Scroll Reveal",
            description: "Reveals its children with a spring slide and blur as they enter the viewport, once or every time. Reduced-motion keeps a fade.",
            installSlug: "scroll-reveal",
            file: "components/motion/scroll-reveal.tsx",
            previewKey: "motion/scroll-reveal",
            previewFile: "components/previews/motion/scroll-reveal.preview.tsx",
          },
        ],
      },
      {
        slug: "range-slider",
        name: "Range Slider",
        description: "Range slider with tick dots and a bouncy vertical-bar thumb that glides between snapped steps; drag and keyboard control, reduced-motion safe.",
        file: "components/motion/range-slider.tsx",
        badge: "new",
        launchedAt: "2026-06-24",
        keywords: ["slider", "range slider", "range input", "stepped slider", "ticks"],
      },
      {
        slug: "wheel-picker",
        name: "Wheel Picker",
        description: "iOS-style picker wheel: a 3D drum on native momentum scroll that snaps to the nearest notch, with wheel, drag and keyboard control. Composes side by side for date and time pickers, reduced-motion safe.",
        file: "components/motion/wheel-picker.tsx",
        badge: "new",
        launchedAt: "2026-07-09",
        keywords: ["picker", "wheel picker", "ios picker", "drum picker", "spinner", "time picker", "date picker", "scroll picker"],
      },
      {
        slug: "table",
        name: "Table",
        description:
          "Virtualized data table that stays smooth at 10k+ rows, with sortable headers, row selection, column resize and reorder, and a sticky header. Minimal, reduced-motion-safe motion.",
        file: "components/motion/table/index.tsx",
        badge: "new",
        launchedAt: "2026-07-01",
        keywords: [
          "react data table",
          "virtualized table",
          "sortable table",
          "table row selection",
          "react table 10k rows",
          "editable table react",
        ],
        examples: [
          {
            slug: "data",
            name: "Data Table",
            description:
              "10k virtualized rows with sortable headers, row selection, column resize and reorder.",
            installSlug: "table",
            file: "components/motion/table/index.tsx",
            previewKey: "motion/table",
            previewFile: "components/previews/motion/table.preview.tsx",
          },
          {
            slug: "editable",
            name: "Editable Table",
            description:
              "Edit cells inline and insert or delete rows and columns via border handles; the table re-renders from the updated data and column defs.",
            installSlug: "table-editable",
            file: "components/motion/table/index.tsx",
            previewKey: "motion/table-editable",
            previewFile: "components/previews/motion/table-editable.preview.tsx",
          },
          {
            slug: "async",
            name: "Async Table",
            description:
              "Loads pages on demand — skeleton rows on first load, then infinite scroll via onEndReached as the virtualized list nears the bottom.",
            installSlug: "table-async",
            file: "components/motion/table/index.tsx",
            previewKey: "motion/table-async",
            previewFile: "components/previews/motion/table-async.preview.tsx",
          },
        ],
      },
      {
        slug: "shader-background",
        name: "Shader Background",
        description:
          "Canvas shader backgrounds (mesh gradient, grain, warp, waves, voronoi, dot orbit and more) with a single typed variant prop. Reduced-motion freezes animated variants.",
        file: "components/motion/shader-background.tsx",
        badge: "new",
        launchedAt: "2026-07-02",
        keywords: [
          "shader background react",
          "webgl background",
          "mesh gradient react",
          "animated background react",
          "canvas shader",
          "gradient background component",
        ],
      },
      {
        slug: "cylinder-carousel",
        name: "Cylinder Carousel",
        description:
          "A carousel whose items line the inside of a cylinder, receding into the center and growing toward the edges. Drag, scroll or arrow-key to roll it, with a springy glide and snap. Reduced-motion drops the glide.",
        file: "components/motion/cylinder-carousel.tsx",
        badge: "new",
        launchedAt: "2026-07-04",
        keywords: [
          "3d carousel react",
          "cylinder carousel",
          "coverflow react",
          "rolling carousel",
          "draggable carousel react",
        ],
      },
      {
        slug: "loader",
        name: "Loader",
        description:
          "Loading indicator with seventeen variants: spinner, dots, bars, dot-matrix, dither, morph, comet, scramble, metaballs, newton, helix, percent, and five terminal-style ascii spinners. Scales from one size prop, uses currentColor, and reduced-motion swaps every transform for a calm opacity pulse.",
        file: "components/motion/loader.tsx",
        badge: "new",
        launchedAt: "2026-07-04",
        keywords: [
          "loader react",
          "loading spinner",
          "dot matrix loader",
          "dithering loader",
          "loading indicator",
        ],
      },
    ],
  },
  {
    slug: "blocks",
    name: "Blocks",
    description:
      "Product-ready animated React UI blocks built with Motion and Tailwind CSS, available as customizable copy-paste source.",
    components: [
      {
        slug: "infinite-masonry",
        name: "Infinite Masonry",
        description:
          "Responsive virtualized masonry that measures variable-height cards and loads more data as the user nears the end.",
        file: "components/motion/infinite-masonry.tsx",
        badge: "new",
        launchedAt: "2026-07-15",
        keywords: [
          "react masonry",
          "infinite scroll masonry",
          "virtualized masonry",
          "masonry grid react",
          "infinite gallery",
        ],
      },
      {
        slug: "notification-stack",
        name: "Notification Stack",
        description:
          "Compact notification cards that spring from a stacked summary into a readable list on hover, focus or tap.",
        file: "components/motion/notification-stack.tsx",
        badge: "new",
        launchedAt: "2026-07-14",
        keywords: [
          "notification stack react",
          "hover notification cards",
          "animated notification list",
          "stacked cards react",
          "notification center component",
        ],
      },
      {
        slug: "knockout-bracket",
        name: "Knockout Bracket",
        description: "Google-style tournament bracket that pages one round at a time — the leftmost round stacks compactly while later rounds center between their feeder matches, with cards, elbow connectors, headers and container height animating to every new layout.",
        file: "components/motion/knockout-bracket.tsx",
        badge: "new",
        launchedAt: "2026-07-12",
        keywords: [
          "tournament bracket react",
          "knockout bracket component",
          "world cup bracket react",
          "single elimination bracket",
          "playoff bracket react",
          "sports bracket animation",
        ],
      },
      {
        slug: "availability-scheduler",
        name: "Availability Scheduler",
        description: "Weekly availability editor where each day springs between available and unavailable, time ranges add and remove with blur-slide motion, times pick from a scrollable dropdown, and a copy menu clones hours to other days.",
        file: "components/motion/availability-scheduler/index.tsx",
        badge: "new",
        launchedAt: "2026-07-10",
        keywords: [
          "availability scheduler react",
          "weekly hours picker react",
          "working hours component",
          "cal.com availability component",
          "time range picker react",
          "business hours editor",
        ],
      },
      {
        slug: "swap",
        name: "Multi-chain Swap",
        description: "Cross-chain swap widget with chain + token selectors, morphing views, animated flip and quote.",
        file: "components/motion/swap.tsx",
      },
      {
        slug: "dynamic-island",
        name: "Dynamic Island",
        description: "iOS-style island pill that morphs between live activity views with bouncy shell resize and blur crossfades.",
        file: "components/motion/dynamic-island.tsx",
      },
      {
        slug: "command-palette",
        name: "Command Palette",
        description: "⌘K palette with fuzzy filter, spring-animated active row and glass surface.",
        file: "components/motion/command-palette.tsx",
      },
      {
        slug: "expandable-action-bar",
        name: "Expandable Action Bar",
        description: "Compact icon actions that expand into labeled controls on hover or focus with shared layout motion.",
        file: "components/motion/expandable-action-bar.tsx",
      },
      {
        slug: "overflow-actions",
        name: "Overflow Actions",
        description: "Connected pill rail for primary actions that springs open to reveal extra controls.",
        file: "components/motion/overflow-actions.tsx",
      },
      {
        slug: "expandable-tabs",
        name: "Expandable Tabs",
        description: "Icon tab bar where the active tab expands to a labelled pill, with a panel above that morphs height and slides content direction-aware on switch.",
        file: "components/motion/expandable-tabs.tsx",
      },
      {
        slug: "swipeable-list",
        name: "Swipeable List",
        description: "Mobile-style list rows that swipe left or right to reveal contextual action buttons.",
        file: "components/motion/swipeable-list.tsx",
      },
      {
        slug: "file-upload",
        name: "File Upload",
        description: "Drag-and-drop upload queue with progress rows, retry/remove actions and reduced-motion-safe state changes.",
        file: "components/motion/file-upload.tsx",
      },
      {
        slug: "prediction-market",
        name: "Prediction Market",
        description: "Prediction market trade ticket with buy/sell modes, outcome prices, rolling amount entry, quick add chips and trade states.",
        file: "components/motion/prediction-market.tsx",
      },
      {
        slug: "wallet-card",
        name: "Wallet Card",
        description: "Wallet overview card with an account switcher and search that morph open from their triggers, a cascading balance with a live change pill and privacy toggle, copy-address, and Send / Deposit / Swap / Buy actions.",
        file: "components/motion/wallet-card/index.tsx",
        badge: "new",
        launchedAt: "2026-07-03",
        keywords: [
          "wallet card react",
          "web3 wallet component",
          "crypto balance component",
          "account switcher react",
          "chain switcher react",
        ],
      },
      {
        slug: "otp-input",
        name: "OTP Input",
        description: "One-time-code input with a gliding focus ring, digits that roll in per slot, error shake and a success check draw.",
        file: "components/motion/otp-input.tsx",
      },
      {
        slug: "bloom-menu",
        name: "Bloom Menu",
        description: "A button that morphs open into a menu and blooms iris-out from the center, the grid revealing in every direction with radially staggered items.",
        file: "components/motion/bloom-menu.tsx",
        badge: "new",
        launchedAt: "2026-06-26",
      },
      {
        slug: "feedback-widget",
        name: "Feedback Widget",
        description: "Corner trigger that morphs open into a feedback popup with message entry and animated sending, success and retry states.",
        file: "components/motion/feedback-widget.tsx",
        badge: "new",
        launchedAt: "2026-06-29",
        keywords: [
          "react feedback widget",
          "feedback popover react",
          "in-app feedback component",
          "feedback form animation",
          "react feedback button",
        ],
      },
      {
        slug: "not-found",
        name: "404 / Not Found",
        description: "Animated 404 pages in five styles: glitch scramble, magnetic digits, cursor spotlight, a fanning card stack and a typed terminal.",
        file: "components/motion/not-found/index.tsx",
        extraFiles: [
          "components/motion/not-found/shared.tsx",
          "components/motion/not-found/glitch.tsx",
          "components/motion/not-found/magnetic.tsx",
          "components/motion/not-found/spotlight.tsx",
          "components/motion/not-found/stacked.tsx",
          "components/motion/not-found/terminal.tsx",
        ],
        examples: [
          {
            slug: "glitch",
            name: "Glitch",
            description:
              "Digits scramble through random glyphs before resolving, with a chromatic split on hover.",
            installSlug: "not-found-glitch",
            file: "components/motion/not-found/glitch.tsx",
            previewKey: "blocks/not-found-glitch",
            previewFile: "components/previews/blocks/not-found-glitch.preview.tsx",
          },
          {
            slug: "magnetic",
            name: "Magnetic",
            description:
              "Each digit is cursor-attracted via the Magnetic wrapper and springs back on leave.",
            installSlug: "not-found-magnetic",
            file: "components/motion/not-found/magnetic.tsx",
            previewKey: "blocks/not-found-magnetic",
            previewFile: "components/previews/blocks/not-found-magnetic.preview.tsx",
          },
          {
            slug: "spotlight",
            name: "Spotlight",
            description:
              "A dark panel where a cursor-tracked spotlight reveals the bright code from a dim base.",
            installSlug: "not-found-spotlight",
            file: "components/motion/not-found/spotlight.tsx",
            previewKey: "blocks/not-found-spotlight",
            previewFile: "components/previews/blocks/not-found-spotlight.preview.tsx",
          },
          {
            slug: "stacked",
            name: "Stacked",
            description:
              "A code card over a hidden stack that fans out with a spring on hover.",
            installSlug: "not-found-stacked",
            file: "components/motion/not-found/stacked.tsx",
            previewKey: "blocks/not-found-stacked",
            previewFile: "components/previews/blocks/not-found-stacked.preview.tsx",
          },
          {
            slug: "terminal",
            name: "Terminal",
            description:
              "A terminal window that types a failed cd command and a 404 status, with a blinking caret.",
            installSlug: "not-found-terminal",
            file: "components/motion/not-found/terminal.tsx",
            previewKey: "blocks/not-found-terminal",
            previewFile: "components/previews/blocks/not-found-terminal.preview.tsx",
          },
        ],
      },
    ],
  },
];

export function findCategory(slug: string) {
  return registry.find((c) => c.slug === slug);
}

export function findComponent(categorySlug: string, slug: string) {
  return findCategory(categorySlug)?.components.find((c) => c.slug === slug);
}

export function allComponents() {
  return registry.flatMap((c) =>
    c.components.map((comp) => ({ ...comp, category: c }))
  );
}

/** Top-level components and total installable targets (counting variants). */
export const COMPONENT_COUNT = registry.reduce(
  (n, c) => n + c.components.length,
  0,
);

export const INSTALLABLE_COUNT = registry.reduce(
  (n, c) =>
    n +
    c.components.reduce((m, comp) => {
      const variants = (comp.examples ?? []).filter((e) => e.installSlug).length;
      return m + (variants || 1);
    }, 0),
  0,
);

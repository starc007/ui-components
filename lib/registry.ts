import { type AgentGuide, agentGuides } from "@/lib/agent-guides";

export type ComponentExample = {
  slug: string;
  name: string;
  description?: string;
  badge?: "new";
  /** ISO date this variant shipped. */
  launchedAt?: string;
  /** Optional install slug for variants that have their own registry command. */
  installSlug?: string;
  /** Source file shown under Source tab. */
  file: string;
  /** Key into the previews registry (e.g. "motion/button-base"). */
  previewKey: string;
  /** Path to the preview file used for the Usage tab. */
  previewFile: string;
  /** Optional composition file shown instead of the live preview source. */
  usageFile?: string;
};

export type ComponentEntry = {
  slug: string;
  name: string;
  description: string;
  file: string;
  /** Optional contributor credit shown on the website only. */
  credit?: {
    name: string;
    url: string;
  };
  badge?: "new";
  /** ISO date the component shipped. Drives newest-first order in the landing
   * "Recently launched" section. Set it when adding a "new" component. */
  launchedAt?: string;
  /** Optional hand-tuned SEO keywords, merged on top of generated ones. */
  keywords?: string[];
  /** Extra source files bundled under this slug (e.g. multi-file components). */
  extraFiles?: string[];
  /** Optional composition file shown instead of the live preview source. */
  usageFile?: string;
  /** Per-variant breakdown rendered as separate Preview / Usage / Source on the page. */
  examples?: ComponentExample[];
  /** Optional behavior guide rendered on the component documentation page. */
  guide?: AgentGuide;
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
        description:
          "Spring-pressed Button plus StatefulButton, MagneticButton, and MetallicButton variants.",
        file: "components/motion/button/index.tsx",
        badge: "new",
        launchedAt: "2026-08-25",
        extraFiles: [
          "components/motion/button/base.tsx",
          "components/motion/button/stateful.tsx",
          "components/motion/button/magnetic.tsx",
          "components/motion/button/metallic.tsx",
        ],
        examples: [
          {
            slug: "metallic",
            name: "Metallic Button",
            description:
              "A neutral button surface framed by a pronounced chrome rim with a straight traveling reflection.",
            badge: "new",
            launchedAt: "2026-08-25",
            installSlug: "button-metallic",
            file: "components/motion/button/metallic.tsx",
            previewKey: "motion/button-metallic",
            previewFile: "components/previews/motion/button-metallic.preview.tsx",
          },
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
            installSlug: "expanding-arrow-button",
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
        slug: "expandable-control",
        name: "Expandable Control",
        description:
          "Click-to-expand button and chip controls that reveal a label or trailing action through spring layout continuity.",
        file: "components/motion/expandable-control.tsx",
        badge: "new",
        launchedAt: "2026-08-22",
        keywords: [
          "expandable button react",
          "animated chip react",
          "click to expand",
          "layout animation button",
          "reveal action control",
        ],
      },
      {
        slug: "adaptive-stepper",
        name: "Adaptive Stepper",
        description:
          "Composable numeric stepper whose fixed footprint adapts at its minimum and maximum while the value rolls between steps.",
        file: "components/motion/adaptive-stepper.tsx",
        badge: "new",
        launchedAt: "2026-08-31",
        keywords: [
          "react number stepper",
          "animated quantity selector",
          "adaptive counter",
          "increment decrement control",
          "compound stepper component",
          "number input animation",
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
        description:
          "Text input with label, left/right icons, optional stable error row, error shake and success check draw.",
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
        slug: "combobox",
        name: "Combobox",
        description:
          "Searchable combobox with a morphing portal, grouped filtering, keyboard navigation, and controlled or uncontrolled state.",
        file: "components/motion/combobox.tsx",
        badge: "new",
        launchedAt: "2026-08-11",
        guide: agentGuides.combobox,
        keywords: [
          "react combobox",
          "animated combobox",
          "searchable select react",
          "autocomplete component",
          "command menu select",
          "accessible listbox",
        ],
      },
      {
        slug: "multi-select",
        name: "Multi Select",
        description:
          "Composable multi-select primitives with searchable options, removable animated tokens, and a morphing collision-aware panel.",
        file: "components/motion/multi-select/index.tsx",
        badge: "new",
        launchedAt: "2026-08-29",
        extraFiles: [
          "components/motion/multi-select/context.tsx",
          "components/motion/multi-select/trigger.tsx",
          "components/motion/multi-select/content.tsx",
          "components/motion/multi-select/list.tsx",
        ],
        keywords: [
          "react multi select",
          "animated multi select",
          "searchable multi select",
          "tag picker react",
          "multiple combobox",
          "composable listbox",
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
        slug: "animated-sidebar",
        name: "Animated Sidebar",
        guide: agentGuides["animated-sidebar"],
        description:
          "A composable application sidebar with morphing nested navigation that folds into an animated icon rail on desktop and becomes a focus-managed sheet on mobile.",
        file: "components/motion/animated-sidebar.tsx",
        badge: "new",
        launchedAt: "2026-07-29",
        keywords: [
          "animated sidebar react",
          "mobile sidebar",
          "responsive sidebar",
          "collapsible sidebar",
          "icon sidebar",
          "sidebar drawer",
          "composable sidebar",
          "nested sidebar navigation",
          "accessible navigation menu",
        ],
      },
      {
        slug: "file-tree",
        name: "File Tree",
        description:
          "Composable file and folder primitives with springing branches, a gliding selection, and complete keyboard navigation.",
        file: "components/motion/file-tree.tsx",
        badge: "new",
        launchedAt: "2026-08-27",
        keywords: [
          "animated file tree react",
          "file explorer component",
          "folder tree",
          "project tree",
          "accessible tree view",
          "react tree component",
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
        slug: "context-menu",
        name: "Animated Context Menu",
        description:
          "Composable context-menu primitives with a pointer-origin clip morph, a gliding active row, checkbox and radio choices, keyboard navigation, typeahead, and long-press support.",
        file: "components/motion/context-menu.tsx",
        badge: "new",
        launchedAt: "2026-07-27",
        keywords: [
          "react context menu",
          "animated context menu",
          "right click menu",
          "context menu keyboard navigation",
          "long press menu react",
          "composable menu primitives",
        ],
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
        description:
          "Animated text primitives for spring reveals, chromatic sweeps, shimmer loading states, letter-cascade swaps and character scrambles.",
        file: "components/motion/text-reveal.tsx",
        badge: "new",
        launchedAt: "2026-07-25",
        extraFiles: [
          "components/motion/chromatic-text-reveal.tsx",
          "components/motion/text-shimmer.tsx",
          "components/motion/text-cascade.tsx",
          "components/motion/text-scramble.tsx",
        ],
        examples: [
          {
            slug: "text-scramble",
            name: "Text Scramble",
            description:
              "A controlled character scramble that resolves changed text while keeping its final value accessible.",
            badge: "new",
            launchedAt: "2026-08-14",
            installSlug: "text-scramble",
            file: "components/motion/text-scramble.tsx",
            previewKey: "motion/text-scramble",
            previewFile:
              "components/previews/motion/text-scramble.preview.tsx",
          },
          {
            slug: "chromatic-reveal",
            name: "Dia Text Animation",
            description:
              "A Dia-inspired text effect with a fixed sentence prefix and a cycling final word revealed by a colorful sweep.",
            badge: "new",
            launchedAt: "2026-07-25",
            installSlug: "chromatic-text-reveal",
            file: "components/motion/chromatic-text-reveal.tsx",
            previewKey: "motion/chromatic-text-reveal",
            previewFile:
              "components/previews/motion/chromatic-text-reveal.preview.tsx",
          },
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
        description: "Theme toggle button that repaints the whole page through the View Transition API — a rectangle or circle clip-path reveal, or slats that open across the screen like a shutter.",
        file: "components/motion/theme-toggle.tsx",
        badge: "new",
        launchedAt: "2026-08-01",
        keywords: [
          "theme toggle",
          "dark mode toggle",
          "view transition theme",
          "clip path theme reveal",
          "blinds transition",
        ],
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
        description: "Slider with tick dots and a vertical-bar thumb that bounces as it lands on each step. Drag or keyboard, reduced-motion safe.",
        file: "components/motion/range-slider.tsx",
        badge: "new",
        launchedAt: "2026-07-31",
        keywords: [
          "slider",
          "range slider",
          "range input",
          "stepped slider",
          "ticks",
          "volume slider",
          "ruler picker",
        ],
        examples: [
          {
            slug: "stepped",
            name: "Range Slider",
            description:
              "Tick dots, and a vertical-bar thumb that bounces as it lands on each step.",
            installSlug: "range-slider",
            file: "components/motion/range-slider.tsx",
            previewKey: "motion/range-slider",
            previewFile: "components/previews/motion/range-slider.preview.tsx",
          },
          {
            slug: "fluid",
            name: "Fluid Slider",
            description:
              "No thumb. The fill slides behind a rounded liquid cap, and the label flips color wherever the fill covers it.",
            installSlug: "range-slider-fluid",
            badge: "new",
            launchedAt: "2026-07-31",
            file: "components/motion/range-slider-fluid.tsx",
            previewKey: "motion/range-slider-fluid",
            previewFile: "components/previews/motion/range-slider-fluid.preview.tsx",
          },
          {
            slug: "wave",
            name: "Wave Slider",
            description:
              "Equalizer bars peak around the handle and drop back once it passes, so the value moves down the track as a wave.",
            installSlug: "range-slider-wave",
            badge: "new",
            launchedAt: "2026-07-31",
            file: "components/motion/range-slider-wave.tsx",
            previewKey: "motion/range-slider-wave",
            previewFile: "components/previews/motion/range-slider-wave.preview.tsx",
          },
          {
            slug: "bubble",
            name: "Bubble Slider",
            description:
              "Grab the thumb and a value bubble pops out of it. The bubble tilts and squashes with how fast you drag, then settles upright.",
            installSlug: "range-slider-bubble",
            badge: "new",
            launchedAt: "2026-07-31",
            file: "components/motion/range-slider-bubble.tsx",
            previewKey: "motion/range-slider-bubble",
            previewFile: "components/previews/motion/range-slider-bubble.preview.tsx",
          },
          {
            slug: "ruler",
            name: "Ruler Slider",
            description:
              "The needle stays put and the scale scrolls under it. A flick keeps going and settles on the nearest tick. Fractional steps read at the step's own precision.",
            installSlug: "range-slider-ruler",
            badge: "new",
            launchedAt: "2026-07-31",
            file: "components/motion/range-slider-ruler.tsx",
            previewKey: "motion/range-slider-ruler",
            previewFile: "components/previews/motion/range-slider-ruler.preview.tsx",
          },
        ],
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
    slug: "agents",
    name: "AI Agents",
    description:
      "Animated React components for agent reasoning, progress, tool activity, and conversational AI interfaces.",
    components: [
      {
        slug: "message-bubble",
        name: "Message Bubble",
        guide: agentGuides["message-bubble"],
        description:
          "A focused conversational surface with visual tones, independent alignment, grouped messages, expandable content, and interactive link or button support.",
        file: "components/agents/message-bubble.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "message bubble React",
          "chat bubble component",
          "AI conversation bubble",
          "expandable chat message",
          "interactive chat suggestion",
          "grouped message bubbles",
        ],
        examples: [
          {
            slug: "surfaces",
            name: "Animated Surfaces",
            description:
              "An interactive conversation where each newly sent user row pops up once while the assistant streams into a stable row.",
            file: "components/agents/message-bubble.tsx",
            previewKey: "agents/message-bubble",
            previewFile:
              "components/previews/agents/message-bubble.preview.tsx",
            usageFile:
              "components/previews/agents/message-bubble.usage.tsx",
          },
          {
            slug: "avatars",
            name: "With Avatars",
            description:
              "Progressively arriving messages with sender avatars, metadata, delivery state, and grouped follow-up alignment.",
            file: "components/agents/message-bubble.tsx",
            previewKey: "agents/message-bubble-avatars",
            previewFile:
              "components/previews/agents/message-bubble-avatars.preview.tsx",
          },
          {
            slug: "show-more",
            name: "Show More",
            description:
              "A long assistant message with a compact line-clamped preview and animated disclosure control.",
            file: "components/agents/message-bubble.tsx",
            previewKey: "agents/message-bubble-collapsible",
            previewFile:
              "components/previews/agents/message-bubble-collapsible.preview.tsx",
          },
        ],
      },
      {
        slug: "message",
        name: "Message",
        guide: agentGuides.message,
        description:
          "Composable conversation primitives for message rows, grouped bubbles, avatars, metadata, live markers, and a mount-only trailing-edge pop-up for newly sent rows.",
        file: "components/agents/message.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI message React",
          "chat message component",
          "streaming assistant message",
          "LLM conversation UI",
          "agent chat bubbles",
          "AI chat interface React",
        ],
        usageFile: "components/previews/agents/message.usage.tsx",
      },
      {
        slug: "message-scroller",
        name: "Message Scroller",
        guide: agentGuides["message-scroller"],
        description:
          "A reader-aware conversation viewport that follows streamed output at the live edge and releases control when the reader moves away.",
        file: "components/agents/message-scroller.tsx",
        usageFile:
          "components/previews/agents/message-scroller.usage.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "message scroller React",
          "AI chat autoscroll",
          "streaming conversation viewport",
          "follow output chat UI",
          "LLM message scroll",
          "accessible chat transcript",
        ],
      },
      {
        slug: "prompt-input",
        name: "Prompt Input",
        guide: agentGuides["prompt-input"],
        description:
          "An auto-growing agent composer with prompt actions, model selection, keyboard submission, and animated send and stop states.",
        file: "components/agents/prompt-input.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI prompt input React",
          "model selector dropdown",
          "chat composer component",
          "agent input UI",
          "AI textarea React",
          "LLM model picker",
        ],
      },
      {
        slug: "todo-list",
        name: "Todo List",
        guide: agentGuides["todo-list"],
        description:
          "A collapsible agent task plan with morphing status marks, a completion count, compact metadata, and smooth list updates.",
        file: "components/agents/todo-list.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI agent todo list React",
          "agent task progress UI",
          "LLM task plan component",
          "AI checklist React",
          "streaming todo list",
          "agent workflow status",
        ],
      },
      {
        slug: "code-block",
        name: "Code Block",
        guide: agentGuides["code-block"],
        description:
          "A syntax-highlighted code surface with stable streaming updates, line numbers, focused lines, smooth following, and copy feedback.",
        file: "components/agents/code-block.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI code block React",
          "streaming code component",
          "syntax highlighted code block",
          "LLM code response UI",
          "agent generated code",
          "Shiki React code block",
        ],
      },
      {
        slug: "approval-card",
        name: "Approval Card",
        guide: agentGuides["approval-card"],
        description:
          "A human-in-the-loop decision surface for approvals, single or multiple-choice questions, custom responses, and multi-step review flows.",
        file: "components/agents/approval-card/index.tsx",
        extraFiles: ["components/agents/approval-card/types.ts"],
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI approval card React",
          "human in the loop UI",
          "agent clarification question",
          "AI multiple choice prompt",
          "approve agent decision",
          "agent review workflow",
        ],
        examples: [
          {
            slug: "questions",
            name: "Questions",
            description:
              "Guides the user through single-choice, multiple-choice, and freeform questions before returning the completed response to the agent.",
            file: "components/agents/approval-card/index.tsx",
            previewKey: "agents/approval-card-question",
            previewFile:
              "components/previews/agents/approval-card-question.preview.tsx",
          },
          {
            slug: "review",
            name: "Review and Approve",
            description:
              "Pauses an agent workflow for approval, revision, or rejection and collapses into the recorded decision.",
            file: "components/agents/approval-card/index.tsx",
            previewKey: "agents/approval-card-review",
            previewFile:
              "components/previews/agents/approval-card-review.preview.tsx",
          },
        ],
      },
      {
        slug: "file-diff",
        name: "File Diff",
        guide: agentGuides["file-diff"],
        description:
          "A syntax-highlighted file change disclosure with progressive rows, line numbers, live change counts, smooth following, and completion collapse.",
        file: "components/agents/file-diff.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI file diff React",
          "agent code changes UI",
          "streaming diff component",
          "file edit result",
          "code additions deletions",
        ],
      },
      {
        slug: "tool-result",
        name: "Tool Result",
        guide: agentGuides["tool-result"],
        description:
          "A lightweight execution disclosure for syntax-highlighted terminal output and request responses that collapses into a compact completed state.",
        file: "components/agents/tool-result.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI tool result React",
          "agent terminal output UI",
          "streaming command result",
          "agent API response",
          "tool execution status",
        ],
        examples: [
          {
            slug: "terminal-output",
            name: "Terminal Output",
            description:
              "Streams command output into a bounded viewport, follows new lines, then collapses into the completed run summary.",
            file: "components/agents/tool-result.tsx",
            previewKey: "agents/tool-result-terminal",
            previewFile:
              "components/previews/agents/tool-result-terminal.preview.tsx",
          },
          {
            slug: "request-result",
            name: "Request Result",
            description:
              "Presents an in-flight request and its highlighted response payload with retry and copy actions.",
            file: "components/agents/tool-result.tsx",
            previewKey: "agents/tool-result-request",
            previewFile:
              "components/previews/agents/tool-result-request.preview.tsx",
          },
        ],
      },
      {
        slug: "streaming-response",
        name: "Streaming Response",
        guide: agentGuides["streaming-response"],
        description:
          "A stable response surface with completion actions, rendered content, and an expandable source summary.",
        file: "components/agents/streaming-response.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI streaming response React",
          "LLM token stream UI",
          "chat response actions",
          "AI response sources",
          "AI answer component",
          "streaming text React",
        ],
      },
      {
        slug: "image-generation",
        name: "Image Generation",
        guide: agentGuides["image-generation"],
        description:
          "A stable generated-image surface that moves from queued work through progressive refinement to a completed result without layout shift.",
        file: "components/agents/image-generation.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI image generation React",
          "generated image loading UI",
          "AI image progress component",
          "image generation animation",
          "text to image interface",
          "AI media result",
        ],
      },
      {
        slug: "tool-approval",
        name: "Tool Approval",
        guide: agentGuides["tool-approval"],
        description:
          "A human-in-the-loop permission card for reviewing tool details, allowing once, remembering access, or denying execution.",
        file: "components/agents/tool-approval.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI tool approval UI",
          "agent permission component",
          "human in the loop React",
          "approve agent action",
          "AI tool confirmation",
        ],
      },
      {
        slug: "citations",
        name: "Citations",
        guide: agentGuides.citations,
        description:
          "Inline citation markers paired with a collapsible, progressively rendered reference collection for grounded agent responses.",
        file: "components/agents/citations.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI citations React",
          "LLM citations component",
          "chat citation list",
          "RAG citation UI",
          "AI grounded response",
        ],
      },
      {
        slug: "agent-activity",
        name: "Agent Activity",
        guide: agentGuides["agent-activity"],
        description:
          "One adaptive activity stream for reasoning, searches, tool calls, structured execution traces, or a chronological mix.",
        file: "components/agents/agent-activity/index.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI agent activity component",
          "agent tool calls UI",
          "AI search results React",
          "agent reasoning timeline",
          "mixed agent activity stream",
          "agent execution trace UI",
          "collapsible AI activity",
        ],
        examples: [
          {
            slug: "streaming-text",
            name: "Streaming Text",
            description:
              "Streams freeform reasoning text into the capped viewport and keeps the completed log available behind a timed disclosure.",
            file: "components/agents/agent-activity/index.tsx",
            previewKey: "agents/agent-activity-text",
            previewFile:
              "components/previews/agents/agent-activity-text.preview.tsx",
          },
          {
            slug: "reasoning-steps",
            name: "Reasoning Steps",
            description:
              "Shows completed, active, and pending reasoning steps with optional trailing metadata.",
            file: "components/agents/agent-activity/index.tsx",
            previewKey: "agents/agent-activity-steps",
            previewFile:
              "components/previews/agents/agent-activity-steps.preview.tsx",
          },
          {
            slug: "web-search",
            name: "Web Search",
            description:
              "Presents a search query, progressively rendered result rows, and an overflow count.",
            file: "components/agents/agent-activity/index.tsx",
            previewKey: "agents/agent-activity-search",
            previewFile:
              "components/previews/agents/agent-activity-search.preview.tsx",
          },
          {
            slug: "tool-calls",
            name: "Tool Calls",
            description:
              "Summarizes read, edit, and run events with monospace targets and optional line-change counts.",
            file: "components/agents/agent-activity/index.tsx",
            previewKey: "agents/agent-activity-tools",
            previewFile:
              "components/previews/agents/agent-activity-tools.preview.tsx",
          },
          {
            slug: "mixed-activity",
            name: "Mixed Activity",
            description:
              "Streams reasoning, search, and tool events in one chronological run while the viewport smoothly follows new work.",
            file: "components/agents/agent-activity/index.tsx",
            previewKey: "agents/agent-activity-mixed",
            previewFile:
              "components/previews/agents/agent-activity.preview.tsx",
          },
          {
            slug: "agent-trace",
            name: "Agent Trace",
            description:
              "Streams messages and structured actions into a compact execution ledger, then summarizes the completed run by tool-call and message counts.",
            file: "components/agents/agent-activity/index.tsx",
            previewKey: "agents/agent-trace",
            previewFile: "components/previews/agents/agent-trace.preview.tsx",
          },
        ],
      },
      {
        slug: "loading-states",
        name: "Agent Loading States",
        guide: agentGuides["loading-states"],
        description:
          "Three thoughtful loading states for AI interfaces: shimmering status text, live agent progress, and cycling reasoning phrases.",
        file: "components/agents/loading-states/index.ts",
        extraFiles: [
          "components/agents/loading-states/thinking-shimmer.tsx",
          "components/agents/loading-states/agent-progress.tsx",
          "components/agents/loading-states/reasoning-text.tsx",
        ],
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI agent loading state",
          "agent thinking animation",
          "Claude thinking animation",
          "AI reasoning indicator",
          "LLM loading component",
          "chatbot thinking indicator",
        ],
        examples: [
          {
            slug: "reasoning-text",
            name: "Reasoning Text",
            description:
              "Shimmering reasoning copy with an ASCII loader and cascade, phrase-swap, or per-letter scramble transitions.",
            badge: "new",
            launchedAt: "2026-08-03",
            installSlug: "reasoning-text",
            file: "components/agents/loading-states/reasoning-text.tsx",
            previewKey: "agents/reasoning-text",
            previewFile:
              "components/previews/agents/reasoning-text.preview.tsx",
          },
          {
            slug: "thinking-shimmer",
            name: "Thinking Shimmer",
            description:
              "A quiet shimmer that keeps the agent's current status readable while work continues.",
            badge: "new",
            launchedAt: "2026-08-03",
            installSlug: "thinking-shimmer",
            file: "components/agents/loading-states/thinking-shimmer.tsx",
            previewKey: "agents/thinking-shimmer",
            previewFile:
              "components/previews/agents/thinking-shimmer.preview.tsx",
          },
          {
            slug: "agent-progress",
            name: "Agent Progress",
            description:
              "A compact activity glyph, action verb, and live tabular timer for longer-running agent work.",
            badge: "new",
            launchedAt: "2026-08-03",
            installSlug: "agent-progress",
            file: "components/agents/loading-states/agent-progress.tsx",
            previewKey: "agents/agent-progress",
            previewFile:
              "components/previews/agents/agent-progress.preview.tsx",
          },
        ],
      },
      {
        slug: "ai-sidebar",
        name: "AI Sidebar",
        guide: agentGuides["ai-sidebar"],
        description:
          "A collapsible AI workspace sidebar for folders, projects, files, and bookmarks with keyboard navigation, optimistic moves, inline rename, and overflow-aware labels.",
        file: "components/agents/ai-sidebar.tsx",
        usageFile: "components/previews/agents/ai-sidebar.usage.tsx",
        badge: "new",
        launchedAt: "2026-08-03",
        keywords: [
          "AI sidebar React",
          "agent workspace sidebar",
          "draggable resource tree",
          "project file sidebar",
          "collapsible AI navigation",
          "folder tree React",
        ],
      },
      {
        slug: "chat-app",
        name: "Chat App",
        description:
          "A complete agent conversation workspace composing navigation, messages, streaming, planning, approvals, tools, code, diffs, generated media, sources, and prompt input.",
        file: "components/agents/chat-app.tsx",
        usageFile:
          "components/previews/agents/chat-app-usage.tsx",
        extraFiles: [
          "components/agents/agent-activity/index.tsx",
          "components/agents/ai-sidebar.tsx",
          "components/agents/approval-card/index.tsx",
          "components/agents/code-block.tsx",
          "components/agents/file-diff.tsx",
          "components/agents/image-generation.tsx",
          "components/agents/loading-states/thinking-shimmer.tsx",
          "components/agents/message.tsx",
          "components/agents/message-bubble.tsx",
          "components/agents/message-scroller.tsx",
          "components/agents/prompt-input.tsx",
          "components/agents/streaming-response.tsx",
          "components/agents/todo-list.tsx",
          "components/agents/tool-approval.tsx",
          "components/agents/tool-result.tsx",
        ],
        launchedAt: "2026-08-03",
        keywords: [
          "AI chat app React",
          "agent workspace example",
          "complete AI chat interface",
          "AI SDK compatible chat UI",
          "agent conversation layout",
          "LLM chat app component",
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
        slug: "project-folder",
        name: "Project Folder",
        description:
          "An interactive project folder that opens its file fan on hover or focus, expands into a focus-managed overlay, then retraces the complete path when closed.",
        file: "components/motion/project-folder.tsx",
        badge: "new",
        launchedAt: "2026-08-15",
        keywords: [
          "react folder card",
          "animated project folder",
          "file preview component",
          "folder hover animation",
          "project card react",
        ],
      },
      {
        slug: "card-folder",
        name: "Card Folder",
        description:
          "A landscape card tucked into a rounded folder sleeve that opens on press and lifts the complete card into view, with controlled state and a separate overflow action.",
        file: "components/motion/card-folder.tsx",
        badge: "new",
        launchedAt: "2026-09-04",
        keywords: [
          "react card folder",
          "animated card sleeve",
          "payment card component",
          "credit card folder",
          "interactive wallet card",
        ],
      },
      {
        slug: "knockout-bracket",
        name: "Fixtures",
        description: "Animated tournament fixtures in two styles: a knockout bracket that pages through rounds, and a wheel that wraps the same tree around the champion. Both read the same array of rounds, so one dataset draws either.",
        file: "components/motion/knockout-bracket.tsx",
        badge: "new",
        launchedAt: "2026-07-27",
        extraFiles: ["components/motion/knockout-wheel.tsx"],
        examples: [
          {
            slug: "knockout-wheel",
            name: "Knockout Wheel",
            description:
              "The tournament drawn radially. The champion holds the hub, each round is a ring further out, and the teams themselves form the rim. Nodes spring in ring by ring, and hovering one isolates that team while the rest recede. Teams show a flag, a logo or their initials, and a deeper draw grows another ring.",
            badge: "new",
            launchedAt: "2026-07-27",
            installSlug: "knockout-wheel",
            file: "components/motion/knockout-wheel.tsx",
            previewKey: "blocks/knockout-wheel",
            previewFile: "components/previews/blocks/knockout-wheel.preview.tsx",
          },
          {
            slug: "knockout-bracket",
            name: "Knockout Bracket",
            description:
              "Pages one round at a time. The leftmost round stacks at a fixed rhythm, each later round centers between its two feeder matches, and cards, elbow connectors, headers and stage height animate into every new layout. A third place play-off sits below the tree under its own rule. Round names, team artwork, dates and result chips all come from the data you pass.",
            installSlug: "knockout-bracket",
            file: "components/motion/knockout-bracket.tsx",
            previewKey: "blocks/knockout-bracket",
            previewFile:
              "components/previews/blocks/knockout-bracket.preview.tsx",
          },
        ],
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
        slug: "morphing-search",
        name: "Morphing Search",
        description:
          "Search field or compact icon that morphs into a glass results surface, whether opened by click or keyboard shortcut.",
        file: "components/motion/morphing-search.tsx",
        badge: "new",
        launchedAt: "2026-08-18",
        keywords: [
          "morphing search react",
          "animated search component",
          "search overlay react",
          "keyboard search shortcut",
          "command search ui",
        ],
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
        slug: "morphing-tabs",
        name: "Morphing Tabs",
        description: "Reorderable tabs whose selected item grows into a white content surface, with the active shape gliding as tabs move and a shared morph between rooms.",
        file: "components/motion/morphing-tabs.tsx",
        badge: "new",
        launchedAt: "2026-08-06",
        keywords: [
          "reorderable tabs react",
          "drag tabs react",
          "morphing tabs component",
          "animated tab panel",
          "shared layout tabs",
        ],
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
        description:
          "Two file upload patterns: an attachment workspace for mixed files, links, audio and media, plus a progress queue with retry and removal.",
        file: "components/motion/file-upload.tsx",
        extraFiles: ["components/motion/attachment-upload.tsx"],
        badge: "new",
        launchedAt: "2026-07-30",
        examples: [
          {
            slug: "attachment-upload",
            name: "Attachment Upload",
            description:
              "A mixed attachment workspace with a dropzone, staggered file and image rows, animated upload, success, failure, retry and removal feedback, shared-layout image previews, and an audio waveform.",
            badge: "new",
            launchedAt: "2026-07-30",
            installSlug: "attachment-upload",
            file: "components/motion/attachment-upload.tsx",
            previewKey: "blocks/attachment-upload",
            previewFile:
              "components/previews/blocks/attachment-upload.preview.tsx",
          },
          {
            slug: "upload-queue",
            name: "Upload Queue",
            description:
              "A drag-and-drop upload queue with progress rows, upload states, retry, and removal.",
            installSlug: "file-upload",
            file: "components/motion/file-upload.tsx",
            previewKey: "blocks/file-upload",
            previewFile: "components/previews/blocks/file-upload.preview.tsx",
          },
        ],
        keywords: [
          "attachment upload react",
          "file attachment component",
          "mixed media upload",
          "audio attachment waveform",
          "drag and drop attachments",
        ],
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
        slug: "signup-form",
        name: "Sign Up Form",
        description: "Composed sign-up form that flags a field only once it is left, then clears the moment it is fixed, with a length-weighted strength meter, password reveal and an animated submit lifecycle.",
        file: "components/motion/signup-form.tsx",
        badge: "new",
        launchedAt: "2026-08-08",
        keywords: [
          "react signup form",
          "react registration form component",
          "animated form validation react",
          "password strength meter react",
          "tailwind sign up form",
        ],
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

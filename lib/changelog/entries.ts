import type { ChangelogEntry } from "@/lib/changelog/types";

/**
 * Public changelog, newest week first. Add a line for every user-facing
 * feat or fix: new components and variants, visible behavior changes,
 * accessibility and reduced-motion fixes. Leave out internal work.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    "date": "2026-10-26",
    "title": "Card Dealer fixes",
    "items": [
      {
        "type": "fixed",
        "text": "Card Dealer cards stay inside their table and no longer draw over a sticky page header when you scroll.",
        "component": "card-dealer"
      }
    ]
  },
  {
    "date": "2026-10-19",
    "title": "A public changelog",
    "items": [
      {
        "type": "new",
        "text": "Card Dealer lays out a deck, a fanned hand and a discard pile. Cards arc across the table and flip in flight, and hop over each other when you sort the hand.",
        "component": "card-dealer"
      },
      {
        "type": "new",
        "text": "Sankey Chart shows weighted flows between stages: bands draw in from left to right, morph when the data changes, and light up with everything a node or flow connects.",
        "component": "sankey-chart"
      },
      {
        "type": "new",
        "text": "Timeline lays dated events along a draggable track: the centered event grows while its neighbours dim, with tick dividers between cards and year numerals drifting behind.",
        "component": "timeline"
      },
      {
        "type": "new",
        "text": "This changelog lists each week's new components, improvements and fixes, with an RSS feed to follow along."
      },
      {
        "type": "fixed",
        "text": "Morph Popover moves focus into the panel when you open it with Enter or Space, so keyboard users land on its first control instead of tabbing through the page. A new initialFocus prop picks a different target.",
        "component": "popover"
      }
    ]
  },
  {
    "date": "2026-10-12",
    "title": "React Native components arrive",
    "summary": "beUI Native brings React Native versions of beUI components to the site, alongside two new charts and a broad keyboard and focus pass.",
    "items": [
      {
        "type": "new",
        "text": "React Native components now have their own pages, each with a showcase clip, an Expo Go QR code, CLI and manual install steps, and related native components.",
        "href": "/react-native"
      },
      {
        "type": "new",
        "text": "Component pages with a React Native version get a Web and React Native switch, and the sidebar can filter to native components.",
        "href": "/react-native"
      },
      {
        "type": "new",
        "text": "The AI agent components are now available for React Native, with a setup guide for adding beUI Native to an Expo project.",
        "href": "/docs/native-setup"
      },
      {
        "type": "new",
        "text": "Donut Chart shows shares as a round-capped ring with a sweep-in, a focused segment pop, a cross-fading center readout and keyboard-navigable legend rows.",
        "component": "donut-chart"
      },
      {
        "type": "new",
        "text": "Candlestick Chart renders OHLC data with volume bars, a springing last-price line and a pointer or keyboard crosshair with an OHLC readout.",
        "component": "candlestick-chart"
      },
      {
        "type": "improved",
        "text": "Order Book can inspect depth to a hovered or focused level, with an average-fill summary and optional price selection.",
        "component": "order-book"
      },
      {
        "type": "improved",
        "text": "Select now unfolds from the trigger on a single spring, staying anchored with rows that never scale.",
        "component": "select"
      },
      {
        "type": "improved",
        "text": "Tabs accept an icon per trigger, and can show icons only on the selected tab, springing them open as selection moves.",
        "component": "tabs"
      },
      {
        "type": "fixed",
        "text": "Closed keyboard and focus gaps: arrow keys in Select, Radio Group and Tabs, focus trapping in Drawer, Bottom Sheet, Morphing Modal and Bloom Menu, keyboard-openable Swipeable List rows, and a Shader Background that stays still under reduced motion."
      },
      {
        "type": "fixed",
        "text": "Morph popovers reveal without shifting or stretching their content, and popover exits play through even when content remounts.",
        "component": "popover"
      },
      {
        "type": "improved",
        "text": "Every component page now has a collapsible About section with use cases, accessibility notes and an FAQ."
      },
      {
        "type": "improved",
        "text": "Code blocks ship much lighter markup, so pages that bundle many source files load faster."
      }
    ]
  },
  {
    "date": "2026-10-05",
    "title": "Color Picker, Card and new charts",
    "items": [
      {
        "type": "new",
        "text": "Animated Alert adds composable inline feedback with five variants, dismissible exits and polite or urgent announcements.",
        "component": "alert"
      },
      {
        "type": "new",
        "text": "Animated Collapsible adds a composable disclosure with a spring reveal, custom triggers and controlled or uncontrolled state.",
        "component": "collapsible"
      },
      {
        "type": "new",
        "text": "Aspect Ratio adds a responsive frame and image that morph smoothly between ratios.",
        "component": "aspect-ratio"
      },
      {
        "type": "new",
        "text": "Treemap, Volume Profile and Status Bar charts join the charts collection, each with tooltips, keyboard inspection and an exact-data table.",
        "href": "/charts"
      },
      {
        "type": "new",
        "text": "Color Picker opens from a trigger chip that morphs into the saturation area, with hue and alpha sliders, a drag loupe, hex and channel inputs, presets and an eyedropper.",
        "component": "color-picker"
      },
      {
        "type": "new",
        "text": "Card is a composable card with header, action, content and footer parts, plus optional press feedback and a selected ring.",
        "component": "card"
      },
      {
        "type": "new",
        "text": "Morphing Search gains a Chip Search variant that turns search terms into removable chips and unfolds recents and suggestions from the bar.",
        "component": "morphing-search"
      },
      {
        "type": "improved",
        "text": "Tooltip was rebuilt as composable parts with arrow, alignment, delays and icon-only labels, and no longer sticks open after a click or shows two at once.",
        "component": "tooltip"
      },
      {
        "type": "improved",
        "text": "Radio Group, Checkbox and Approval Card options accept an optional description shown under the label."
      },
      {
        "type": "fixed",
        "text": "Upgraded to Framer Motion 12 to stop a one-frame flash at the end of fades, and overlays re-entering mid-exit now restore fully."
      }
    ]
  },
  {
    "date": "2026-09-28",
    "title": "Voice Orb, Arc Picker and more",
    "items": [
      {
        "type": "new",
        "text": "Voice Orb is a breathing liquid sphere whose silhouette reacts to a voice level or an audio analyser.",
        "component": "voice-orb"
      },
      {
        "type": "new",
        "text": "Arc Picker is a radial text picker that curves from any edge and selects as labels cross the center, with drag momentum and keyboard support.",
        "component": "arc-picker"
      },
      {
        "type": "new",
        "text": "Sortable List adds a composable reorderable list with drag handles, keyboard reordering, undo and position announcements.",
        "component": "sortable-stack"
      },
      {
        "type": "new",
        "text": "Image Viewer adds a composable morphing lightbox with smooth navigation between images.",
        "component": "image-viewer"
      },
      {
        "type": "new",
        "text": "Date Range Picker adds a composable range picker with inline and dropdown layouts, presets and full keyboard navigation, whose trigger morphs open.",
        "component": "date-range-picker"
      },
      {
        "type": "fixed",
        "text": "The gooey popover now hides its closed layer once the close animation settles.",
        "component": "popover"
      }
    ]
  },
  {
    "date": "2026-09-21",
    "title": "Composition charts and breadcrumbs",
    "items": [
      {
        "type": "new",
        "text": "Composition Chart shows normalized stacked bars or areas with a compact legend, series pinning and shared tooltips.",
        "component": "composition-chart"
      },
      {
        "type": "new",
        "text": "Animated Breadcrumb collapses long paths into an overflow dropdown, with matching slide and fade transitions.",
        "component": "breadcrumb"
      },
      {
        "type": "new",
        "text": "Animated Color Selector adds compact radio color swatches with a gliding selection ring.",
        "component": "color-selector"
      },
      {
        "type": "improved",
        "text": "Chart tooltips now move smoothly, stay inside the chart and animate in and out.",
        "href": "/charts"
      },
      {
        "type": "fixed",
        "text": "The morph popover no longer flashes when it opens.",
        "component": "popover"
      },
      {
        "type": "improved",
        "text": "The landing page and site styling were refreshed with clearer navigation and theme controls in the navbar.",
        "href": "/"
      }
    ]
  },
  {
    "date": "2026-09-14",
    "title": "Charts get their own home",
    "summary": "Data visualizations moved to a dedicated charts section, with five new charts in one week.",
    "items": [
      {
        "type": "new",
        "text": "Charts now have their own section, starting with composable Heat Calendar, Returns Calendar and Price Target Fan components.",
        "href": "/charts"
      },
      {
        "type": "new",
        "text": "Order Book adds an animated depth ladder that updates without moving its numbers.",
        "component": "order-book"
      },
      {
        "type": "new",
        "text": "Bump Chart animates ranking changes over time, with rank tooltips and series pinning.",
        "component": "bump-chart"
      },
      {
        "type": "new",
        "text": "Liquidity Heatmap shows price and time liquidity bands with animated intensity and keyboard inspection.",
        "component": "liquidity-heatmap"
      },
      {
        "type": "new",
        "text": "Funnel Chart draws connected curved stages in vertical or horizontal directions, with conversion and drop-off tooltips.",
        "component": "funnel-chart"
      },
      {
        "type": "improved",
        "text": "Tabs can show integrated overflow controls when there are more tabs than fit.",
        "component": "tabs"
      },
      {
        "type": "fixed",
        "text": "Approval Card hides step navigation when there is only one question.",
        "component": "approval-card"
      }
    ]
  },
  {
    "date": "2026-09-07",
    "title": "Inline Slider and market cards",
    "items": [
      {
        "type": "new",
        "text": "Range Slider gains an Inline Slider design that keeps its label and value inside the track.",
        "component": "range-slider"
      },
      {
        "type": "new",
        "text": "Prediction Market adds Market Cards with odds buttons, payout tooltips, volume sparklines and bookmarks.",
        "component": "prediction-market"
      },
      {
        "type": "improved",
        "text": "The base Range Slider handle and fill now match the inline design, without focus borders during pointer use.",
        "component": "range-slider"
      },
      {
        "type": "fixed",
        "text": "Title-only toasts now center their content.",
        "component": "animated-toast-stack"
      },
      {
        "type": "fixed",
        "text": "The tabs indicator no longer overshoots into a scrollbar jitter.",
        "component": "tabs"
      }
    ]
  },
  {
    "date": "2026-08-31",
    "title": "Adaptive Stepper and Card Folder",
    "items": [
      {
        "type": "new",
        "text": "Adaptive Stepper is a numeric stepper that grows its value into the space of an unavailable action at its bounds.",
        "component": "adaptive-stepper"
      },
      {
        "type": "new",
        "text": "Card Folder tucks a card into a stitched purse pocket that lifts forward as the purse compresses.",
        "component": "card-folder"
      },
      {
        "type": "new",
        "text": "Number Animation gains a Digit Swap variant.",
        "component": "number"
      }
    ]
  },
  {
    "date": "2026-08-24",
    "title": "File Tree and Multi Select",
    "items": [
      {
        "type": "new",
        "text": "Button gains a Metallic Button variant.",
        "component": "button"
      },
      {
        "type": "new",
        "text": "File Tree adds composable files and folders with springing branches, a gliding selection and full keyboard navigation.",
        "component": "file-tree"
      },
      {
        "type": "new",
        "text": "Multi Select adds searchable options, removable animated tokens and a morphing panel.",
        "component": "multi-select"
      },
      {
        "type": "fixed",
        "text": "Input validation messages no longer shift the surrounding layout.",
        "component": "input"
      },
      {
        "type": "fixed",
        "text": "Availability Scheduler keeps time ranges on the same calendar day.",
        "component": "availability-scheduler"
      }
    ]
  },
  {
    "date": "2026-08-17",
    "title": "Morphing Search and iOS fixes",
    "items": [
      {
        "type": "new",
        "text": "Morphing Search is a search field that morphs into a focus-managed results surface and back.",
        "component": "morphing-search"
      },
      {
        "type": "new",
        "text": "Expandable Control adds click-to-expand buttons and chips that reveal a label or trailing action.",
        "component": "expandable-control"
      },
      {
        "type": "fixed",
        "text": "Fixed touch, gesture and narrow-width issues on iOS Safari across the component set."
      },
      {
        "type": "fixed",
        "text": "Full-viewport overlays no longer trigger iOS 26 edge color sampling."
      },
      {
        "type": "fixed",
        "text": "Arrow keys in Combobox, Command Palette and Morphing Search now step from the right row when the list changes."
      },
      {
        "type": "fixed",
        "text": "Text Shimmer now stops under reduced motion, and cascade text no longer clips.",
        "component": "text-animation"
      },
      {
        "type": "improved",
        "text": "The motion guides were redesigned with better navigation and Markdown versions.",
        "href": "/docs/motion-patterns"
      }
    ]
  },
  {
    "date": "2026-08-10",
    "title": "Combobox and Project Folder",
    "items": [
      {
        "type": "new",
        "text": "Combobox adds searchable selection where the input is the trigger, with grouped filtering, keyboard navigation and a gliding active row.",
        "component": "combobox"
      },
      {
        "type": "new",
        "text": "Project Folder fans its files open on hover and morphs into a focus-managed overlay on click.",
        "component": "project-folder"
      },
      {
        "type": "new",
        "text": "Text Animation gains a Text Scramble variant that resolves changed text while keeping a stable accessible value.",
        "component": "text-animation"
      },
      {
        "type": "improved",
        "text": "Agent Activity accepts custom working and completed status renderers.",
        "component": "agent-activity"
      },
      {
        "type": "fixed",
        "text": "Bottom Sheet accessibility was improved.",
        "component": "bottom-sheet"
      },
      {
        "type": "fixed",
        "text": "The gooey popover trigger stays visible in Safari.",
        "component": "popover"
      },
      {
        "type": "new",
        "text": "A new guide covers using beUI with OpenUI.",
        "href": "/docs/openui"
      }
    ]
  },
  {
    "date": "2026-08-03",
    "title": "Agent Interfaces components launch",
    "summary": "A new category of AI and agent interface primitives, from messages and prompt input to approvals, tool results and citations.",
    "items": [
      {
        "type": "new",
        "text": "Agent Interfaces adds a full set of AI interface components, including Message, Message Scroller, Prompt Input, Todo List, Code Block, File Diff, Tool Result, Streaming Response, Image Generation and Citations.",
        "href": "/docs/ai-agents"
      },
      {
        "type": "new",
        "text": "Chat App combines navigation, messages, streaming, approvals, tool results and prompt input into one agent workspace shell.",
        "component": "chat-app"
      },
      {
        "type": "new",
        "text": "Agent Activity shows streaming text, reasoning, searches and tool calls, then collapses into a reopenable summary.",
        "component": "agent-activity"
      },
      {
        "type": "new",
        "text": "Approval Card and Tool Approval add human-in-the-loop decision and permission surfaces.",
        "component": "approval-card"
      },
      {
        "type": "new",
        "text": "Agent Loading States adds Thinking Shimmer, Agent Progress and Reasoning Text.",
        "component": "loading-states"
      },
      {
        "type": "new",
        "text": "Morphing Tabs adds liquid, spring-driven tabs that can be reordered by dragging.",
        "component": "morphing-tabs"
      },
      {
        "type": "new",
        "text": "Sign Up Form adds a composed sign-up flow with forgiving validation, a password strength meter and animated submit states.",
        "component": "signup-form"
      },
      {
        "type": "fixed",
        "text": "Command Palette scrolling stays contained inside the palette.",
        "component": "command-palette"
      }
    ]
  },
  {
    "date": "2026-07-27",
    "title": "Context Menu and Animated Sidebar",
    "items": [
      {
        "type": "new",
        "text": "Animated Context Menu opens from the pointer on right-click or long-press, with checkbox and radio items, keyboard navigation and typeahead.",
        "component": "context-menu"
      },
      {
        "type": "new",
        "text": "Animated Sidebar adds an application sidebar with icon or off-canvas collapse, nested menus and a mobile sheet.",
        "component": "animated-sidebar"
      },
      {
        "type": "new",
        "text": "File Upload gains an Attachment Upload variant with image previews, upload states, retry and an audio waveform.",
        "component": "file-upload"
      },
      {
        "type": "new",
        "text": "Fixtures gains a Knockout Wheel that draws the tournament radially with the champion at the hub.",
        "component": "knockout-bracket"
      },
      {
        "type": "improved",
        "text": "Knockout Bracket adds an optional third-place match, team logos or country flags, and optional match metadata.",
        "component": "knockout-bracket"
      },
      {
        "type": "new",
        "text": "Range Slider gains Fluid, Wave, Bubble and Ruler designs.",
        "component": "range-slider"
      },
      {
        "type": "new",
        "text": "Theme Toggle gains a blinds reveal.",
        "component": "theme-toggle"
      },
      {
        "type": "improved",
        "text": "Popover content now renders in a portal so it escapes clipping and stacking contexts.",
        "component": "popover"
      }
    ]
  },
  {
    "date": "2026-07-20",
    "title": "Center Morph Modal and Bounce Sidebar",
    "items": [
      {
        "type": "new",
        "text": "Center Morph Modal unfolds from its center toward every edge and folds back the same way.",
        "component": "center-morph-modal"
      },
      {
        "type": "new",
        "text": "Bounce Sidebar is vertical navigation whose active dot jumps between rows on a curved spring path.",
        "component": "bounce-sidebar"
      },
      {
        "type": "new",
        "text": "Text Animation gains a Dia Text Animation variant that cycles a final word with a chromatic sweep.",
        "component": "text-animation"
      },
      {
        "type": "improved",
        "text": "The morph popover now mirrors its opening animation on exit, and the gooey morph was refined.",
        "component": "popover"
      },
      {
        "type": "fixed",
        "text": "Stateful Button text no longer clips during state changes.",
        "component": "button"
      }
    ]
  },
  {
    "date": "2026-07-13",
    "title": "Masonry, notifications and CTA buttons",
    "items": [
      {
        "type": "new",
        "text": "Notification Stack springs compact cards from a stacked summary into a readable list.",
        "component": "notification-stack"
      },
      {
        "type": "new",
        "text": "Infinite Masonry adds a virtualized masonry grid with variable-height cards and infinite loading.",
        "component": "infinite-masonry"
      },
      {
        "type": "new",
        "text": "Pull to Refresh adds a native-feeling refresh container for touch and mouse.",
        "component": "pull-to-refresh"
      },
      {
        "type": "new",
        "text": "Animated CTA Buttons adds Expanding Arrow, Hold Action and Slide Action buttons.",
        "component": "expanding-arrow-button"
      },
      {
        "type": "improved",
        "text": "Wheel Picker can play an optional tick sound for each row crossed.",
        "component": "wheel-picker"
      },
      {
        "type": "improved",
        "text": "The Action Swap roll motion was refined.",
        "component": "action-swap"
      },
      {
        "type": "new",
        "text": "Every component page now has an AI-friendly Markdown version."
      }
    ]
  },
  {
    "date": "2026-07-06",
    "title": "Wheel Picker and Gooey Popover",
    "items": [
      {
        "type": "new",
        "text": "Popover adds a gooey variant whose panel oozes out of the trigger.",
        "component": "popover"
      },
      {
        "type": "new",
        "text": "Wheel Picker adds an iOS-style picker wheel with momentum, drag, wheel and keyboard input.",
        "component": "wheel-picker"
      },
      {
        "type": "new",
        "text": "Availability Scheduler adds a weekly availability editor with time ranges and copy-to-days.",
        "component": "availability-scheduler"
      },
      {
        "type": "new",
        "text": "Preview Rail adds navigation ticks that form a pyramid around the hovered item with a gliding preview card.",
        "component": "preview-rail"
      },
      {
        "type": "new",
        "text": "Fixtures launches with a Knockout Bracket that pages through a tournament one round at a time.",
        "component": "knockout-bracket"
      },
      {
        "type": "improved",
        "text": "Component pages now include an API reference."
      },
      {
        "type": "improved",
        "text": "The landing page was redesigned, with a Recently launched section ordered by ship date.",
        "href": "/"
      }
    ]
  },
  {
    "date": "2026-06-29",
    "title": "Table, Loader and Shader Background",
    "items": [
      {
        "type": "new",
        "text": "Input adds an animated text field with customization slots and the native caret.",
        "component": "input"
      },
      {
        "type": "new",
        "text": "Feedback Widget morphs a corner trigger into a feedback popup with animated sending, success and retry states.",
        "component": "feedback-widget"
      },
      {
        "type": "new",
        "text": "Table adds a virtualized table with data, editable and async variants, plus column resize and reorder.",
        "component": "table"
      },
      {
        "type": "new",
        "text": "Shader Background adds 21 shader variants.",
        "component": "shader-background"
      },
      {
        "type": "new",
        "text": "Wallet Card adds a wallet overview with a morphing account switcher, a cascading balance, a privacy toggle and quick actions.",
        "component": "wallet-card"
      },
      {
        "type": "new",
        "text": "Cylinder Carousel adds concave and convex 3D carousels.",
        "component": "cylinder-carousel"
      },
      {
        "type": "new",
        "text": "Loader adds a loading indicator with seventeen variants.",
        "component": "loader"
      },
      {
        "type": "fixed",
        "text": "Tab labels now switch contrast in sync with the indicator.",
        "component": "tabs"
      }
    ]
  },
  {
    "date": "2026-06-22",
    "title": "Scroll animations and an MCP server",
    "items": [
      {
        "type": "new",
        "text": "Scroll Animation adds Smooth Scroll, Scroll Progress, Parallax, Scroll To and Scroll Reveal.",
        "component": "scroll-animation"
      },
      {
        "type": "new",
        "text": "Range Slider adds a stepped slider with tick marks.",
        "component": "range-slider"
      },
      {
        "type": "new",
        "text": "Checkbox and Radio Group add animated choice controls with fully clickable rows.",
        "component": "checkbox"
      },
      {
        "type": "new",
        "text": "Drawer adds a side panel that springs in from the left or right with scroll lock and Escape to close.",
        "component": "drawer"
      },
      {
        "type": "new",
        "text": "Bloom Menu morphs a button open into a menu that blooms out from the center.",
        "component": "bloom-menu"
      },
      {
        "type": "new",
        "text": "Select gains a Morph Select variant where the trigger grows into the panel.",
        "component": "select"
      },
      {
        "type": "new",
        "text": "The beUI MCP server lets coding agents list, search and install components.",
        "href": "/docs/ai-agents"
      },
      {
        "type": "new",
        "text": "The motion playground lets you tune springs, tweens and staggers and copy the code.",
        "href": "/playground"
      },
      {
        "type": "improved",
        "text": "Every component can be installed manually without shadcn, and a theme guide covers setting up tokens.",
        "href": "/docs/theme"
      },
      {
        "type": "improved",
        "text": "Button gains an optional ripple, and Stateful Button no longer jitters while its width changes.",
        "component": "button"
      }
    ]
  },
  {
    "date": "2026-06-15",
    "title": "Theme Toggle, 404 pages and more blocks",
    "items": [
      {
        "type": "new",
        "text": "Swipeable List rows swipe left or right to reveal actions.",
        "component": "swipeable-list"
      },
      {
        "type": "new",
        "text": "Theme Toggle reveals the new theme across the page with rectangle and circle transitions.",
        "component": "theme-toggle"
      },
      {
        "type": "new",
        "text": "Bouncy Accordion adds a single-open accordion with connected spring motion.",
        "component": "bouncy-accordion"
      },
      {
        "type": "new",
        "text": "File Upload adds an upload queue with progress, retry and remove actions.",
        "component": "file-upload"
      },
      {
        "type": "new",
        "text": "Prediction Market adds a trade ticket with buy and sell modes and rolling amount entry.",
        "component": "prediction-market"
      },
      {
        "type": "new",
        "text": "Overflow Actions adds a pill rail that springs open to reveal extra controls.",
        "component": "overflow-actions"
      },
      {
        "type": "new",
        "text": "404 / Not Found adds five animated not-found page styles.",
        "component": "not-found"
      },
      {
        "type": "fixed",
        "text": "Blur effects now clear under reduced motion."
      },
      {
        "type": "improved",
        "text": "Site search moved to the header with better results and badges for new components."
      }
    ]
  },
  {
    "date": "2026-06-08",
    "title": "shadcn registry and Dynamic Island",
    "items": [
      {
        "type": "new",
        "text": "Components install through a shadcn-compatible registry using the @beui namespace, with per-variant install commands."
      },
      {
        "type": "new",
        "text": "Dynamic Island adds an iOS-style pill that morphs between live activity views.",
        "component": "dynamic-island"
      },
      {
        "type": "new",
        "text": "OTP Input adds a one-time-code field with a gliding focus ring, error shake and success state.",
        "component": "otp-input"
      },
      {
        "type": "new",
        "text": "Expandable Tabs adds an icon tab bar whose active tab expands into a labeled pill.",
        "component": "expandable-tabs"
      },
      {
        "type": "new",
        "text": "Action Swap adds Blur, Roll and Cascade swap variants.",
        "component": "action-swap"
      },
      {
        "type": "new",
        "text": "Text Animation gains a letter-by-letter Text Cascade.",
        "component": "text-animation"
      },
      {
        "type": "improved",
        "text": "Motion components now respect reduced motion and skip decorative hover effects on touch devices."
      },
      {
        "type": "new",
        "text": "A motion patterns guide explains the motion conventions behind beUI.",
        "href": "/docs/motion-patterns"
      },
      {
        "type": "fixed",
        "text": "Number Ticker now rolls between values instead of replaying from zero.",
        "component": "number"
      },
      {
        "type": "fixed",
        "text": "Bottom Sheet scrolling no longer bleeds through to the page.",
        "component": "bottom-sheet"
      }
    ]
  },
  {
    "date": "2026-06-01",
    "title": "Badges, toasts and action bars",
    "items": [
      {
        "type": "new",
        "text": "Animated Badge adds status badges with animated state icons and pulse feedback.",
        "component": "animated-badge"
      },
      {
        "type": "new",
        "text": "Animated Toast Stack adds stacked toasts with status morphs and swipe dismissal.",
        "component": "animated-toast-stack"
      },
      {
        "type": "new",
        "text": "Expandable Action Bar adds icon actions that expand into labeled controls on hover or focus.",
        "component": "expandable-action-bar"
      }
    ]
  },
  {
    "date": "2026-05-18",
    "title": "Multi-chain Swap and motion tokens",
    "items": [
      {
        "type": "new",
        "text": "Multi-chain Swap adds a cross-chain swap widget with a bottom-sheet token picker and a destination address field.",
        "component": "swap"
      },
      {
        "type": "improved",
        "text": "Components share easing tokens and respect the reduced motion preference."
      },
      {
        "type": "improved",
        "text": "Decorative hover effects are skipped on devices without hover."
      }
    ]
  },
  {
    "date": "2026-05-11",
    "title": "beUI v2 launches",
    "summary": "beUI v2 is a rewrite on Next.js 15, React 19, Tailwind CSS 4 and Framer Motion.",
    "items": [
      {
        "type": "new",
        "text": "beUI v2 ships a motion-first component catalog built on Framer Motion."
      },
      {
        "type": "new",
        "text": "Button family adds Button, Stateful Button and Magnetic Button.",
        "component": "button"
      },
      {
        "type": "new",
        "text": "Tabs, Switch, Dock and Shared Layout Background arrive with spring-driven indicators.",
        "component": "tabs"
      },
      {
        "type": "new",
        "text": "Tooltip adds an animated tooltip.",
        "component": "tooltip"
      },
      {
        "type": "new",
        "text": "Morphing Modal morphs its height between inner views with a blur cross-fade.",
        "component": "morphing-modal"
      },
      {
        "type": "new",
        "text": "Text Reveal reveals words or characters with a spring slide-up and blur.",
        "component": "text-animation"
      },
      {
        "type": "new",
        "text": "An llms.txt file and registry endpoints let AI agents discover and fetch component source."
      }
    ]
  }
];

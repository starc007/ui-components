/**
 * Copy for component-variant pages (a variant with its own install slug on a
 * page of several separate components gets its own page), keyed by install
 * slug. `name` is the page title, `title` and `description` the search
 * metadata (60 and 165 chars max), `summary` the line under the title (80 max).
 * `scripts/check-registry.ts` fails when a variant page has none or a field
 * runs long.
 */
export type VariantCopy = {
  name: string;
  title: string;
  description: string;
  summary: string;
};

export const VARIANT_SUMMARY_MAX = 80;

export const variantCopy: Record<string, VariantCopy> = {
  // Button
  "button-metallic": {
    name: "Metallic Button",
    title: "React Metallic Button with Chrome Reflection",
    description:
      "Free React metallic button: a neutral surface in a chrome rim with a straight reflection that travels across it. Spring press. Framer Motion, shadcn install.",
    summary: "A button framed by a chrome rim with a reflection that sweeps across.",
  },
  "button-base": {
    name: "Base Button",
    title: "Animated React Button with Press and Ripple",
    description:
      "Free animated React button with spring press scale, hover lift, ripple, variants and sizes. A drop-in base for any app. Framer Motion, Tailwind, shadcn install.",
    summary: "A button with spring press, hover lift, variants and sizes.",
  },
  "button-stateful": {
    name: "Stateful Button",
    title: "React Loading Button with Success and Error States",
    description:
      "Free React stateful button: idle, loading, success and error states swap with a blur while the width morphs to fit. Framer Motion, Tailwind, shadcn install.",
    summary: "A button that moves from loading to success or error as its width morphs.",
  },
  "button-magnetic": {
    name: "Magnetic Button",
    title: "React Magnetic Button: Cursor Pull Hover Effect",
    description:
      "Free React magnetic button that pulls toward the cursor and springs back on leave. Off on touch devices and with reduced motion. Framer Motion, shadcn install.",
    summary: "A button that leans toward the cursor and springs back when it leaves.",
  },

  // Animated CTA Buttons
  "expanding-arrow-button": {
    name: "Expanding Arrow Button",
    title: "React Arrow Button: Animated CTA on Hover",
    description:
      "Free React call to action button: an accent tile expands into a dotted arrow trail on hover or keyboard focus. Framer Motion, Tailwind, shadcn install.",
    summary: "A call to action whose arrow tile stretches into a dotted trail on hover.",
  },
  "hold-action-button": {
    name: "Hold Action Button",
    title: "React Hold to Confirm Button with Liquid Fill",
    description:
      "Free React hold to confirm button: a vertical or horizontal liquid fill rises while you hold, and releasing early cancels. Keyboard support, shadcn install.",
    summary: "Hold to confirm while a liquid fill rises, or let go early to cancel.",
  },
  "slide-action-button": {
    name: "Slide Action Button",
    title: "React Slide to Confirm Button (Swipe to Unlock)",
    description:
      "Free React slide to confirm button: drag the thumb to the end to run the action, release early and it springs back. Touch and keyboard. Framer Motion, shadcn.",
    summary: "Drag the thumb to the end to confirm, or let go early and it springs back.",
  },

  // Select
  select: {
    name: "Select",
    title: "Animated Select Dropdown for React (shadcn)",
    description:
      "Composable React select: the panel pinches off the trigger and separates, rows reveal in a short stagger, and it opens upward when space runs out. shadcn install.",
    summary: "A dropdown whose panel pinches off the trigger and reveals its options.",
  },
  "select-morph": {
    name: "Morph Select",
    title: "React Morph Select: Trigger Grows into the List",
    description:
      "Composable React select where the trigger morphs into the option list as one surface that grows open and shrinks back. Framer Motion layout, shadcn install.",
    summary: "A dropdown where the trigger grows into the list as one surface.",
  },

  // Popover
  popover: {
    name: "Gooey Popover",
    title: "React Gooey Popover with Liquid Animation",
    description:
      "Free React popover that oozes out of its trigger through an SVG goo filter with a liquid neck. Click or hover, controlled or uncontrolled. shadcn install.",
    summary: "A panel that oozes out of its trigger like liquid, with crisp content.",
  },
  "popover-morph": {
    name: "Morph Popover",
    title: "React Morph Popover: Corner Reveal Animation",
    description:
      "Free React popover that reveals from the corner nearest its trigger on one spring clip, with unscaled content and borders. Side and align aware, shadcn install.",
    summary: "A panel that unfolds from the corner nearest its trigger on a spring.",
  },

  // Text Animation
  "text-scramble": {
    name: "Text Scramble",
    title: "React Text Scramble Effect for Changing Text",
    description:
      "Free React text scramble: changed characters cycle through random glyphs before they resolve, while screen readers get the final value. Framer Motion, shadcn.",
    summary: "Changed characters cycle through random glyphs before they settle.",
  },
  "chromatic-text-reveal": {
    name: "Dia Text Animation",
    title: "Dia Text Animation: Cycling Word Color Sweep",
    description:
      "Free React text animation inspired by Dia: a fixed sentence with a final word that cycles, each revealed by a colorful sweep. Framer Motion, shadcn install.",
    summary: "A fixed sentence whose last word cycles in behind a colorful sweep.",
  },
  "text-reveal": {
    name: "Text Reveal",
    title: "React Text Reveal: Word and Letter Animation",
    description:
      "Free React text reveal: words or characters slide up with a spring and a light blur, in sequence. Reduced-motion safe. Framer Motion, Tailwind, shadcn install.",
    summary: "Words or letters slide up into place with a spring and soft blur.",
  },
  "text-shimmer": {
    name: "Text Shimmer",
    title: "React Text Shimmer Effect for Loading Text",
    description:
      "Free React text shimmer: a gradient sweeps across the text for loading labels or emphasis. Set the sweep duration. Framer Motion, Tailwind, shadcn install.",
    summary: "A gradient that sweeps across text for loading labels or emphasis.",
  },
  "text-cascade": {
    name: "Text Cascade",
    title: "React Text Cascade: Letter by Letter Roll",
    description:
      "Free React text cascade: when the text changes, old letters drop away as new ones roll in, left to right. Reduced-motion safe. Framer Motion, shadcn install.",
    summary: "Old letters drop away as new ones roll in, one at a time from the left.",
  },

  // Number
  "digit-swap": {
    name: "Digit Swap",
    title: "React Digit Swap: Rolling Number Animation",
    description:
      "Free React digit swap: fixed-slot digits and mask glyphs roll on change, with direction, stagger, replay and suffix emphasis. Framer Motion, shadcn install.",
    summary: "Fixed-slot digits that roll on change, with direction and stagger control.",
  },
  "number-ticker": {
    name: "Number Ticker",
    title: "React Number Ticker: Slot Machine Digits",
    description:
      "Free React number ticker: each digit rolls like a slot machine reel with a staggered entry. Tabular figures, locale formatting. Framer Motion, shadcn install.",
    summary: "Digits that roll into place like slot machine reels, one after another.",
  },
  "animated-number": {
    name: "Animated Number",
    title: "React Animated Number: Count Up on Scroll",
    description:
      "Free React count up number: the value counts from zero to its target when it scrolls into view, with a custom formatter. Framer Motion, shadcn install.",
    summary: "A number that counts up to its value when it scrolls into view.",
  },

  // Action Swap
  "action-swap-cascade": {
    name: "Cascade Action Swap",
    title: "React Button Label Swap with Letter Cascade",
    description:
      "Free React action swap: the old button label drops away letter by letter as the new one lands, left to right. For copy and save states. shadcn install.",
    summary: "Button labels that change letter by letter, old ones dropping as new land.",
  },
  "action-swap-blur": {
    name: "Blur Action Swap",
    title: "React Copy Button Swap with Blur Animation",
    description:
      "Free React action swap for copy buttons: the label or icon swaps with blur, opacity and scale, like Copy to Copied. Framer Motion, Tailwind, shadcn install.",
    summary: "Labels and icons that blur out and back in, like Copy turning to Copied.",
  },
  "action-swap-roll": {
    name: "Roll Action Swap",
    title: "React Button Text Roll: Swap Label or Icon",
    description:
      "Free React action swap: the next button label or icon rolls up from below with a blur as the old one leaves. For send and save states. shadcn install.",
    summary: "The next label or icon rolls up from below as the old one leaves.",
  },

  // Scroll Animation
  "smooth-scroll": {
    name: "Smooth Scroll",
    title: "React Smooth Scroll with Lenis and a Hook",
    description:
      "Free React smooth scroll provider built on Lenis, with a useSmoothScroll hook for offset, progress and velocity. Reduced-motion safe, shadcn install.",
    summary: "Smooth page scrolling with a hook for offset, progress and velocity.",
  },
  "scroll-progress": {
    name: "Scroll Progress",
    title: "React Scroll Progress Bar and Reading Ring",
    description:
      "Free React reading progress indicator: a fixed bar or circular ring that follows scroll position with spring smoothing. Framer Motion, shadcn install.",
    summary: "A reading progress bar or ring that follows how far the page has scrolled.",
  },
  parallax: {
    name: "Parallax Scroll",
    title: "React Parallax Scroll Effect Wrapper",
    description:
      "Free React parallax wrapper: children drift at a speed factor as they cross the viewport, on either axis. Reduced-motion safe. Framer Motion, shadcn install.",
    summary: "Content that drifts at its own speed as it passes through the viewport.",
  },
  "scroll-to": {
    name: "Scroll To Button",
    title: "React Scroll To Button: Smooth Scroll to Section",
    description:
      "Free React scroll to button: smooth scrolls to an offset, selector or element through the smooth scroll provider, and jumps under reduced motion. shadcn install.",
    summary: "A button that glides the page to a section, offset or element.",
  },
  "scroll-reveal": {
    name: "Scroll Reveal",
    title: "React Scroll Reveal: Animate on Scroll",
    description:
      "Free React scroll reveal: children slide in with a spring and blur as they enter the viewport, once or every time. Reduced motion keeps a fade. shadcn install.",
    summary: "Content that slides in with a soft blur as it enters the viewport.",
  },

  // Range Slider
  "range-slider-inline": {
    name: "Inline Slider",
    title: "React Slider with Inline Label and Value",
    description:
      "Free React slider with an inset fill and the label and value inside the track. The thumb parts around the text as it passes. Keyboard accessible, shadcn install.",
    summary: "A slider with its label and value inside the track and a thumb that parts.",
  },
  "range-slider": {
    name: "Range Slider",
    title: "React Range Slider with Step Ticks",
    description:
      "Free React range slider with tick dots and a bar thumb that bounces as it lands on each step. Keyboard accessible. Framer Motion, Tailwind, shadcn install.",
    summary: "A stepped slider whose thumb bounces as it lands on each tick.",
  },
  "range-slider-fluid": {
    name: "Fluid Slider",
    title: "React Fluid Slider with Liquid Fill",
    description:
      "Free React slider with no thumb: the fill slides behind a rounded liquid cap and the label flips color where the fill covers it. Keyboard accessible, shadcn.",
    summary: "A thumbless slider whose fill flips the label color as it slides under it.",
  },
  "range-slider-wave": {
    name: "Wave Slider",
    title: "React Wave Slider with Equalizer Bars",
    description:
      "Free React wave slider: equalizer bars peak around the handle and drop back once it passes, so the value moves as a wave. Keyboard accessible, shadcn install.",
    summary: "Equalizer bars that peak around the handle and ripple down the track.",
  },
  "range-slider-bubble": {
    name: "Bubble Slider",
    title: "React Slider with Value Bubble Tooltip",
    description:
      "Free React slider: grab the thumb and a value bubble pops out, tilting and squashing with drag speed before it settles. Keyboard accessible, shadcn install.",
    summary: "A value bubble pops from the thumb and tilts with how fast you drag.",
  },
  "range-slider-ruler": {
    name: "Ruler Slider",
    title: "React Ruler Slider: Scrolling Scale Picker",
    description:
      "Free React ruler slider: the needle stays put while the scale scrolls under it, and a flick glides to the nearest tick. Fractional steps, shadcn install.",
    summary: "A fixed needle over a scale that scrolls and settles on the nearest tick.",
  },

  // Crash
  crash: {
    name: "Plane Crash Game",
    title: "React Crash Game: Paper Plane Multiplier",
    description:
      "Free React crash game: a paper plane flies the multiplier up a curve, a parachute opens at your cash out, and a crash sends it tumbling. shadcn install.",
    summary: "A paper plane climbs the multiplier until you cash out or it crashes.",
  },
  "crash-balloon": {
    name: "Balloon Crash Game",
    title: "React Crash Game: Hot Air Balloon Multiplier",
    description:
      "Free React crash game: a hot air balloon climbs an altimeter as the multiplier rises, a parachutist bails at cash out, and a crash pops it. shadcn install.",
    summary: "A hot air balloon rises with the multiplier until it pops.",
  },
  "crash-tower": {
    name: "Tower Crash Game",
    title: "React Crash Game: Stacking Tower Multiplier",
    description:
      "Free React crash game: blocks stack higher with the multiplier and the tower sways as it grows, until a crash topples the top. Framer Motion, shadcn install.",
    summary: "A tower of blocks grows and sways with the multiplier until it topples.",
  },

  // Loading States
  "reasoning-text": {
    name: "Reasoning Text",
    title: "AI Reasoning Text Animation for React",
    description:
      "Free React AI reasoning text: shimmering copy with an ASCII loader and cascade, phrase swap or letter scramble transitions between steps. shadcn install.",
    summary: "Shimmering reasoning lines that cascade, swap or scramble between steps.",
  },
  "thinking-shimmer": {
    name: "Thinking Shimmer",
    title: "AI Thinking Shimmer Text for React",
    description:
      "Free React AI thinking indicator: a quiet shimmer over the agent's current status that stays readable while work continues. Reduced-motion safe, shadcn install.",
    summary: "A quiet shimmer over the agent's status while it keeps working.",
  },
  "agent-progress": {
    name: "Agent Progress",
    title: "AI Agent Progress Indicator with Timer",
    description:
      "Free React agent progress indicator: an activity glyph, an action verb and a live tabular timer for longer agent tasks. Framer Motion, shadcn install.",
    summary: "An activity glyph, an action verb and a live timer for long agent tasks.",
  },

  // Fixtures
  "knockout-wheel": {
    name: "Knockout Wheel",
    title: "Radial Tournament Bracket for React",
    description:
      "Free React radial tournament bracket: the champion at the hub, each round a ring further out, teams on the rim. Hover a team to isolate it. shadcn install.",
    summary: "A tournament drawn in rings, with the champion at the center.",
  },
  "knockout-bracket": {
    name: "Knockout Bracket",
    title: "React Knockout Bracket: Tournament Fixtures",
    description:
      "Free React knockout bracket that pages one round at a time, with animated cards and connectors, a third place play-off and dates and results. shadcn install.",
    summary: "A knockout bracket that pages round by round with animated connectors.",
  },

  // Morphing Search
  "morphing-search-chips": {
    name: "Chip Search Bar",
    title: "React Search Bar with Chips and Recent Searches",
    description:
      "Free React search bar that widens on focus and unfolds recent searches. Terms become removable chips and suggestions filter as you type. shadcn install.",
    summary: "A docked search bar that widens and turns terms into removable chips.",
  },
  "morphing-search": {
    name: "Morphing Search",
    title: "React Morphing Search Bar with Results Panel",
    description:
      "Free React search that morphs from a field or icon into a glass results panel, opened by click or keyboard shortcut. Keyboard accessible, shadcn install.",
    summary: "A search field or icon that morphs into a panel of results.",
  },

  // File Upload
  "attachment-upload": {
    name: "Attachment Upload",
    title: "React Attachment Upload with Image Previews",
    description:
      "Free React attachment upload: a dropzone with file, image and audio rows, upload progress, retry, removal and image previews. Framer Motion, shadcn install.",
    summary: "Drop in files, images and audio, with previews, retry and removal.",
  },
  "file-upload": {
    name: "File Upload Queue",
    title: "React File Upload Queue with Progress Bars",
    description:
      "Free React drag and drop upload queue: progress rows, upload states, retry and removal for each file. Framer Motion, Tailwind, shadcn install.",
    summary: "A drag and drop queue that tracks each upload, with retry and remove.",
  },

  // Prediction Market
  "prediction-market-card": {
    name: "Prediction Market Cards",
    title: "Prediction Market Cards for React",
    description:
      "Free React prediction market cards: outcome rows, odds buttons that roll to Yes and No on hover, payout multipliers, bookmarks and live price changes. shadcn.",
    summary: "Market listings with outcome rows and odds that roll on hover.",
  },
  "prediction-market": {
    name: "Prediction Market Trade Ticket",
    title: "Prediction Market Trade Ticket for React",
    description:
      "Free React trade ticket to buy and sell prediction market outcomes, with rolling amount entry, quick add chips and trade states. Framer Motion, shadcn install.",
    summary: "Buy or sell an outcome with a rolling amount and quick add chips.",
  },

  // 404 / Not Found
  "not-found-glitch": {
    name: "Glitch 404 Page",
    title: "Glitch 404 Page for React and Next.js",
    description:
      "Free React 404 page: the digits scramble through random glyphs before they resolve, with a chromatic split on hover. Framer Motion, shadcn install.",
    summary: "A 404 whose digits scramble into place and split apart on hover.",
  },
  "not-found-magnetic": {
    name: "Magnetic 404 Page",
    title: "Magnetic 404 Page for React and Next.js",
    description:
      "Free React 404 page where each digit pulls toward the cursor and springs back on leave. Off on touch and reduced motion. Framer Motion, shadcn install.",
    summary: "A 404 whose digits lean toward the cursor and spring back.",
  },
  "not-found-spotlight": {
    name: "Spotlight 404 Page",
    title: "Spotlight 404 Page for React and Next.js",
    description:
      "Free React 404 page: a dark panel where a spotlight follows the cursor and lights up the error code from a dim base. Framer Motion, shadcn install.",
    summary: "A dark 404 where a cursor spotlight lights up the error code.",
  },
  "not-found-stacked": {
    name: "Stacked 404 Page",
    title: "Stacked Card 404 Page for React and Next.js",
    description:
      "Free React 404 page: a code card sits over a hidden stack that fans out with a spring on hover. Framer Motion, Tailwind, shadcn install.",
    summary: "A 404 card over a hidden stack that fans out on hover.",
  },
  "not-found-terminal": {
    name: "Terminal 404 Page",
    title: "Terminal 404 Page for React and Next.js",
    description:
      "Free React 404 page styled as a terminal that types a failed cd command and a 404 status, with a blinking caret. Framer Motion, shadcn install.",
    summary: "A terminal that types out a failed command and a 404 status.",
  },
};

/**
 * Long-form notes for a component page, rendered in a collapsed "About"
 * disclosure at the end of the page and in the page's markdown copy. The
 * content stays in the server-rendered markup while collapsed, so search
 * engines read it without it taking space in the layout. Keep every claim
 * true to the shipped source.
 */
export type ComponentFaq = {
  question: string;
  answer: string;
};

export type ComponentAbout = {
  /** What the component is and what it takes care of. */
  overview: string;
  /** Concrete places it fits. */
  useWhen: string[];
  /** Keyboard, screen reader and reduced-motion behavior. */
  accessibility: string;
  faq: ComponentFaq[];
};

export const componentAbout: Partial<Record<string, ComponentAbout>> = {
  "expanding-arrow-button": {
    overview:
      "Animated CTA Buttons are three call-to-action buttons for React, each built with Framer Motion and styled with Tailwind CSS. The Expanding Arrow Button grows its accent tile across the button into a dotted arrow trail on hover or focus. The Hold Action Button fills with a liquid wave while it is held and only fires once the hold completes, so a brief tap cannot trigger it. The Slide Action Button asks the user to drag a thumb to the end of its track before it confirms, and springs back if released early.",
    useWhen: [
      "A landing page hero or pricing card needs one primary call to action that stands out from secondary links.",
      "A destructive or irreversible action, such as deleting a project or sending a payment, should take a deliberate hold instead of a single click.",
      "A mobile checkout or unlock flow wants a slide to confirm gesture that is hard to trigger by accident.",
    ],
    accessibility:
      "All three render a real button element. The hold button responds to Space and Enter: holding either key fills it, and releasing early cancels. The slide button confirms with Enter or Space for keyboard users and announces its completed state through a polite live region. With reduced motion enabled, the arrow trail and fills appear without movement.",
    faq: [
      {
        question: "How do I make an animated call to action button in React?",
        answer:
          "Install the component with the shadcn CLI or copy its source, then render ExpandingArrowButton with your label as children. It accepts every standard button prop, so onClick, type and disabled work as usual.",
      },
      {
        question: "How long does the hold to confirm button take?",
        answer:
          "Set the holdDuration prop in milliseconds. onHoldComplete fires once the fill reaches the end, and holdingLabel and completeLabel change the text shown while holding and after completion.",
      },
      {
        question: "Can I change how far the slide button has to travel?",
        answer:
          "Yes. The threshold prop sets how far along the track the thumb must be released to confirm, and resetDelay controls when the button returns to its idle state after onComplete fires.",
      },
    ],
  },

  loader: {
    overview:
      "Loader is a single React loading indicator with seventeen variants: spinner, dots, bars, dot matrix, dither, morph, comet, scramble, metaballs, newton, helix, percent, and five terminal-style ASCII spinners like the ones command line AI agents use. Every variant scales from one size prop and draws in currentColor, so it inherits text color and works in light and dark themes without extra styling.",
    useWhen: [
      "A button, table or card needs an inline spinner that matches the surrounding text color.",
      "An AI chat or terminal-style interface wants an ASCII or braille spinner instead of a generic circle.",
      "A full-page or section loading state needs something more distinctive than a default spinner, such as metaballs or a dot matrix.",
    ],
    accessibility:
      "The loader renders with the status role and takes a label prop that screen readers announce, such as \"Loading results\". With reduced motion enabled, every variant replaces its movement with a calm opacity pulse, so it still signals activity without spinning or bouncing.",
    faq: [
      {
        question: "How do I change the color of the loading spinner?",
        answer:
          "Set a text color on the loader or its parent, for example with a Tailwind text class. Every variant paints with currentColor.",
      },
      {
        question: "How do I make the spinner bigger or faster?",
        answer:
          "Use the size prop for pixel size and the speed prop for the length of one animation cycle in seconds. Lower speed values spin faster.",
      },
      {
        question: "Does the loader need extra dependencies?",
        answer:
          "Only Framer Motion (the motion package), which the rest of beUI also uses. The ASCII variants are plain text frames, so they need no fonts or images.",
      },
    ],
  },

  "range-slider": {
    overview:
      "Range Slider is a set of six animated slider designs for React that share one value, step, drag and keyboard engine. The base Range Slider shows tick dots and a vertical-bar thumb that bounces onto each step. Inline Slider keeps its label and value inside the track. Fluid Slider drops the thumb for a rounded liquid fill. Wave Slider turns the track into equalizer bars that peak around the handle. Bubble Slider pops a value bubble that tilts with drag speed, and Ruler Slider scrolls a scale under a fixed needle with momentum.",
    useWhen: [
      "A settings panel needs a volume, brightness or opacity control that feels more tactile than a native range input.",
      "A form needs a stepped value, such as a rating, quantity or price tier, where each step should be visible.",
      "A mobile or kiosk interface wants a ruler or bubble style picker for weights, heights or amounts.",
    ],
    accessibility:
      "Each slider exposes the slider role with its minimum, maximum and current value, and accepts an aria-label and a formatted value text for screen readers. Arrow keys move one step, Page Up and Page Down move ten, and Home and End jump to the bounds. With reduced motion enabled, the bounce, wave and momentum effects are removed while the value still updates.",
    faq: [
      {
        question: "How do I build a custom range slider in React?",
        answer:
          "Install the design you want with its own shadcn command, then pass min, max, step and either value with onValueChange for controlled use or defaultValue for uncontrolled use.",
      },
      {
        question: "Can I use the slider in a form?",
        answer:
          "Yes. Each slider is controlled or uncontrolled, so you can keep the value in form state and submit it like any other field.",
      },
      {
        question: "Is this a dual thumb range slider?",
        answer:
          "No. Each design selects a single value. For a minimum and maximum pair, render two sliders that bound each other.",
      },
    ],
  },

  "text-animation": {
    overview:
      "Text Animation collects five animated text components for React. Text Reveal slides words or characters up into place with a spring and a light blur. Text Shimmer sweeps a gradient across text for loading and emphasis. Text Cascade rolls letters in one by one like a slot machine. Text Scramble resolves changed text through random characters. The Dia-style text animation keeps a sentence fixed and cycles its final word with a colorful sweep.",
    useWhen: [
      "A landing page headline should reveal on load or as it scrolls into view.",
      "An AI or loading state needs shimmering status text instead of a spinner.",
      "A counter, status label or rotating tagline should change its words with motion instead of a hard swap.",
    ],
    accessibility:
      "Text Scramble and the cycling sentence keep the final text in a visually hidden element, so screen readers read the real words and not the random characters in between. With reduced motion enabled, Text Reveal drops its slide and keeps a fade, Text Shimmer stops its sweep, and Text Scramble shows the final text directly.",
    faq: [
      {
        question: "How do I animate text in React with Framer Motion?",
        answer:
          "Install the effect you need, such as Text Reveal or Text Shimmer, and wrap your string with it. Each one is a separate install, so you only ship the effect you use.",
      },
      {
        question: "How do I make a shimmer text loading effect?",
        answer:
          "Use Text Shimmer around the status text, for example \"Thinking\". The gradient sweep runs continuously and inherits the surrounding font and size.",
      },
      {
        question: "Can I change the text while it animates?",
        answer:
          "Yes. Text Scramble and Text Cascade animate whenever their text changes, so you can drive them from state.",
      },
    ],
  },

  tabs: {
    overview:
      "Tabs is an animated tabs component for React with a spring indicator that slides between triggers using Framer Motion. It comes in pill, segment and underline styles, supports icons on each trigger, and can show icons only on the selected tab so it springs open into a labeled pill. Long tab lists scroll horizontally with edge fades and arrow buttons.",
    useWhen: [
      "A settings page, dashboard or documentation page switches between related panels.",
      "A pricing or feature section toggles between options such as monthly and yearly.",
      "A toolbar needs a compact segmented control with icons.",
    ],
    accessibility:
      "Triggers render inside a tablist with the tab role and expose their selected state, and each panel has the tabpanel role labelled by its tab. Arrow keys move between enabled tabs (mirrored in right-to-left layouts), and Home and End jump to the first and last. The sliding indicator and scroll fades are decorative and hidden from assistive technology. With reduced motion enabled, panels switch without their slide.",
    faq: [
      {
        question: "How do I make animated tabs in React with Framer Motion?",
        answer:
          "Install the component, then compose Tabs, TabsList, TabsTrigger and TabsContent. The sliding indicator is built in, so there is no layoutId wiring to do yourself.",
      },
      {
        question: "Can I control the selected tab?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue to let the component manage it.",
      },
      {
        question: "How is this different from shadcn tabs?",
        answer:
          "It follows the same composition as shadcn tabs, so the markup will feel familiar, and adds the spring indicator, three visual variants, icons and scrollable overflow.",
      },
    ],
  },

  "wheel-picker": {
    overview:
      "Wheel Picker is an iOS-style scroll picker for React. Options sit on a 3D drum with a crisp center band, and the wheel runs on its own momentum physics: a flick coasts based on its speed and settles onto the nearest row with a spring. It can play a short synthesized tick for each row it passes, and several wheels compose side by side for date and time pickers.",
    useWhen: [
      "A mobile-first form needs a time, date or duration picker that feels like iOS.",
      "A setting has a short list of ordered values, such as hours, units or sizes, where scrolling feels natural.",
      "An alarm, timer or booking flow combines several wheels in one row.",
    ],
    accessibility:
      "The wheel is a focusable listbox with an aria-label. Arrow Up and Arrow Down move one row, Home and End jump to the first and last options, and the mouse wheel and drag work as well. With reduced motion enabled, the 3D drum becomes a flat snapping list of buttons, so every option stays selectable without the rotation or coasting.",
    faq: [
      {
        question: "How do I make an iOS style picker wheel in React?",
        answer:
          "Install the component and pass an options array of strings or label and value pairs, plus value and onValueChange or a defaultValue.",
      },
      {
        question: "How do I build a time picker with it?",
        answer:
          "Render two or three WheelPicker components next to each other, one for hours, one for minutes and optionally one for AM and PM, and combine their values.",
      },
      {
        question: "Can I turn the tick sound on?",
        answer:
          "Set the sound prop. It is off by default and synthesizes a short tick with the Web Audio API, so no audio file is needed.",
      },
    ],
  },

  "dynamic-island": {
    overview:
      "Dynamic Island is an iPhone-style island for React that morphs between live activity views. The pill resizes with a bouncy spring to fit each view, and the content cross-fades with a short blur, so switching from a compact state to a music player, timer or call view feels continuous. You pass views as children and choose which one is showing.",
    useWhen: [
      "A product page or landing page wants to show live status, such as an upload, timer or now playing track, in a compact pill.",
      "A web app needs a notification surface that grows for detail and shrinks back to a summary.",
      "A demo or portfolio recreates iOS interactions on the web.",
    ],
    accessibility:
      "The island is a polite live region, so screen readers announce a new view when it appears without interrupting the user. With reduced motion enabled, the content drops its scale and blur and switches with a short fade.",
    faq: [
      {
        question: "How do I make a Dynamic Island in React?",
        answer:
          "Install the block, wrap your views in DynamicIsland, give each DynamicIslandView an id, and set the view prop to the id you want to show. Pass null to show the compact state.",
      },
      {
        question: "Can I build this with CSS only?",
        answer:
          "A static pill is easy in CSS, but the morph between views needs measured sizes and a spring. This component handles that with Framer Motion so the pill always fits its content.",
      },
      {
        question: "Does it work on desktop?",
        answer:
          "Yes. It is a regular React component that renders anywhere on the page, not only on mobile.",
      },
    ],
  },

  "shader-background": {
    overview:
      "Shader Background puts animated WebGL shader backgrounds into React with one typed variant prop. It wraps the Paper Design shaders and ships more than twenty variants, including mesh gradient, grain gradient, warp, waves, water, voronoi, swirl, smoke ring, metaballs, god rays, dithering, spiral, dot grid, dot orbit, Perlin and simplex noise. Each variant keeps its own typed props for colors, speed and shape.",
    useWhen: [
      "A hero section or landing page needs a moving gradient background without a video file.",
      "A card, banner or sign in page wants a subtle grain or noise texture.",
      "A product launch page needs a distinctive animated background that still loads fast.",
    ],
    accessibility:
      "The shader is decorative and draws on a canvas behind your content. With reduced motion enabled, every animated variant is frozen with its speed at zero, so the background stays visible but still. Keep text on top of the shader at a readable contrast.",
    faq: [
      {
        question: "How do I add a shader background in React?",
        answer:
          "Install the component, place ShaderBackground inside a positioned container, and set variant, for example mesh-gradient, along with that variant's colors and speed.",
      },
      {
        question: "Does it work in Next.js?",
        answer:
          "Yes. It is a client component, so render it inside a client boundary or a page that already uses one.",
      },
      {
        question: "Will a WebGL background slow down my page?",
        answer:
          "The shaders run on the GPU and redraw only the canvas, so layout and text are not affected. For the lightest option, use a static variant such as the static mesh gradient.",
      },
    ],
  },

  "animated-sidebar": {
    overview:
      "Animated Sidebar is a shadcn-style application sidebar for React and Next.js. A provider manages desktop and mobile state, and the sidebar collapses either into an animated icon rail or fully off canvas. Nested menus morph open and closed, the main content inset animates with the sidebar width, and on mobile it becomes a focus-managed sheet. It supports left or right placement and sidebar, floating and inset styles.",
    useWhen: [
      "A dashboard, admin panel or SaaS app needs primary navigation that can collapse to icons.",
      "An app has nested sections, such as projects with sub pages, that should expand in place.",
      "A responsive layout needs the same navigation as a sheet on phones.",
    ],
    accessibility:
      "The trigger and close controls are real buttons, the mobile sheet keeps focus inside while it is open and returns it when closed, and Cmd or Ctrl plus B toggles the sidebar from the keyboard. With reduced motion enabled, the width and menu animations are removed.",
    faq: [
      {
        question: "How do I make a collapsible sidebar in React?",
        answer:
          "Wrap your layout in AnimatedSidebarProvider, render AnimatedSidebar with collapsible set to icon or offcanvas, and place your page in AnimatedSidebarInset. AnimatedSidebarTrigger toggles it.",
      },
      {
        question: "Is this compatible with the shadcn sidebar?",
        answer:
          "It uses the same provider, header, content, group, menu and footer composition as the shadcn sidebar, so moving between them is mostly a rename.",
      },
      {
        question: "How do I change the keyboard shortcut?",
        answer:
          "The shortcut is Cmd or Ctrl plus B, defined as a constant at the top of the source file. Since you own the code, change it there.",
      },
    ],
  },

  alert: {
    overview:
      "Animated Alert is a composable inline feedback component for React, built with Framer Motion and styled with Tailwind CSS. It is assembled from Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription, AlertAction and AlertClose parts, and comes in five variants: default, info, success, warning and destructive. The alert fades and slides in, its layout springs when content changes, the icon swaps with a small cross-fade when the variant changes, and dismissing it plays a quick exit before it unmounts.",
    useWhen: [
      "A settings page needs to confirm that changes were saved, or warn that a billing method is about to expire.",
      "A form or dashboard should show an error banner that the user can dismiss once they have read it.",
      "A status message changes over time, for example from uploading to success, and the swap should animate instead of jumping.",
    ],
    accessibility:
      "Warning and destructive alerts render with the alert role so screen readers announce them immediately, and the other variants use the status role for polite announcements; you can override this with the role prop. AlertClose is a real button labelled \"Dismiss alert\", and returnFocusRef moves focus to an element you choose when closing hides the focused control. During the exit the alert is removed from pointer events, focus order and the accessibility tree. With reduced motion enabled, the alert and icon only fade, without sliding, scaling or layout springs.",
    faq: [
      {
        question: "How do I make a dismissible alert in React?",
        answer:
          "Render Alert with AlertIcon, AlertContent (holding AlertTitle and AlertDescription) and AlertClose. Clicking AlertClose calls dismiss, which closes the alert and fires onOpenChange(false).",
      },
      {
        question: "Can I control whether the alert is visible?",
        answer:
          "Yes. Pass open and onOpenChange for controlled visibility, or defaultOpen for uncontrolled use. Custom children can read and change the state through the useAlert hook, which returns open, variant, setOpen and dismiss.",
      },
      {
        question: "How do I add buttons or links to an alert?",
        answer:
          "Place them inside AlertAction. It is a plain layout container, so your own buttons or links render inside it without creating nested interactive elements.",
      },
    ],
  },

  collapsible: {
    overview:
      "Animated Collapsible is a composable disclosure component for React that reveals and hides content with a Framer Motion spring. It is made of Collapsible, CollapsibleTrigger, CollapsibleContent and an optional CollapsibleIndicator chevron that rotates when open, plus a useCollapsible hook for custom parts. The content height is measured and follows changes in size, the text fades in on top of the spring, and the trigger can reuse your own button through the render prop.",
    useWhen: [
      "A product page or FAQ needs a \"Show more\" section that expands without navigating away.",
      "A settings panel hides advanced options until the user asks for them.",
      "A sidebar or filter list groups items under headings that can be expanded and collapsed.",
    ],
    accessibility:
      "CollapsibleTrigger is a real button with aria-expanded and aria-controls pointing at the content, and CollapsibleContent is a region labelled by the trigger. Closed content is hidden from assistive technology and made inert so it cannot be tabbed into, and if focus was inside the content when it closes, focus returns to the trigger. The disabled prop disables the trigger. With reduced motion enabled, the height and layout springs are skipped and the content only fades, and the indicator rotates instantly.",
    faq: [
      {
        question: "How do I make an animated collapsible section in React?",
        answer:
          "Wrap a CollapsibleTrigger and a CollapsibleContent in Collapsible. Clicking the trigger toggles the content, and adding CollapsibleIndicator inside the trigger shows a chevron that turns when open.",
      },
      {
        question: "Can I control the open state?",
        answer:
          "Yes. Pass open and onOpenChange to Collapsible for controlled use, or defaultOpen for uncontrolled use. The useCollapsible hook gives custom children open, disabled, setOpen and toggle.",
      },
      {
        question: "Can I use my own button as the trigger?",
        answer:
          "Yes. Pass a button element, or a component that forwards its props and ref to a button, to the render prop of CollapsibleTrigger. It receives the aria attributes, the click handler and the ref.",
      },
    ],
  },

  "aspect-ratio": {
    overview:
      "Aspect Ratio is a responsive media frame for React that keeps its content at a fixed width to height ratio and animates between ratios with a Framer Motion spring. AspectRatio accepts any positive ratio, such as 16 / 9 or 1, and AspectRatioImage fills the frame with a cover crop that scales uniformly while the frame reshapes, so the image never stretches during the change.",
    useWhen: [
      "A gallery or media grid needs thumbnails that keep a consistent shape at any screen width.",
      "A video or image preview lets the user switch between landscape, square and portrait crops.",
      "A card or hero section needs to reserve space for an image before it loads, so the page does not shift.",
    ],
    accessibility:
      "AspectRatioImage requires an alt prop, so every image carries a text alternative, and the frame itself adds no interactive elements. With reduced motion enabled, ratio changes apply instantly with no layout morph, and the animated prop lets you turn the morph off for everyone.",
    faq: [
      {
        question: "How do I keep an image at a 16:9 aspect ratio in React?",
        answer:
          "Wrap it in AspectRatio with ratio={16 / 9} and render AspectRatioImage inside with src, alt, width and height. The image is cropped to cover the frame at any width.",
      },
      {
        question: "Can the aspect ratio animate when it changes?",
        answer:
          "Yes. Change the ratio prop and the frame and image spring to the new shape. Set animated={false} to apply changes instantly.",
      },
      {
        question: "Why does AspectRatioImage need width and height?",
        answer:
          "The intrinsic width and height let it compute the cover crop for the current ratio, so the image scales evenly while the frame changes shape. Both must be finite, positive numbers that match the source.",
      },
    ],
  },

  "arc-picker": {
    overview:
      "Arc Picker is a radial text picker for React that lays its options along a curve bowed toward the top, bottom, left or right. The selection changes live as each label crosses the center, and one persistent bracket frame grows and squeezes to fit each label. It is built with Framer Motion and supports smooth mouse wheel and trackpad scrolling, drag with momentum, disabled choices and controlled or uncontrolled values.",
    useWhen: [
      "A creative or music app needs a dial-like picker for modes, genres or presets.",
      "A compact control lets users scroll through a short list of named options, such as units, speeds or themes.",
      "A landing page or onboarding flow wants a playful alternative to a dropdown for choosing one option.",
    ],
    accessibility:
      "The picker is a radiogroup with an aria-label (default \"Choose an option\") and an orientation that matches its side, and each option is a radio button with a roving tab stop on the selected choice. Arrow keys move one option, Shift with an arrow or Page Up and Page Down move five, and Home and End jump to the first and last enabled options. Hidden instructions describe dragging, scrolling and the keyboard keys to screen readers. With reduced motion enabled, drag momentum is removed and the wheel steps one option at a time instead of gliding.",
    faq: [
      {
        question: "How do I make a curved scroll picker in React?",
        answer:
          "Install ArcPicker and pass an options array of value and label pairs, then choose a side of top, bottom, left or right. Use radius to make the curve gentler or tighter.",
      },
      {
        question: "Can I control the selected value?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. onValueChange fires for each enabled choice crossed while scrolling, dragging and coasting.",
      },
      {
        question: "Does the arc picker work in a form?",
        answer:
          "Yes. Set the name prop and it renders a hidden input with the selected value, so it submits with the form.",
      },
    ],
  },

  "sortable-stack": {
    overview:
      "Sortable List is a composable drag to reorder list for React, built on Framer Motion's Reorder components. It is made of SortableList, SortableListGroup, SortableListItem, SortableListHandle, SortableListItemContent and SortableListUndo parts, plus a useSortableList hook. Rows spring into their new positions, the dragged row lifts slightly, and an undo button restores the previous order. Pass renderItem for a quick list, or compose the parts yourself.",
    useWhen: [
      "A task or to-do app lets users drag items into priority order.",
      "A settings page lets users rearrange navigation links, dashboard widgets or playlist tracks.",
      "A form builder or survey editor needs questions that can be reordered and the change undone.",
    ],
    accessibility:
      "Each row has a drag handle that is a real button labelled \"Reorder\" followed by the item label, and its description explains the controls. With a handle focused, Arrow Up and Arrow Down move the item one position and Home and End move it to the top or bottom, while focus stays on the moved item. Every move is announced in a polite live region, for example \"Task moved to position 2 of 5\", and rows expose their position and set size. With reduced motion enabled, rows move without the spring and the drag lift.",
    faq: [
      {
        question: "How do I make a drag and drop sortable list in React?",
        answer:
          "Pass items with unique id fields, a getItemLabel function and a renderItem function to SortableList. It renders a handle and your content for each row and shows an undo button by default.",
      },
      {
        question: "Can I control the order of items?",
        answer:
          "Yes. Pass items and onItemsChange for controlled use, or defaultItems for uncontrolled use. onItemsChange receives the items in their new order.",
      },
      {
        question: "Can users undo a reorder?",
        answer:
          "Yes. SortableListUndo restores the previous order, and showUndo controls whether the convenience layout includes it. The useSortableList hook also exposes canUndo, undo and moveItem for custom controls.",
      },
    ],
  },

  "image-viewer": {
    overview:
      "Image Viewer is a composable React image gallery and lightbox built with Framer Motion. Clicking a thumbnail morphs it into the full-size image through a shared layout animation, and closing returns it to the same thumbnail. Inside the viewer you can page with buttons, arrow keys or a horizontal swipe, zoom to 2x and drag to pan, and every part (gallery, thumbnail, content, caption, counter and controls) can be composed separately with the useImageViewer hook.",
    useWhen: [
      "A portfolio, product page or blog post needs an image gallery that opens photos full screen without losing the sense of where they came from.",
      "A chat or ticketing app shows attachment previews that should expand into a zoomable viewer.",
      "A real estate, travel or ecommerce listing needs swipeable full-size photos on mobile with captions and a counter.",
    ],
    accessibility:
      "Thumbnails are buttons labelled \"Open\" plus the image alt text, with aria-haspopup and aria-expanded. The viewer is a modal dialog rendered in a portal: focus moves inside, Tab is trapped, the rest of the page becomes inert and scroll-locked, Escape closes it, and focus returns to the thumbnail. Arrow Left and Arrow Right page between images, the zoom toggle reports its pressed state and pans with arrow keys while zoomed, and the counter and caption are polite live regions. With reduced motion enabled, the thumbnail morph is dropped and images change with a short fade instead of sliding.",
    faq: [
      {
        question: "How do I make an image lightbox gallery in React?",
        answer:
          "Install the component and pass an images array to ImageViewer, where each image has id, src, alt, width and height. The default layout renders a thumbnail grid and the viewer, so no other setup is needed.",
      },
      {
        question: "Can I control which image is open?",
        answer:
          "Yes. Pass value and onValueChange to control the open image id, or defaultValue for uncontrolled use. A value of null means the viewer is closed.",
      },
      {
        question: "Can I customize the thumbnails and viewer controls?",
        answer:
          "Pass children to ImageViewer and compose ImageViewerGallery, ImageViewerThumbnail, ImageViewerContent, ImageViewerCaption, ImageViewerCounter, ImageViewerPrevious, ImageViewerNext and ImageViewerClose yourself, or build custom controls with useImageViewer. It uses plain img elements, so it works in Next.js and outside it.",
      },
    ],
  },

  "date-range-picker": {
    overview:
      "Date Range Picker is a composable React component for choosing a start and end date, either inline or in a dropdown popover. It is made of root, trigger, content, calendar, header, grid, summary, footer, clear and preset parts, plus a useDateRangePicker hook, and DateRangePickerDropdown composes the popover version for you. Months slide and fade as you page, the header opens direct month and year choices, and dates are plain YYYY-MM-DD strings, so they do not shift with the browser's timezone. It is built with Framer Motion and styled with Tailwind CSS.",
    useWhen: [
      "A hotel, rental or travel booking flow needs check-in and check-out dates.",
      "An analytics dashboard filters charts and reports by a date range, with presets like the last 7 or 30 days.",
      "A leave request, invoice or report form needs a bounded range with blocked dates.",
    ],
    accessibility:
      "The month is a grid of date buttons with a single tab stop, and the visible month is announced in a polite live heading. Arrow keys move between dates, Home and End move within the week, Page Up and Page Down change the month, and Shift with Page Up or Page Down changes the year, while Enter or Space selects a date; in the month and year choices, arrow keys move and Escape returns. Hidden help text describes these keys, and selection changes are announced through a status region. When the dropdown opens, focus moves to the active date. With reduced motion enabled, month changes fade without sliding and press scaling is removed.",
    faq: [
      {
        question: "How do I make a date range picker in React?",
        answer:
          "Render DateRangePicker with no children for an inline calendar, or DateRangePickerDropdown for a trigger that opens the calendar in a popover. Both take value and onValueChange, or defaultValue, with a range shaped like { from, to }.",
      },
      {
        question: "Can I limit which dates can be selected?",
        answer:
          "Yes. Use min and max as YYYY-MM-DD strings to bound the range, and isDateDisabled to block individual dates such as weekends or holidays.",
      },
      {
        question: "Can I add preset ranges like Last 7 days?",
        answer:
          "Yes. Pass a presets array of label and value pairs, or compose DateRangePickerPresets with DateRangePickerPreset buttons. Set closeOnSelect to close the popover after a complete range or preset.",
      },
    ],
  },

  card: {
    overview:
      "Card is a generic composable card component for React made of Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent and CardFooter parts, styled with Tailwind CSS. It comes in outlined and muted variants with default or compact spacing shared by every part, and CardHeader pins a CardAction to the top right. It has no motion by default; the opt-in interactive prop adds hover and a Framer Motion spring press, and selected draws a highlight ring for selectable cards.",
    useWhen: [
      "A dashboard or settings page groups related information and actions into separate panels.",
      "A pricing or plan picker shows each option as a selectable card with a radio or checkbox inside.",
      "A list of projects, files or integrations needs consistent summary cards with a title, description and footer actions.",
    ],
    accessibility:
      "The card itself never takes focus; for a clickable or selectable card, put one control that owns it inside, such as a link, button, Checkbox or RadioGroupItem, and spread CARD_TARGET_CLASS on it to stretch its hit area over the whole card. The selected prop is visual only, so the control inside carries the checked state for screen readers, and an interactive card shows a focus outline when that control has keyboard focus. CardTitle can render as an h2, h3 or h4 through the as prop when the card starts a section. With reduced motion enabled, the press scale is skipped.",
    faq: [
      {
        question: "How do I make a card component in React?",
        answer:
          "Compose Card with CardHeader (holding CardTitle, CardDescription and an optional CardAction), CardContent and CardFooter. Use variant for outlined or muted and size for default or compact spacing.",
      },
      {
        question: "How do I make a selectable card with a radio button?",
        answer:
          "Set interactive and selected on Card, place a RadioGroupItem or Checkbox inside, and add CARD_TARGET_CLASS to that control so clicking anywhere on the card toggles it. Give any other button inside relative z-10 so it stays clickable.",
      },
      {
        question: "Does the card animate?",
        answer:
          "Only when you ask. A plain card has no motion. With interactive, the card scales down slightly on press with a spring and settles on release.",
      },
    ],
  },

  "color-picker": {
    overview:
      "Color Picker is a composable color picker for React built with Framer Motion. It includes a saturation and brightness area, hue and opacity sliders, a hex input, RGB or HSL number fields, an eye dropper, presets and a swatch, and can open in a popover whose trigger chip morphs into the color area. Thumbs glide on a spring and lift a loupe while dragged, invalid hex input shakes, and the value is a lowercase hex string that can include alpha.",
    useWhen: [
      "A design tool, theme editor or brand settings page lets users pick a custom color.",
      "A form needs a color field, for example a tag, label or calendar color, that submits a hex value.",
      "A whiteboard or drawing app needs presets and an eye dropper for sampling colors from the screen.",
    ],
    accessibility:
      "The color area is a 2D slider with a value text such as \"Saturation 60%, brightness 80%\", and the hue and opacity tracks are sliders too. Arrow keys move the thumbs, Shift moves in larger steps, Page Up and Page Down jump, and Home and End go to the bounds. The hex input commits on Enter and reverts on Escape, presets are toggle buttons named after their color, and the eye dropper only renders where the browser supports it. The popover is a dialog that receives focus when it opens, closes on Escape or an outside click, and returns focus to the trigger. With reduced motion enabled, the thumb glide, loupe, shake and chip morph are turned off.",
    faq: [
      {
        question: "How do I add a color picker to a React app?",
        answer:
          "Install ColorPicker and compose the parts you need, such as ColorPickerArea, ColorPickerHue, ColorPickerAlpha and ColorPickerHexInput. For a popover, put them in ColorPickerContent next to a ColorPickerTrigger.",
      },
      {
        question: "Can I control the color value?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. onValueChange fires during dragging and typing, and onValueCommit fires once an interaction settles.",
      },
      {
        question: "Can I hide the opacity slider?",
        answer:
          "Set alpha={false} to keep every value opaque, and leave out ColorPickerAlpha. ColorPickerChannels also takes format=\"rgb\" or format=\"hsl\" for the number fields.",
      },
    ],
  },

  "color-selector": {
    overview:
      "Animated Color Selector is a composable color swatch picker for React built on native radio inputs. ColorSelector, ColorSelectorLabel, ColorSelectorList and ColorSelectorItem render a row of swatches, and a selection ring hops between them on a low Framer Motion arc, with a small press scale on each swatch. Each swatch accepts any CSS color, including a custom property, and the value can be controlled or uncontrolled.",
    useWhen: [
      "A product page lets shoppers choose a product color, such as a phone case or shirt finish.",
      "A settings page lets users pick an accent color or theme color for their workspace.",
      "A form needs a small set of label or tag colors that submit like any other radio field.",
    ],
    accessibility:
      "Every swatch is a native radio input inside a fieldset, so arrow keys move between swatches the way the browser handles radio groups, and focus shows an outline around the visible swatch. Each item requires a label prop that becomes its accessible name, so selection never relies on color alone, and ColorSelectorLabel renders a legend for the group. With reduced motion enabled, the ring jumps to the new swatch without the hop and the press scale is removed.",
    faq: [
      {
        question: "How do I make a color swatch picker in React?",
        answer:
          "Render ColorSelector with a ColorSelectorLabel and a ColorSelectorList of ColorSelectorItem elements, each with a value, a color and a label.",
      },
      {
        question: "Can I control which color is selected?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use.",
      },
      {
        question: "Does the color selector work with forms?",
        answer:
          "Yes. The swatches are real radio inputs, so they submit under the name you pass, and required, disabled and form are supported on ColorSelector.",
      },
    ],
  },

  breadcrumb: {
    overview:
      "Animated Breadcrumb is composable breadcrumb navigation for React made of Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator and BreadcrumbEllipsis parts. As the route changes, path items slide and fade in and out with Framer Motion. Long trails collapse their middle items behind an ellipsis that opens a dropdown of the hidden paths on hover, click or keyboard, and links can render through your router's Link component.",
    useWhen: [
      "A file manager or document app shows a deep folder path that needs to stay on one line.",
      "An ecommerce site shows category trails such as Home, Men, Shoes, Running above a product.",
      "A dashboard or admin panel with nested pages needs breadcrumbs that animate as users navigate.",
    ],
    accessibility:
      "Breadcrumb renders a nav landmark labelled \"Breadcrumb\" with an ordered list, BreadcrumbPage marks the current page with aria-current, and separators are hidden from screen readers. The ellipsis is a button labelled \"Show hidden paths\" by default; Arrow Down or a keyboard activation opens the dropdown and moves focus to the first hidden link, and it closes on Escape, an outside click or when focus leaves. Items that are leaving are made inert and hidden from assistive technology during their exit. With reduced motion enabled, items fade without sliding and layout movement is turned off.",
    faq: [
      {
        question: "How do I make breadcrumbs in React?",
        answer:
          "Wrap a BreadcrumbList in Breadcrumb and add a keyed BreadcrumbItem per path segment, with a BreadcrumbLink for ancestors and BreadcrumbPage for the current page. Put a BreadcrumbSeparator inside each item after the first.",
      },
      {
        question: "How do I collapse long breadcrumb trails?",
        answer:
          "Set maxItems on BreadcrumbList. When there are more items, the middle ones move into a BreadcrumbEllipsis dropdown. The minimum is 3, and Infinity turns collapsing off.",
      },
      {
        question: "Does it work with Next.js links?",
        answer:
          "Yes. Pass a render function to BreadcrumbLink that spreads its props onto your router's Link, for example the Next.js Link component.",
      },
    ],
  },

  "tilt-card": {
    overview:
      "Tilt Card is a React card wrapper that tilts in 3D perspective toward the cursor on hover, with a soft glare that follows the pointer. The rotation runs on a Framer Motion spring, so it eases back to flat when the pointer leaves. The max prop sets the tilt angle and glare turns the highlight on or off.",
    useWhen: [
      "A portfolio or product grid wants project or product cards that respond to the cursor.",
      "A pricing or feature section highlights one card with a playful hover effect.",
      "A trading card, badge or credit card preview should feel like a physical object on screen.",
    ],
    accessibility:
      "The tilt is purely decorative and does not change the content or add interactive elements, and the glare layer is hidden from screen readers. The effect only runs on devices that can hover, so touch screens do not get a stuck tilt, and with reduced motion enabled the card stays flat and the glare is not drawn.",
    faq: [
      {
        question: "How do I make a 3D tilt card on hover in React?",
        answer:
          "Install TiltCard and wrap your card content in it. Moving the mouse over the card tilts it toward the cursor and adds a glare highlight.",
      },
      {
        question: "Can I change how far the card tilts?",
        answer:
          "Yes. The max prop sets the tilt range in degrees and defaults to 12. Set glare={false} to remove the highlight.",
      },
      {
        question: "Does the tilt effect work on mobile?",
        answer:
          "No. The tilt only runs on devices that can hover, so touch screens show the card flat and avoid sticky hover states.",
      },
    ],
  },

  button: {
    overview:
      "Button is a set of animated React buttons built with Framer Motion and Tailwind CSS. The base Button scales down on press with a spring, lifts slightly on hover, and comes in primary, secondary, ghost and outline variants with an optional Material-style press ripple. StatefulButton swaps between idle, loading, success and error with a letter cascade and resizing width, MagneticButton is pulled toward the cursor, and MetallicButton frames a neutral surface with a chrome rim and a traveling reflection.",
    useWhen: [
      "A form submit or save action should show loading, success and error states without a separate spinner component.",
      "A landing page needs a primary call to action with a tactile press and an eye-catching magnetic or metallic style.",
      "An app needs one consistent button set with sizes, variants and an icon size for toolbars.",
    ],
    accessibility:
      "Every variant renders a native button element (ButtonLink renders an anchor), so Enter, Space and focus work as usual. StatefulButton disables itself and sets aria-busy while loading, and its label sits in a polite live region so the new state text is announced. With reduced motion enabled, the press and hover scale, ripple and letter cascade are removed, MetallicButton's reflection stops, and the magnetic pull is turned off; the magnetic pull is also skipped on devices that cannot hover.",
    faq: [
      {
        question: "How do I make an animated button in React with Framer Motion?",
        answer:
          "Install the variant you need and render Button with a variant and size. It accepts every motion button prop, and pressScale changes how far it shrinks on press. Set ripple to add the press ripple.",
      },
      {
        question: "How do I show a loading state on a button?",
        answer:
          "Use StatefulButton and set state to idle, loading, success or error from your own logic. loadingText, successText and errorText change the label for each state, and icon adds a trailing icon in the idle state.",
      },
      {
        question: "Can I use the button as a link?",
        answer:
          "Yes. ButtonLink takes the same variant, size and pressScale props as Button and renders an anchor, so it works with href or wrapped by a router link.",
      },
    ],
  },

  "expandable-control": {
    overview:
      "Expandable Control is a pair of click to expand controls for React. ExpandableButton starts as a round icon button and grows to reveal its label, and ExpandableChip starts as a label and reveals a trailing action button such as remove or edit. Both keep their surface on a Framer Motion layout spring as they change size, and the revealed content fades in with a light blur.",
    useWhen: [
      "A toolbar wants compact icon buttons that show their label when tapped, without a tooltip.",
      "A filter bar shows tag chips that reveal a remove button when selected.",
      "A mobile layout needs a small control that expands to explain itself only when the user asks.",
    ],
    accessibility:
      "Both controls are real buttons with aria-expanded. ExpandableButton uses its label as the accessible name when the label is a string, or an aria-label you provide. In ExpandableChip, the action button has its own required actionLabel, stays disabled and hidden from screen readers while collapsed, and after the action runs focus returns to the chip when collapseOnAction is on. With reduced motion enabled, size changes happen instantly and the revealed content only fades.",
    faq: [
      {
        question: "How do I make a button that expands to show its label in React?",
        answer:
          "Render ExpandableButton with an icon and a label. Clicking it toggles the label open and closed.",
      },
      {
        question: "Can I control the expanded state?",
        answer:
          "Yes. Both components take expanded and onExpandedChange for controlled use, or defaultExpanded for uncontrolled use.",
      },
      {
        question: "How do I add a remove action to a chip?",
        answer:
          "Use ExpandableChip with label, actionIcon, actionLabel and onAction. By default the chip collapses after the action runs; set collapseOnAction={false} to keep it open.",
      },
    ],
  },

  "adaptive-stepper": {
    overview:
      "Adaptive Stepper is a composable numeric stepper for React made of AdaptiveStepper, AdaptiveStepperDecrement, AdaptiveStepperValue and AdaptiveStepperIncrement. Its footprint stays fixed: when the value reaches the minimum or maximum, the unavailable button exits and the value surface expands into its space on a gooey liquid surface. The number rolls up or down between steps with Framer Motion, and min, max and step set the range.",
    useWhen: [
      "A shopping cart or checkout needs a quantity selector that cannot go below one.",
      "A booking form asks for the number of guests, rooms or tickets within a fixed limit.",
      "A settings panel adjusts a small whole number, such as font size or retry count, with clear bounds.",
    ],
    accessibility:
      "The stepper is a fieldset with a hidden legend that reads its label and current value, and the buttons are labelled \"Decrease value\" and \"Increase value\" by default. The value is an output element announced through a polite live region, and formatValueText changes what screen readers hear. When a bound hides a button, that button is disabled, removed from the tab order and hidden from assistive technology, and if it was activated from the keyboard, focus moves to the remaining button. With reduced motion enabled, the number changes without rolling and the press and fade effects are instant.",
    faq: [
      {
        question: "How do I make a quantity stepper in React?",
        answer:
          "Render AdaptiveStepper with AdaptiveStepperDecrement, AdaptiveStepperValue and AdaptiveStepperIncrement as children, and set min, max and step.",
      },
      {
        question: "Can I control the stepper value?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. Values outside min and max are clamped.",
      },
      {
        question: "Can the stepper submit with a form?",
        answer:
          "Yes. Set the name prop and it renders a hidden input with the current value.",
      },
    ],
  },

  marquee: {
    overview:
      "Marquee is an infinite scrolling React component that loops its children horizontally or vertically in a seamless track. It moves left, right, up or down, pauses when hovered, and fades its edges with a gradient mask. The loop runs on a CSS keyframe animation styled with Tailwind CSS, with speed and gap set through props.",
    useWhen: [
      "A landing page shows a row of customer or partner logos that scrolls continuously.",
      "A testimonials section scrolls quotes or reviews in a vertical column.",
      "A news, ticker or announcement bar loops short messages across the top of a page.",
    ],
    accessibility:
      "The content is duplicated to make the loop seamless, and the copy is hidden from screen readers and made inert, so assistive technology reads each item once and keyboard users do not tab through duplicates. Pause on hover is on by default, which gives mouse users time to read moving content.",
    faq: [
      {
        question: "How do I make an infinite scrolling logo marquee in React?",
        answer:
          "Install Marquee and pass your logos as children. It duplicates them into a second track so the loop has no visible seam.",
      },
      {
        question: "How do I change the marquee speed and direction?",
        answer:
          "Use direction with left, right, up or down, and speed for the length of one loop in seconds (default 30). Lower values scroll faster.",
      },
      {
        question: "Can I stop the marquee from pausing on hover?",
        answer:
          "Yes. Set pauseOnHover={false}. Use gap to change the spacing between items and fade={false} to remove the edge fade.",
      },
    ],
  },

  switch: {
    overview:
      "Switch is an animated toggle switch for React built with Framer Motion and styled with Tailwind CSS. The thumb travels on a heavy spring between the off and on positions, squishes slightly while a pointer holds it, and gives a small shake when someone presses it while it is disabled. An optional label sits beside the track and toggles it when clicked.",
    useWhen: [
      "A settings screen needs on and off controls for preferences such as notifications, dark mode or autoplay.",
      "A feature flag or permissions panel turns individual options on and off with an immediate effect.",
      "A pricing card or form needs a compact toggle, such as switching on an add-on or annual billing.",
    ],
    accessibility:
      "The switch renders a real button with the switch role and an aria-checked state, so screen readers announce it as on or off, and Space or Enter toggles it. Pass label to render a visible label tied to the button, or ariaLabel when the switch has no visible text. With reduced motion enabled, the thumb moves without its spring, and the press squish and disabled shake are skipped.",
    faq: [
      {
        question: "How do I make an animated toggle switch in React?",
        answer:
          "Install the component, then render Switch with checked and onCheckedChange. It is controlled only, so keep the boolean in your own state and update it from onCheckedChange.",
      },
      {
        question: "How do I add a label to the switch?",
        answer:
          "Pass the label prop to show text next to the track that also toggles the switch when clicked. For an icon-only or unlabeled switch, pass ariaLabel instead so screen readers still get a name.",
      },
      {
        question: "Can I disable the switch?",
        answer:
          "Yes. Set disabled to block toggling and dim the control. A press on a disabled switch plays a short shake instead of changing state, unless reduced motion is on.",
      },
    ],
  },

  input: {
    overview:
      "Input is an animated text field for React built with Framer Motion and Tailwind CSS. It takes an optional label, left and right icons, and shows validation through motion: an error shakes the field and slides in a message, and a success state draws a check mark at the right edge. It works controlled or uncontrolled and forwards its ref to the native input element.",
    useWhen: [
      "A sign-up or login form needs fields that clearly react to validation errors without a separate error component.",
      "A search, email or URL field needs a leading icon or a trailing action button such as a clear or reveal control.",
      "A form that validates on blur needs a reserved message line so errors appearing do not push the layout down.",
    ],
    accessibility:
      "The label is a real label element tied to the input, and an error sets aria-invalid on the field. A string error renders a message with the alert role that the input references through aria-describedby, so screen readers announce it and read it again on focus. With reduced motion enabled, the shake is skipped, the error message fades without sliding or blurring, and the success check appears already drawn.",
    faq: [
      {
        question: "How do I show an error message on an input in React?",
        answer:
          "Pass a string to the error prop. The field shakes, turns red and shows the message below it. Passing true shows the error styling and shake without a message.",
      },
      {
        question: "How do I stop validation errors from shifting the layout?",
        answer:
          "Set reserveErrorLine. The input keeps one message line of space below the field, so an error appearing or clearing does not move nearby content.",
      },
      {
        question: "Can I use this input with a form library?",
        answer:
          "Yes. Input forwards its ref to the native input and passes through standard input props such as name, type and onBlur. Note that onChange receives the string value rather than the change event.",
      },
    ],
  },

  select: {
    overview:
      "Select is a composable animated select menu for React built with Framer Motion and Tailwind CSS. The panel unfolds out of a lip flush with the trigger on a single spring, then pulls away into its own rounded surface, and it opens upward when there is not enough room below. A second variant, MorphSelect, grows the trigger itself into the options panel through shared layout and shrinks it back on close.",
    useWhen: [
      "A form or settings page needs a dropdown for a short list of options such as a country, plan or sort order.",
      "A toolbar or filter bar needs a compact picker whose open and close motion feels connected to the trigger.",
      "A product page or card wants a select that grows into its menu instead of opening a separate floating panel.",
    ],
    accessibility:
      "The trigger advertises a listbox popup with aria-haspopup, aria-expanded and aria-controls, and the panel has the listbox role labelled by the trigger. Each option has the option role and an aria-selected state. Arrow Up and Arrow Down move between enabled options, Home and End jump to the ends, and typing a letter jumps to a matching option. Escape or a click outside closes the menu and returns focus to the trigger, and the closed panel is inert and hidden from assistive technology. With reduced motion enabled, the panel fades in without unfolding and its corners stay fixed.",
    faq: [
      {
        question: "How do I make a custom animated select in React?",
        answer:
          "Install the component and compose Select, SelectTrigger, SelectValue, SelectContent and SelectItem. Give each SelectItem a value and its label as children, and pass a placeholder to SelectValue.",
      },
      {
        question: "Can I control the selected value and open state?",
        answer:
          "Yes. Use value and onValueChange for the selection, or defaultValue to let Select manage it. The open state works the same way with open, defaultOpen and onOpenChange.",
      },
      {
        question: "What is the difference between Select and MorphSelect?",
        answer:
          "Select unfolds a panel out of the trigger and separates it, while MorphSelect (installed as select-morph) turns the trigger itself into the panel with a shared layout animation. MorphSelect composes with MorphSelectTrigger, MorphSelectValue, MorphSelectContent and MorphSelectItem.",
      },
    ],
  },

  combobox: {
    overview:
      "Combobox is a composable searchable select for React built with Framer Motion and Tailwind CSS. The text input acts as the trigger, and the option list springs open from the field into a portal that stays collision-aware without shifting the page. It filters as you type, supports grouped options with labels and separators, and moves a spring-gliding highlight to the active row.",
    useWhen: [
      "A form needs a picker for a long list, such as countries, time zones or currencies, where typing to filter is faster than scrolling.",
      "A project or repository switcher needs grouped results that narrow down from a search query.",
      "An app needs autocomplete over known values with custom matching, such as searching by aliases or keywords.",
    ],
    accessibility:
      "ComboboxInput has the combobox role with aria-autocomplete, aria-expanded, aria-controls and aria-activedescendant pointing at the highlighted option, so focus stays in the field while screen readers follow the active row. Arrow Down and Arrow Up open the list and move through options, Home and End jump to the ends, Enter selects, and Escape closes and returns focus to the input. ComboboxEmpty uses the status role so a no-results message is announced. With reduced motion enabled, the list opens without the morph and the highlight jumps between rows.",
    faq: [
      {
        question: "How do I build a searchable select or autocomplete in React?",
        answer:
          "Compose Combobox with ComboboxTrigger containing ComboboxInput, then ComboboxContent with a ComboboxList of ComboboxItem elements. Add ComboboxEmpty for a no-results message and ComboboxGroup with ComboboxLabel to group options.",
      },
      {
        question: "Can I customize how options are filtered?",
        answer:
          "Yes. Pass a filter function to Combobox, and give items extra search terms with the keywords prop or a textValue. You can also own the search text with query, defaultQuery and onQueryChange.",
      },
      {
        question: "Can I control the selected value?",
        answer:
          "Yes. Combobox takes value with onValueChange or defaultValue, and open with onOpenChange or defaultOpen. ComboboxContent accepts side, align, sideOffset and avoidCollisions for placement.",
      },
    ],
  },

  "multi-select": {
    overview:
      "Multi Select is a composable searchable multi-select for React built with Framer Motion and Tailwind CSS. Chosen options appear as removable tokens inside the field that animate in and out, and the option list springs open into a collision-aware portal. Typing filters the list, grouped options are supported, and the list stays open after each pick so several values can be chosen in a row.",
    useWhen: [
      "A form needs to collect several values from a known list, such as tags, skills or team members.",
      "A filter bar lets people narrow results by multiple categories, statuses or labels at once.",
      "An invite or sharing flow picks multiple recipients from a searchable, grouped directory.",
    ],
    accessibility:
      "MultiSelectInput has the combobox role with aria-activedescendant, and the list is a listbox marked aria-multiselectable with options that expose aria-selected. Arrow Up and Arrow Down open and move through options, Home and End jump to the ends, Enter toggles the active option, Escape closes and returns focus, and Backspace in an empty field removes the last token. Each token has a remove button labelled with the option name, and MultiSelectEmpty uses the status role. With reduced motion enabled, tokens and the panel appear without movement and the highlight jumps between rows.",
    faq: [
      {
        question: "How do I make a multi select dropdown with tags in React?",
        answer:
          "Compose MultiSelect with MultiSelectTrigger holding MultiSelectValue and MultiSelectInput, then MultiSelectContent with a MultiSelectList of MultiSelectItem elements. MultiSelectValue renders the chosen values as removable tokens.",
      },
      {
        question: "Can I control which values are selected?",
        answer:
          "Yes. MultiSelect takes value as a string array with onValueChange, or defaultValue for uncontrolled use. The search text and open state are also controllable through query and open with their default and change props.",
      },
      {
        question: "Can I customize how each token looks?",
        answer:
          "Yes. Pass a render function as the children of MultiSelectValue to receive each value and label, and use chipClassName to style the tokens. A custom filter function on MultiSelect changes how options match the query.",
      },
    ],
  },

  checkbox: {
    overview:
      "Checkbox is an animated checkbox for React built with Framer Motion and Tailwind CSS. The check mark draws itself on when selected, the box presses in with a spring, and an indeterminate state draws a dash for partially selected groups. It takes an optional label and a description line underneath.",
    useWhen: [
      "A sign-up or checkout form needs a terms, newsletter or remember-me checkbox.",
      "A table or list needs a select-all control that shows a partial state when only some rows are checked.",
      "A settings page lists independent options, each with a short description under its label.",
    ],
    accessibility:
      "The checkbox is a button with the checkbox role and aria-checked, which reports mixed for the indeterminate state, and Space or Enter toggles it. The label names the control, the description is announced as its description rather than part of the name, and aria-describedby can link an external message such as a form error. With reduced motion enabled, the mark appears without drawing or scaling and the press effect is removed.",
    faq: [
      {
        question: "How do I make an animated checkbox in React?",
        answer:
          "Install the component and render Checkbox with checked and onCheckedChange. It is controlled, so keep the checked state in your component and pass label for the visible text.",
      },
      {
        question: "How do I show an indeterminate checkbox?",
        answer:
          "Set the indeterminate prop. The box shows a dash and screen readers hear it as partially checked, which suits a select-all control when only some items are selected.",
      },
      {
        question: "How do I connect an error message to the checkbox?",
        answer:
          "Give the message an id and pass it through aria-describedby. Use the description prop for helper text under the label, which is linked the same way.",
      },
    ],
  },

  radio: {
    overview:
      "Radio Group is an animated single-choice control for React built with Framer Motion and Tailwind CSS. The selection dot glides from one option to the next through a shared layout animation, and each option presses in with a spring. Options can carry a label and a description, and the group lays out vertically or horizontally.",
    useWhen: [
      "A checkout or settings form asks for one choice from a few options, such as a shipping speed or plan.",
      "A survey or onboarding step presents mutually exclusive answers with short descriptions under each.",
      "A preferences panel picks a single mode, such as light, dark or system theme.",
    ],
    accessibility:
      "The group has the radiogroup role and each option is a button with the radio role and aria-checked, so screen readers announce which option is selected. The group is a single Tab stop: arrow keys move between options and select them, and Space or Enter selects the focused one. Pass aria-label or aria-labelledby to name the group. Descriptions are announced as descriptions rather than as part of the option name. With reduced motion enabled, the dot moves to the new option without gliding and the press effect is removed.",
    faq: [
      {
        question: "How do I make an animated radio group in React?",
        answer:
          "Install the component and render RadioGroup with RadioGroupItem children, giving each item a value and a label. The gliding dot is built in.",
      },
      {
        question: "Can I control the selected option?",
        answer:
          "Yes. Pass value and onValueChange to RadioGroup for controlled use, or defaultValue to let it manage the selection itself.",
      },
      {
        question: "Can the radio buttons sit in a row?",
        answer:
          "Yes. Set orientation to horizontal on RadioGroup and the options lay out in a wrapping row. The default is vertical.",
      },
    ],
  },

  "bottom-sheet": {
    overview:
      "Bottom Sheet is a draggable React bottom sheet built with Framer Motion. It slides up from the bottom of the screen over a blurred scrim, rests at snap points you define as fractions of the viewport height (or auto), and moves between them as you drag its handle. A strong downward fling or a long drag dismisses it, while a shorter pull drops it to the next smaller snap point.",
    useWhen: [
      "A mobile web app needs filters, share options or a cart summary in a sheet that feels like a native iOS or Android sheet.",
      "A map or media view wants details that peek at half height and expand to nearly full screen on demand.",
      "A responsive site needs a phone-friendly alternative to a centered modal for forms or settings.",
    ],
    accessibility:
      "The sheet is rendered in a portal with the dialog role and aria-modal, labelled by its title and described by its description when you pass them. Opening it moves focus into the sheet and keeps Tab inside, and closing returns focus to the element that opened it. Escape closes it, the scrim is a button labelled \"Close bottom sheet\", and page scroll is locked while it is open. Only the handle starts a drag, so the title and description stay selectable. With reduced motion enabled, the sheet fades in and out instead of sliding.",
    faq: [
      {
        question: "How do I make a draggable bottom sheet in React?",
        answer:
          "Install the component and render BottomSheet with open and onOpenChange from your own state, plus a title and your content as children. Dragging the handle down past dismissThreshold closes it.",
      },
      {
        question: "How do I set snap points?",
        answer:
          "Pass snapPoints as an array of viewport fractions or \"auto\", for example [0.5, 0.92], and defaultSnap for the index it opens at. Upward flings move to the next larger snap point.",
      },
      {
        question: "Does it work with Next.js?",
        answer:
          "Yes. It is a client component that portals to document.body after mount, so it escapes parent transforms and clipping and renders nothing on the server.",
      },
    ],
  },

  "pull-to-refresh": {
    overview:
      "Pull to Refresh is a native-feeling pull-to-refresh container for React built with Framer Motion and Tailwind CSS. When the content is scrolled to the top, pulling down drags it with increasing resistance, a small indicator reacts to the pull, and its label changes once the threshold is reached. Releasing past the threshold runs your async refresh and holds the content open until it finishes. It works with touch, mouse and pen.",
    useWhen: [
      "A mobile web feed, inbox or timeline should refresh with the same pull gesture people use in native apps.",
      "A dashboard panel or list inside a scrolling container needs a gesture to reload its data.",
      "A progressive web app wants refresh behavior that waits for a network request before settling back.",
    ],
    accessibility:
      "The container is a labelled section that sets aria-busy while a refresh runs. The status label, which reads pull, release or refreshing, sits in a polite live region so screen readers hear the state change, and the decorative indicator is hidden from assistive technology. With reduced motion enabled, the content no longer moves with the pull, the indicator fades instead of scaling, and the refreshing animation becomes a calm pulse.",
    faq: [
      {
        question: "How do I add pull to refresh in React?",
        answer:
          "Wrap your scrollable content in PullToRefresh and pass an onRefresh function. If it returns a promise, the indicator stays in its refreshing state until the promise settles.",
      },
      {
        question: "Can I change how far the user has to pull?",
        answer:
          "Yes. threshold sets the resisted pull distance in pixels needed to refresh, maxPull caps how far the content can travel, and holdDistance sets the offset held while refreshing.",
      },
      {
        question: "Can I change the pull to refresh text?",
        answer:
          "Yes. Use pullingLabel, releaseLabel and refreshingLabel for the three states, and ariaLabel to name the region. Set refreshing to keep the indicator active during a refresh you manage elsewhere.",
      },
    ],
  },

  "shared-layout-bg": {
    overview:
      "Shared Layout Background is a hover highlight for React lists built with Framer Motion's shared layout animation. A single pill glides behind whichever item the pointer is over, blurs in when the pointer enters the list and fades out when it leaves. You pass plain children and it handles the tracking, so it fits navigation menus, settings lists and link groups.",
    useWhen: [
      "A sidebar or footer link list should show a soft background that follows the hovered link.",
      "A settings or account menu wants a hover state that slides between rows instead of flashing on each one.",
      "A table of contents or command list needs a polished hover effect without wiring layout IDs by hand.",
    ],
    accessibility:
      "The highlight is purely visual and ignores pointer events, so each child keeps its own role, focus behavior and accessible name. Set as to ul when the children are list items so the list semantics stay correct. The pill follows keyboard focus as well as mouse hover, so it marks the focused item too. With reduced motion enabled, the pill jumps between items and fades without blur.",
    faq: [
      {
        question: "How do I make a hover background that slides between items in React?",
        answer:
          "Wrap your items in SharedLayoutBg. Each direct child becomes a hover target, and the pill moves between them with a shared layout spring.",
      },
      {
        question: "Can I change the color or size of the hover pill?",
        answer:
          "Yes. Pass Tailwind classes through pillClassName to restyle the pill, set inset to control how far it extends past each row in pixels, and use pillContainerClassName to adjust its positioning.",
      },
      {
        question: "Can I use it with a ul list?",
        answer:
          "Yes. Set as to ul and pass li elements as children. The component also forwards its ref and passes other HTML attributes to the container.",
      },
    ],
  },

  "bounce-sidebar": {
    overview:
      "Bounce Sidebar is an animated vertical navigation for React built with Framer Motion and Tailwind CSS. The active indicator is a small dot that jumps between rows on a curved spring path, bending sideways away from the labels and landing with a quick bounce. Items can be links or buttons and can carry icons.",
    useWhen: [
      "A documentation site or blog needs a compact section navigation with a playful active marker.",
      "A settings page or dashboard switches between views from a short vertical list.",
      "A portfolio or landing page wants an in-page menu that feels more alive than a plain highlighted row.",
    ],
    accessibility:
      "The sidebar renders a nav landmark with an aria-label, which defaults to Sidebar navigation. The active row is marked with aria-current, items render as real links when they have an href and as buttons otherwise, and disabled links are marked aria-disabled and removed from the tab order. The moving dot is hidden from assistive technology. With reduced motion enabled, the dot moves straight to the new row without the arc or bounce.",
    faq: [
      {
        question: "How do I make an animated sidebar navigation in React?",
        answer:
          "Install the component and pass an items array where each item has an id and a label, plus an optional href and icon. BounceSidebar renders the list and the bouncing dot.",
      },
      {
        question: "Can I control which item is active?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, for example to sync with the current route, or defaultValue to let the sidebar manage it.",
      },
      {
        question: "Does it work with Next.js links?",
        answer:
          "Items with an href render plain anchor elements with optional target and rel, so they work for normal navigation in Next.js. For client-side routing, omit href and navigate from onValueChange.",
      },
    ],
  },

  "file-tree": {
    overview:
      "File Tree is an animated file and folder tree for React built with Framer Motion and Tailwind CSS. Folders spring open and closed with branch lines that draw in, folder icons swap between open and closed states, and a hover highlight glides between rows. It is composed from FileTreeFolder and FileTreeFile elements and supports full keyboard navigation.",
    useWhen: [
      "A code editor, IDE-style app or AI coding tool needs a project explorer for files and folders.",
      "A documentation or content management interface shows nested pages or assets as a tree.",
      "A settings or permissions screen needs a nested hierarchy that people can expand and select from.",
    ],
    accessibility:
      "The tree uses the tree and treeitem roles with aria-level, aria-posinset, aria-setsize, aria-selected and aria-expanded, so screen readers announce depth, position and folder state. Only one row is in the tab order at a time. Arrow Up and Arrow Down move between visible rows, Arrow Right opens a folder or moves into it, Arrow Left closes a folder or moves to its parent, Home and End jump to the ends, and Enter or Space selects a row and toggles folders. With reduced motion enabled, rows and branch lines appear without sliding or drawing, and folder icons swap without rotating.",
    faq: [
      {
        question: "How do I build a file explorer tree in React?",
        answer:
          "Install the component and nest FileTreeFolder and FileTreeFile elements inside FileTree. Each needs a unique value and a name, and folders take their contents as children.",
      },
      {
        question: "Can I control which folders are expanded?",
        answer:
          "Yes. Pass expandedIds and onExpandedChange to control open folders, or defaultExpandedIds to set the initial state. The selected row works the same way with value, defaultValue and onValueChange.",
      },
      {
        question: "Can I use custom file icons?",
        answer:
          "Yes. Pass an icon to FileTreeFile or FileTreeFolder to replace the default. Items also accept disabled, and FileTree takes indent and classNames for spacing and styling.",
      },
    ],
  },

  "preview-rail": {
    overview:
      "Preview Rail is a compact React navigation rail made of thin tick marks, built with Framer Motion and Tailwind CSS. Hovering, tapping or keyboard focusing a tick grows it to full length while its neighbours scale down in steps, forming a small pyramid, and a floating preview card glides alongside to show the destination's label and description. It runs vertically or horizontally, renders links or buttons per item, and lets you replace the default card with your own preview.",
    useWhen: [
      "A long documentation or article page needs a minimal section index that stays out of the way until the reader points at it.",
      "A dashboard or desktop-style app wants a slim side rail that previews each destination before the user commits to it.",
      "A landing page or portfolio needs a horizontal tick navigation with rich preview cards for each chapter or project.",
    ],
    accessibility:
      "The rail is a nav element with an aria-label (\"Section navigation\" by default), and each tick is a real link or button with its own accessible name from label or ariaLabel. The selected item carries aria-current (page for links, location for buttons), and the preview appears when an item receives keyboard focus, so Tab moves through destinations with the same preview a pointer gets. The preview card itself is hidden from assistive technology. With reduced motion enabled, the tick scaling and the card's glide, slide and blur are removed, so the card swaps in place.",
    faq: [
      {
        question: "How do I make a hover preview navigation rail in React?",
        answer:
          "Install the component and pass an items array to PreviewRail, where each item has an id, a label and optionally a description and href. Items with href render as links and the rest render as buttons that call onItemSelect.",
      },
      {
        question: "Can I control which item is active?",
        answer:
          "Yes. Pass activeId with onActiveChange for controlled use, or defaultActiveId to let the rail manage it. Set highlightActive to keep the active tick raised when nothing is hovered.",
      },
      {
        question: "Can I render my own preview card or a horizontal rail?",
        answer:
          "Use renderPreview to return any content for an item, or showPreview={false} to hide it. Set orientation to horizontal, previewSide to before or after, and itemSize to change the tick spacing.",
      },
    ],
  },

  dock: {
    overview:
      "Dock is a macOS-style dock for React built with Framer Motion and Tailwind CSS. It holds a row of icon actions on a frosted surface, and an active pill glides between items through a shared layout animation. Separators split actions into groups, and every item shares one size set on the dock.",
    useWhen: [
      "A web app or portfolio wants a floating bottom toolbar for its main destinations or tools.",
      "An editor or canvas tool needs a compact action bar where the current tool is highlighted.",
      "A landing page demo or personal site wants a playful app launcher style navigation.",
    ],
    accessibility:
      "A DockItem given onClick renders a real button that takes an aria-label and reports its active state through aria-pressed. When an item wraps its own link or button, it renders a plain wrapper so interactive elements are never nested, and that child keeps its own accessible name. DockSeparator is hidden from assistive technology. With reduced motion enabled, the active pill moves without gliding.",
    faq: [
      {
        question: "How do I make a macOS style dock in React?",
        answer:
          "Install the component and render Dock with DockItem children, each holding an icon. Add DockSeparator between groups and set size on Dock to change the item size in pixels.",
      },
      {
        question: "How do I show which dock item is active?",
        answer:
          "Set active on the current DockItem. The pill glides to it whenever active moves to another item.",
      },
      {
        question: "Can dock items be links?",
        answer:
          "Yes. Leave out onClick and put your own link or button inside DockItem. It then renders a plain wrapper so the link keeps its semantics and name.",
      },
    ],
  },

  tooltip: {
    overview:
      "Tooltip is a composable tooltip for React built with Framer Motion and Tailwind CSS. It opens with a subtle scale and fade, places itself on any side and alignment while avoiding the viewport edges, and can draw an arrow toward its trigger. It works with hover, keyboard focus and touch taps, keeps a pointer corridor so you can move onto the tooltip, shows one tooltip at a time, and can follow the cursor for charts.",
    useWhen: [
      "An icon-only toolbar or dock needs labels that appear on hover and keyboard focus.",
      "A form or settings page needs short hints next to fields or controls.",
      "A chart or heatmap needs a readout that follows the cursor or anchors to a hovered cell.",
    ],
    accessibility:
      "The tooltip surface has the tooltip role and is linked to its trigger through aria-describedby. For icon-only controls, asLabel makes the tooltip the trigger's accessible name instead. It opens immediately on keyboard focus but not on mouse focus, toggles on a touch tap, and closes on Escape, blur, a mouse press or a tap elsewhere. With reduced motion enabled, the scale is removed and the tooltip only fades.",
    faq: [
      {
        question: "How do I add a tooltip in React?",
        answer:
          "Wrap the trigger element in Tooltip and pass the text through the content prop. For more control, compose Tooltip with TooltipTrigger and TooltipContent instead.",
      },
      {
        question: "How do I change the tooltip position or add an arrow?",
        answer:
          "Set side and align on TooltipContent or the Tooltip shorthand, use sideOffset for the gap, and set arrow to draw a pointer toward the trigger.",
      },
      {
        question: "Can I change the tooltip delay?",
        answer:
          "Yes. Pass delay and closeDelay in milliseconds to a Tooltip, or wrap several tooltips in TooltipProvider to share delay, closeDelay and skipDelay, which lets neighbouring tooltips open instantly after one closes.",
      },
    ],
  },

  "context-menu": {
    overview:
      "Animated Context Menu is a composable right-click menu for React built with Framer Motion and Tailwind CSS. The menu grows out of the exact point where it was invoked through a clip morph, and a highlight glides between rows as you move through them. It supports plain items, checkbox and radio choices, labels, separators and keyboard shortcut hints, and opens on right-click or a long press on touch screens.",
    useWhen: [
      "A file manager, kanban board or design canvas needs right-click actions on its items.",
      "A message list or table row needs contextual actions such as copy, rename and delete.",
      "A mobile web app needs long-press menus that behave like native context menus.",
    ],
    accessibility:
      "The trigger exposes aria-haspopup and aria-expanded, and the menu uses the menu role with menuitem, menuitemcheckbox and menuitemradio items that report aria-checked. It opens from the keyboard with the ContextMenu key or Shift and F10 and focuses the first enabled item. Arrow Up and Arrow Down move with wraparound, Home and End jump to the ends, typing jumps to a matching item, Escape closes and returns focus to the trigger, and Tab closes the menu. With reduced motion enabled, or when opened from the keyboard, the menu appears without the clip morph.",
    faq: [
      {
        question: "How do I make a custom right click menu in React?",
        answer:
          "Wrap the target element in ContextMenuTrigger inside ContextMenu, then add ContextMenuContent with ContextMenuItem children. Each item takes an onSelect callback, and the menu opens at the cursor.",
      },
      {
        question: "Can the context menu have checkboxes or radio options?",
        answer:
          "Yes. Use ContextMenuCheckboxItem with checked and onCheckedChange, or ContextMenuRadioGroup with value and onValueChange around ContextMenuRadioItem children. ContextMenuLabel, ContextMenuSeparator and ContextMenuShortcut help organize the list.",
      },
      {
        question: "Does the context menu work on mobile?",
        answer:
          "Yes. A long press on the trigger opens the menu on touch devices, and moving the finger too far cancels it. You can also control it with open, defaultOpen and onOpenChange.",
      },
    ],
  },

  popover: {
    overview:
      "Popover is an animated React popover with two variants built on Framer Motion. The Gooey Popover oozes out of its trigger through an SVG goo filter, so a liquid neck stretches between the button and the panel before the crisp content fades in on top. The Morph Popover reveals a full-size panel from the corner nearest the trigger on one spring clip, keeping content and borders unscaled, then retraces the clip on close. Both render through a body portal, so they escape overflow clipping and stacking contexts.",
    useWhen: [
      "A toolbar or profile button needs a small panel for settings, sharing options or account details.",
      "A pricing or feature card wants a hover or click detail panel that feels more playful than a plain dropdown.",
      "A popover must open from inside a scroll container or card with overflow hidden without being cut off.",
    ],
    accessibility:
      "The trigger receives aria-haspopup, aria-expanded and aria-controls, and the panel has the dialog role. Escape and a pointer press outside close it, and if focus was inside the panel when it closes, focus returns to the trigger. The closed Gooey panel is inert, and with the hover trigger it also opens on keyboard focus and toggles on tap. With reduced motion enabled, the Gooey variant drops its goo filter and opens instantly, and the Morph variant replaces its clip reveal with a short fade.",
    faq: [
      {
        question: "How do I make an animated popover in React?",
        answer:
          "Install the variant you want with the shadcn CLI (popover for Gooey or popover-morph for Morph), then compose Popover, PopoverTrigger and PopoverContent, or MorphPopover, MorphPopoverTrigger and MorphPopoverContent. The trigger wraps a single focusable element such as a button.",
      },
      {
        question: "Can the popover open on hover?",
        answer:
          "The Gooey Popover takes trigger=\"hover\", which opens on pointer hover and keyboard focus and closes after a short delay. The default is trigger=\"click\". The Morph Popover opens on click.",
      },
      {
        question: "How do I control the popover position and open state?",
        answer:
          "Pass open and onOpenChange for controlled use, or defaultOpen for uncontrolled use. Set side to top or bottom and align to choose the edge, and sideOffset for the gap. The Morph Popover flips to the other side when there is not enough room.",
      },
    ],
  },

  "morphing-modal": {
    overview:
      "Morphing Modal is a React modal built with Framer Motion where one panel changes height smoothly as you move between inner views. Each view change cross-fades the content with a short blur and slide while the panel resizes around it, so a multi-step flow reads as one surface instead of a stack of dialogs. It can sit at the bottom of the screen like a mobile sheet or in the center, over a blurred backdrop.",
    useWhen: [
      "A multi-step flow such as onboarding, a checkout or a wallet send should stay in one modal while its steps change size.",
      "A settings or account menu opens into detail views and back without closing and reopening a dialog.",
      "A mobile-style action sheet needs to grow from a short confirmation to a longer form.",
    ],
    accessibility:
      "The panel is a modal dialog named by its current view's first heading, or by ariaLabel. Focus moves into it on open, Tab stays inside, Escape closes it, and focus returns to the element that opened it. The backdrop is a button labelled \"Close modal\", and page scroll is locked while the modal is open. As the modal starts to close, its layers stop taking pointer events and become inert immediately, so the exiting panel cannot be clicked or focused. With reduced motion enabled, the panel enters and exits without its slide and scale, and views change with a plain fade instead of the blur and slide.",
    faq: [
      {
        question: "How do I make a modal that animates its height in React?",
        answer:
          "Install the component and render MorphingModal with a viewId and onClose. Render the content for the current view as children and change viewId to switch views; the panel resizes to fit.",
      },
      {
        question: "How do I close the modal?",
        answer:
          "Set viewId to null. onClose runs when the backdrop is clicked, so update your state there.",
      },
      {
        question: "Can I center the modal instead of anchoring it to the bottom?",
        answer:
          "Yes. Set placement to center. The default is bottom, which anchors it to the bottom of the viewport like a mobile sheet.",
      },
    ],
  },

  "center-morph-modal": {
    overview:
      "Center Morph Modal is an animated React modal dialog whose full-size surface unfolds from its exact center toward every edge, then folds back the same way on close. It is built with Framer Motion and Tailwind CSS as composable parts: CenterMorphModal, CenterMorphModalTrigger, CenterMorphModalContent and CenterMorphModalClose. The panel renders through a portal over a blurred backdrop and includes an inset close button in its top right corner.",
    useWhen: [
      "A product page needs a focused dialog for a signup, invite or upgrade prompt.",
      "A settings screen wants to confirm a change or show details without leaving the page.",
      "A gallery or feature grid opens a detail view that should feel like it grows out of the middle of the screen.",
    ],
    accessibility:
      "The panel has the dialog role with aria-modal, takes a required ariaLabel and an optional ariaDescribedBy, and the trigger exposes aria-haspopup, aria-expanded and aria-controls. On open, focus moves to the first focusable element inside the panel, Tab and Shift Tab stay trapped within it, and page scroll is locked. Escape and a backdrop press close it unless dismissible is false, and focus returns to the trigger afterward. With reduced motion enabled, the center unfold is replaced by a short fade.",
    faq: [
      {
        question: "How do I make a modal dialog in React with Framer Motion?",
        answer:
          "Install the component with the shadcn CLI, wrap a button in CenterMorphModalTrigger, and put your content in CenterMorphModalContent with an ariaLabel. Everything sits inside a CenterMorphModal root.",
      },
      {
        question: "Can I control when the modal opens?",
        answer:
          "Yes. Pass open and onOpenChange to CenterMorphModal for controlled use, or defaultOpen to let it manage its own state. CenterMorphModalClose wraps any button that should close it.",
      },
      {
        question: "How do I stop the modal from closing on Escape or a backdrop click?",
        answer:
          "Set dismissible to false on CenterMorphModalContent. You can also hide the built-in close button with showCloseButton set to false or rename it with closeButtonLabel.",
      },
    ],
  },

  number: {
    overview:
      "Number Animation collects three animated number components for React built with Framer Motion. Animated Number counts up from its previous value to the new one when it scrolls into view. Number Ticker rolls each digit like a slot machine with a staggered entrance, then rolls changed digits immediately on later updates. Digit Swap keeps every character in a fixed slot and rolls only the glyphs that change, which suits prices, codes and masked values.",
    useWhen: [
      "A landing page stats section should count up to totals such as users, revenue or downloads as it scrolls into view.",
      "A live dashboard, price or balance display needs digits that roll to new values without the text jumping in width.",
      "A wallet, OTP or account screen swaps between a real value and a masked one, such as a hidden balance, with a short roll.",
    ],
    accessibility:
      "Number Ticker and Digit Swap render the full value in visually hidden text and hide the rolling digit columns from assistive technology, so screen readers read the real number instead of individual moving digits. All three use tabular figures so the width stays stable. With reduced motion enabled, Animated Number jumps straight to the final value, Number Ticker sets its digits without rolling or blur, and Digit Swap replaces its vertical roll with a short fade.",
    faq: [
      {
        question: "How do I make an animated counter in React?",
        answer:
          "Install Animated Number and render AnimatedNumber with a value. It counts up over duration seconds when it enters the viewport, and startOnView={false} starts it immediately. Pass format to control how the number is printed.",
      },
      {
        question: "How do I show decimals, currency or thousands separators in the ticker?",
        answer:
          "NumberTicker takes decimals for fraction digits, locale to insert group separators, prefix and suffix for symbols like $ or %, and pad to left-pad with zeros. A custom format function also works on the client.",
      },
      {
        question: "Can I control the roll direction of Digit Swap?",
        answer:
          "Yes. Set direction to up or down, and tune duration and stagger. Use animationKey to replay every glyph even when characters did not change, and suffixLength with suffixClassName to style the last few characters.",
      },
    ],
  },

  "animated-badge": {
    overview:
      "Animated Badge is a React status badge that animates between states with Framer Motion. It has neutral, info, success, warning, danger and loading statuses, each with its own color and icon, and when the status or label changes the icon and text roll in with a light blur while the pill springs to its new width. The loading status spins its icon and adds a soft opacity pulse, and the badge comes in sm and md sizes styled with Tailwind CSS.",
    useWhen: [
      "A deployment or build list shows each job moving from queued to running to passed or failed.",
      "A dashboard table marks rows with live states such as online, degraded or offline.",
      "A form or checkout flow shows a saving, saved or error label next to a field.",
    ],
    accessibility:
      "The badge renders a span with its label as plain text, so screen readers read the current status, and the status icons are hidden from assistive technology. It passes extra props to the span, so you can add role=\"status\" when changes should be announced. With reduced motion enabled, the width spring, icon and text roll, loading spin and pulse are removed, and changes appear in place.",
    faq: [
      {
        question: "How do I make a status badge with an animated icon in React?",
        answer:
          "Install the component with the shadcn CLI and render AnimatedBadge with a status such as success or loading and the label as children. Change status and children from state and the badge animates the swap.",
      },
      {
        question: "Can I use my own icon?",
        answer:
          "Yes. Pass any element to the icon prop to replace the built-in icon, or set showIcon to false to show text only.",
      },
      {
        question: "How do I turn the pulse on or off?",
        answer:
          "Set the pulse prop. It defaults to true for the loading status and false for the others. contentKey lets you force a text roll when the children are not a plain string.",
      },
    ],
  },

  "action-swap": {
    overview:
      "Action Swap is a set of React button and slot primitives that swap their text and icon with motion, built with Framer Motion. ActionSwapButton cycles through a list of items on click and springs its width to fit each label, while ActionSwapText and ActionSwapIcon animate any value change on their own. It ships three animations, each installable on its own: Blur swaps with blur, opacity and scale, Roll brings the next label up from below, and Cascade rolls the new label in letter by letter.",
    useWhen: [
      "A copy button should switch from Copy to Copied with a check icon after a click.",
      "A follow, subscribe or save button toggles between two states and its label should change smoothly.",
      "A status line or call to action cycles through short labels, such as Deploy, Deploying and Deployed.",
    ],
    accessibility:
      "ActionSwapButton renders a real button element and takes an ariaLabel per item, which also names icon-only buttons. Swapping icons are hidden from assistive technology, and the Cascade text keeps the whole label in a visually hidden element so screen readers read the word rather than its letters. With reduced motion enabled, labels and icons switch in place without blur, roll or press scale, and the button width changes without a spring.",
    faq: [
      {
        question: "How do I make a copy button that changes to Copied in React?",
        answer:
          "Use ActionSwapButton with two items, for example copy and copied, each with a label and icon. Clicking cycles to the next item, and onValueChange tells you which one is showing so you can switch back after a delay.",
      },
      {
        question: "Can I control which label is showing?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. Set cycle to false if the button should not advance on click.",
      },
      {
        question: "How do I pick the blur, roll or cascade animation?",
        answer:
          "Set the animation prop to blur, roll or cascade, or install a single variant such as action-swap-cascade, which exports ActionSwapCascadeButton, ActionSwapCascadeText and ActionSwapCascadeIcon.",
      },
    ],
  },

  "animated-toast-stack": {
    overview:
      "Animated Toast Stack is a React toast notification component built with Framer Motion. Toasts enter with a spring and light blur, stack with layout-aware motion as others arrive or leave, and morph their icon and text when a toast changes status, for example from loading to success. Each toast can carry a description, an action button and a close button, and can be swiped sideways to dismiss. A useAnimatedToastStack hook handles adding, updating, auto-dismissing and clearing toasts.",
    useWhen: [
      "A form or settings page confirms a save, then shows an error with a retry action if the request fails.",
      "An upload or export starts with a loading toast that updates in place to success when it finishes.",
      "A dashboard shows short notifications in a screen corner without blocking the page.",
    ],
    accessibility:
      "The stack is an ordered list with aria-live set to polite, so screen readers announce new toasts without interrupting. The close control is a real button labeled Dismiss toast, and actions render as buttons. With reduced motion enabled, toasts and their status changes use opacity fades only, and swipe to dismiss is turned off, so the close button remains the way to dismiss.",
    faq: [
      {
        question: "How do I add toast notifications in React?",
        answer:
          "Install the component with the shadcn CLI, call useAnimatedToastStack, and render AnimatedToastStack with the returned toasts and dismissToast as onDismiss. Call showToast with a title, description and status to add one.",
      },
      {
        question: "How do I update a loading toast to success?",
        answer:
          "showToast returns an id. Call updateToast with that id and a patch such as a new status and title, and the toast morphs in place instead of being replaced.",
      },
      {
        question: "How do I change where toasts appear and how long they stay?",
        answer:
          "Set position, such as bottom-right or top-center, and placement to fixed for a page overlay. Each toast takes a duration in milliseconds, defaultDuration sets the hook default, and a duration of 0 keeps the toast until it is dismissed.",
      },
    ],
  },

  "theme-toggle": {
    overview:
      "Theme Toggle is a React dark mode toggle button that repaints the whole page through the View Transition API. The rectangle, circle and circle-blur variants reveal the new theme with a clip-path that grows from a chosen corner, edge or center, and the blinds variant opens the new theme across the screen in slats like a shutter. The sun and moon icon swaps with a blur, and a useThemeToggle hook lets you trigger the same transition from your own control.",
    useWhen: [
      "A marketing site or documentation site wants a memorable light and dark switch in its header.",
      "A Next.js app already uses next-themes and needs a toggle with a full-page transition instead of an instant flash.",
      "A custom settings menu needs the same animated theme change from its own button or menu item.",
    ],
    accessibility:
      "It renders a native button whose aria-label says what it will do, \"Switch to light mode\" or \"Switch to dark mode\". With reduced motion enabled, or in browsers without the View Transition API, the theme changes immediately with no reveal animation.",
    faq: [
      {
        question: "How do I add an animated dark mode toggle in Next.js?",
        answer:
          "Install the component inside a next-themes ThemeProvider, which it reads through useTheme, then render ThemeToggle. Choose the effect with variant and the origin with start, such as top-right or center.",
      },
      {
        question: "Which browsers support the theme transition?",
        answer:
          "The reveal uses document.startViewTransition. In browsers that do not support it, the toggle still switches the theme, just without the animation.",
      },
      {
        question: "Can I trigger the transition from my own button?",
        answer:
          "Yes. Call useThemeToggle with a variant and start, then call the returned toggle function. It also returns isDark and mounted so you can render your own icon.",
      },
    ],
  },

  "bouncy-accordion": {
    overview:
      "Bouncy Accordion is a single-open React accordion built with Framer Motion. Opening a row lifts it out of the list into its own rounded card with a weighted spring bounce, while closing or switching rows uses a faster spring with no overshoot. Rows can show an icon and a description, the chevron flips with a small spring, and neighbouring rows re-round their corners so the group stays visually joined.",
    useWhen: [
      "A pricing or landing page FAQ needs answers that expand one at a time with a tactile feel.",
      "A settings or help panel groups options with icons where only one section should be open.",
      "A mobile product page shows details such as shipping, returns and sizing in compact rows.",
    ],
    accessibility:
      "Each trigger is a real button with aria-expanded and aria-controls pointing at its panel, and each panel is a region labelled by its trigger. Closed panels are inert and hidden from assistive technology, so their content cannot be focused or read while collapsed. Disabled items render a disabled button. With reduced motion enabled, layout springs, corner changes and the chevron rotation become instant, and the content appears without movement.",
    faq: [
      {
        question: "How do I make an animated accordion in React?",
        answer:
          "Install the component and pass an items array to BouncyAccordion, where each item has an id, a title and optionally a description, icon and disabled flag.",
      },
      {
        question: "Can I control which item is open?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. The value is the open item's id or null.",
      },
      {
        question: "Can I stop the open item from closing?",
        answer:
          "Set collapsible={false}. Clicking the open item then keeps it open, so one item always stays expanded once chosen.",
      },
    ],
  },

  drawer: {
    overview:
      "Drawer is an animated React side panel that slides in from the left or right on a Framer Motion spring. It renders a full-height panel over a blurred backdrop, locks page scroll while open, and closes on Escape or a backdrop click. It is a single controlled component styled with Tailwind CSS, so you pass open and onOpenChange and put any content inside.",
    useWhen: [
      "A mobile site needs a slide-out navigation menu behind a hamburger button.",
      "A shopping site shows the cart or filters in a side panel without leaving the page.",
      "A dashboard opens record details or an edit form next to a table.",
    ],
    accessibility:
      "The panel has the dialog role with aria-modal and takes an ariaLabel for its accessible name. Opening it moves focus inside and keeps Tab there, and closing returns focus to the element that opened it. Escape and the backdrop close it only while dismissable is true, and page scroll is locked while it is open. With reduced motion enabled, the panel fades in and out instead of sliding.",
    faq: [
      {
        question: "How do I make a slide-out drawer in React?",
        answer:
          "Install the component with the shadcn CLI, keep an open state, and render Drawer with open and onOpenChange. Put your menu or panel content inside as children.",
      },
      {
        question: "Can the drawer open from the left?",
        answer:
          "Yes. Set side to left. The default is right, and className styles the panel surface while backdropClassName styles the backdrop.",
      },
      {
        question: "How do I stop the backdrop from closing the drawer?",
        answer:
          "Set dismissable to false. Backdrop clicks are then ignored, and you close the drawer by setting open to false from your own button.",
      },
    ],
  },

  "scroll-animation": {
    overview:
      "Scroll Animation is a group of scroll-driven React components built with Framer Motion and Lenis. Smooth Scroll is a provider that smooths page or container scrolling and exposes a useSmoothScroll hook with live scroll offset, progress and velocity plus a scrollTo function. Scroll Progress draws a reading progress bar or ring, Parallax drifts its children at a speed factor on either axis, Scroll To is a button that smooth-scrolls to a target, and Scroll Reveal slides and unblurs content as it enters the viewport. Each one installs on its own.",
    useWhen: [
      "A long article or blog post needs a reading progress bar along the top of the page.",
      "A landing page wants sections that fade up as they scroll into view and backgrounds that drift with parallax.",
      "A one-page site needs anchor buttons that glide to sections, offset to clear a sticky header.",
    ],
    accessibility:
      "Scroll To renders a real button, and the progress bar and ring are hidden from assistive technology because they are decorative. With reduced motion enabled, Smooth Scroll skips Lenis and uses native scrolling, scrollTo jumps instantly, Parallax stops drifting, Scroll Reveal keeps only its fade, and Scroll Progress drops its spring smoothing.",
    faq: [
      {
        question: "How do I add smooth scrolling to a React or Next.js site?",
        answer:
          "Install smooth-scroll with the shadcn CLI and wrap your page in SmoothScroll. Set root to false to smooth a contained scroll area instead of the window. Lenis is installed as a dependency.",
      },
      {
        question: "How do I make a scroll progress bar in React?",
        answer:
          "Render ScrollProgress for a bar, or ScrollProgress with variant set to circle for a ring. It reads progress from useSmoothScroll, and you can pass your own progress MotionValue instead.",
      },
      {
        question: "How do I reveal elements on scroll?",
        answer:
          "Wrap content in ScrollReveal. The y, blur, duration and delay props shape the reveal, amount sets how much must be visible, and once set to false replays it each time it enters view.",
      },
    ],
  },

  table: {
    overview:
      "Table is a virtualized React data table that stays smooth with ten thousand or more rows by rendering only the rows in view. Columns can be sortable, resizable and reorderable, rows can be selected with checkboxes, and the header stays sticky while the body scrolls. It also supports inline cell editing, row and column insertion and deletion, skeleton loading rows and infinite loading through an end-reached callback, with light, reduced-motion-safe motion from Framer Motion.",
    useWhen: [
      "An admin panel or analytics dashboard needs to list thousands of records without paging or slowing down.",
      "A spreadsheet-like tool needs editable cells and the ability to insert or delete rows and columns.",
      "A feed or log viewer should load more rows as the user scrolls to the bottom.",
    ],
    accessibility:
      "It renders a real table with header cells, and a sorted column exposes aria-sort as ascending or descending. Sortable headers are buttons, selection uses checkboxes labelled \"Select all rows\" and \"Select row\" with its number, and editable cells and renamable headers are inputs with descriptive labels. With reduced motion enabled, the sort chevron flips instantly and dragged headers no longer scale up.",
    faq: [
      {
        question: "How do I build a sortable data table in React?",
        answer:
          "Install the component and pass data and columns to Table, marking columns with sortable. Clicking a header cycles ascending, descending and unsorted. Use sort with onSortChange for controlled sorting, or defaultSort.",
      },
      {
        question: "How do I add row selection and keep it across sorts?",
        answer:
          "Set selectable and provide getRowId so each row has a stable id. Use selectedRowIds with onSelectionChange for controlled selection, or defaultSelectedRowIds.",
      },
      {
        question: "Can the table load more rows on scroll?",
        answer:
          "Yes. Pass onEndReached to load the next page when the user nears the bottom, and set loading while it runs to show skeleton rows. rowHeight, height and overscan tune the virtualization.",
      },
    ],
  },

  "cylinder-carousel": {
    overview:
      "Cylinder Carousel is a 3D-looking React carousel whose items sit on the wall of a cylinder and roll around it in an endless loop, animated with Framer Motion. In the default concave variant the center item is smallest and items grow toward the edges, while the convex variant raises and enlarges the center item instead. Dragging sticks the wall to the pointer, a flick keeps rolling with momentum and springs onto the nearest item, and the mouse wheel and arrow keys roll it too.",
    useWhen: [
      "A product or portfolio page wants a playful, draggable showcase of images, cards or 3D objects instead of a flat slider.",
      "A landing page hero needs an auto-rotating ring of logos, avatars or features that pauses while the user hovers.",
      "A mobile-first gallery should feel tactile, with flick momentum and snapping to each item.",
    ],
    accessibility:
      "The stage is a single focusable element with an application role and a carousel role description, and Arrow Left and Arrow Right roll it one item at a time. Drag, touch and wheel input work alongside the keyboard. With reduced motion enabled, the glide spring is skipped so rolls jump straight to the target item, and autoRotate does not run.",
    faq: [
      {
        question: "How do I make a 3D cylinder carousel in React?",
        answer:
          "Install the component and pass your slides as children of CylinderCarousel. Use itemSize for the largest slide size, visibleItems for how many fit across, and variant to choose concave or convex.",
      },
      {
        question: "Can the carousel rotate on its own?",
        answer:
          "Yes. Set autoRotate and tune autoRotateSpeed in items per second. Auto rotation pauses while the pointer is over the carousel, during a drag and while a glide is running, and it is turned off under reduced motion.",
      },
      {
        question: "How do I know which item is in the center?",
        answer:
          "Pass onIndexChange to receive the centered item's index as the carousel rolls, and defaultIndex to choose the starting item. Set snap={false} if you want the roll to settle freely between items.",
      },
    ],
  },

  timeline: {
    overview:
      "Timeline is an animated horizontal React timeline for dated events, built with Framer Motion and Tailwind CSS. The event at the center of the track is shown at full size while its neighbours shrink and dim, a group of ticks sits in each gap between cards and each year's numeral drifts past on a slower parallax layer. Drag the track with momentum, swipe a trackpad sideways, click a card or use the arrow keys, and the nearest event springs to the center.",
    useWhen: [
      "A product or company page tells its story as a run of dated milestones, releases or launches.",
      "A changelog or release history wants a browsable visual summary above the full notes.",
      "A portfolio or case study walks through a project's phases with a screenshot for each step.",
    ],
    accessibility:
      "The timeline is a labelled region and each event is a native button named by its date and title, with media left outside the button so it stays readable. The events keep one roving tab stop on the centered event, marked with aria-current, and Arrow Left, Arrow Right, Home and End move focus and the track together. Vertical wheel and touch scrolling stay with the page. With reduced motion enabled, the glide spring is skipped and the track jumps straight to the chosen event.",
    faq: [
      {
        question: "How do I build a horizontal timeline in React?",
        answer:
          "Install the component and pass an events array to Timeline. Each event needs an id, a date and a title, and can carry media for the card and a meta line such as a reaction count or tag.",
      },
      {
        question: "How do I know which event is centered?",
        answer:
          "Pass onValueChange to receive the centered event's id as the track moves, and defaultValue to pick the starting event. Pass value to control it from your own state.",
      },
      {
        question: "Can I change how dates and years are shown?",
        answer:
          "Yes. formatDate formats the label above each card and formatYear formats the large background numeral. Dates are read in UTC, so an ISO date string shows the same day everywhere. Set years={false}, ruler={false} or cables={false} to hide any of the background layers.",
      },
    ],
  },

  treemap: {
    overview:
      "Treemap is an animated React treemap chart for hierarchical or flat data. Each tile's area matches its value, nested groups are tiled with an order-preserving binary layout, and tiles spring to their new sizes with Framer Motion when the data changes. Hovering or focusing a tile opens a cursor-following tooltip with the value and share of total, and you can compose Plot, Tooltip and Legend parts or render custom tile content, colors and formatting.",
    useWhen: [
      "A finance dashboard shows a portfolio or market by sector and holding sized by value.",
      "An engineering tool shows disk usage, bundle size or cloud spend broken down by folder or service.",
      "A sales or budget report compares categories and subcategories as share of a total.",
    ],
    accessibility:
      "Every tile is a native button with an accessible name covering its path, value, share and description, and the plot keeps one roving tab stop. Arrow keys move to the nearest tile in that direction, Home and End jump to the first and last tile, and Escape closes the tooltip. If a focused tile is removed, focus moves to a remaining tile, and a visually hidden table lists every item with its exact value and share. With reduced motion enabled, tiles resize without the spring morph.",
    faq: [
      {
        question: "How do I make a treemap chart in React?",
        answer:
          "Install the chart with the shadcn CLI and pass data to Treemap. Leaves have an id, label and value, and groups have children instead of a value. With no children, Treemap renders its plot, tooltip and legend.",
      },
      {
        question: "Can I use my own colors and value format?",
        answer:
          "Yes. Pass a colors palette and formatValue to Treemap, set color or textColor on any node, and use renderTile on TreemapPlot to draw custom tile content.",
      },
      {
        question: "Can I control which tile is active?",
        answer:
          "Yes. Pass activeId and onActiveChange for controlled use, or defaultActiveId for uncontrolled use. The useTreemap hook gives custom parts access to the same state.",
      },
    ],
  },

  "candlestick-chart": {
    overview:
      "Candlestick Chart is an animated React OHLC chart for price data. It draws open, high, low and close candles with volume bars underneath, a dashed last-price line with a price tag, and a crosshair with an axis price tag and an OHLC readout. When new trades arrive, the live candle's body, wick and volume spring to their new values with Framer Motion using transforms only, so the chart handles streaming data smoothly.",
    useWhen: [
      "A crypto or stock trading app shows live price action for a market.",
      "A portfolio or asset page shows recent price history with volume.",
      "A trading dashboard needs a crosshair readout of open, high, low and close for any candle.",
    ],
    accessibility:
      "The plot is a focusable element with the slider role, and its value text reads the active candle's label with its open, high, low and close prices. Arrow Left and Arrow Right move the crosshair one candle, Home and End jump to the first and last candle, and Escape clears it. With reduced motion enabled, candles skip their fade in and values update in place without springs.",
    faq: [
      {
        question: "How do I make a candlestick chart in React?",
        answer:
          "Install the chart with the shadcn CLI and pass candles to CandlestickChart, each with an id, label, open, high, low, close and volume. Compose CandlestickChartLegend and CandlestickChartPlot inside it, or leave children empty for the default layout.",
      },
      {
        question: "Does it work with live price data?",
        answer:
          "Yes. Update the candles array as trades print and set lastPrice to the latest trade. Candles keep their identity by id, so the crosshair stays on the same candle as new ones arrive.",
      },
      {
        question: "Can I format prices and volume?",
        answer:
          "Yes. Pass formatPrice and formatVolume to CandlestickChart. Use activeId with onActiveIdChange to control the crosshair, and the height prop on CandlestickChartPlot to size the plot.",
      },
    ],
  },

  "sankey-chart": {
    overview:
      "Sankey Chart is an animated React Sankey diagram for weighted flows between stages, built with Framer Motion and Tailwind CSS. You pass nodes and links between their ids; the chart places nodes in columns by how far they sit from a source, sizes each one to its value and arranges every column to keep bands short and uncrossed. Links draw in from left to right when the chart scrolls into view and spring to new positions when the data changes, and hovering or focusing a node or flow highlights everything it connects.",
    useWhen: [
      "A finance page shows how revenue breaks down into costs, expenses and profit.",
      "A product dashboard follows users from signup sources through activation to plans.",
      "An energy, budget or supply report shows where an amount comes from and where it goes.",
    ],
    accessibility:
      "The chart is a labelled region, and each node is a native button named by its label, value and in and out totals, with one roving tab stop. Arrow Up and Arrow Down move within a column, Arrow Left and Arrow Right jump to the nearest node in the next column, Home and End reach the first and last node, and Escape closes the tooltip. A focused node's tooltip lists its largest incoming and outgoing flows, and a visually hidden table lists every flow with its exact value and share of its source. Every node keeps a pointer target at least 24px tall, and thin flows keep an 8px hover target. If a focused node leaves the data, focus moves to the remaining tab stop. With reduced motion enabled, flows appear in place and update without the draw-in or spring.",
    faq: [
      {
        question: "How do I make a Sankey diagram in React?",
        answer:
          "Install the component and pass nodes, each with an id and label, and links with a source id, a target id and a positive value. Columns, node sizes and band positions are computed from the links.",
      },
      {
        question: "What happens with loops or bad links?",
        answer:
          "Links to unknown nodes, zero or negative values, links from a node to itself and links that would close a loop are left out, so the chart always draws a left-to-right flow, and the first listed direction of a loop is kept. Repeated node ids keep the first node, and unnamed links between the same two nodes are added together into one band. In development, the chart logs what it left out.",
      },
      {
        question: "Can I control what is highlighted?",
        answer:
          "Yes. Pass activeId with a node id, or a link id that defaults to source:target, and onActiveChange to follow hover and focus. Use defaultActiveId to start with something highlighted.",
      },
    ],
  },

  "donut-chart": {
    overview:
      "Donut Chart is an animated React donut chart with round-capped segments separated by even gaps over a muted track. The ring sweeps in with Framer Motion when it scrolls into view, the focused segment pops outward while the others fade, and a center readout rolls between the total and the focused segment's value. A linked legend lists each segment with its share bar, and the center, legend and ring share one focus state.",
    useWhen: [
      "A billing or analytics page shows revenue, traffic or costs split by source.",
      "A personal finance app shows spending by category with a total in the middle.",
      "A dashboard card summarizes a breakdown such as plan mix or device share in a compact ring.",
    ],
    accessibility:
      "The ring is an image with an accessible label, and the legend carries keyboard access: each row is a button, focusing a row highlights its segment, and Arrow Up and Arrow Down move between rows. The center readout is a polite live region, so the focused value is announced, and legend rows expose a pressed state when you use selection. With reduced motion enabled, the ring appears in place and focus changes happen without easing.",
    faq: [
      {
        question: "How do I make a donut chart in React?",
        answer:
          "Install the chart with the shadcn CLI and pass segments to DonutChart, each with an id, name, color and value. Compose DonutChartPlot with DonutChartCenter inside it and DonutChartLegend, or leave children empty for the default layout.",
      },
      {
        question: "How do I change the center label?",
        answer:
          "Set totalLabel on DonutChartCenter for the caption under the total, or pass a function as children to render your own content from the focused segment and total.",
      },
      {
        question: "Can users select a segment?",
        answer:
          "Yes. Pass onSelect and selectedId to DonutChart to make legend rows selectable. activeId and onActiveChange control which segment is focused.",
      },
    ],
  },

  "volume-profile": {
    overview:
      "Volume Profile is an animated React volume-by-price chart for trading interfaces. It draws a horizontal bar for each price bin you supply, highlights the point of control, and shades a value area made of whole bins around it, 70 percent by default. Bars spring to new lengths with Framer Motion when data updates, unequal bins and price gaps keep accurate geometry, and a cursor-following tooltip shows exact price, volume and share readouts.",
    useWhen: [
      "A crypto or futures trading app shows where volume traded across a session's price range.",
      "A market analysis tool marks the point of control and value area next to a price chart.",
      "A trading journal or report compares traded volume across support and resistance levels.",
    ],
    accessibility:
      "Inspection runs through one native vertical range input, so Arrow keys, Home and End move between price levels and screen readers hear each level's price range, volume, share and whether it is the point of control. Escape closes the tooltip, touch drags inspect levels, and a visually hidden table lists every bin with its volume, share and level. With reduced motion enabled, bars change length without the spring.",
    faq: [
      {
        question: "How do I make a volume profile chart in React?",
        answer:
          "Install the chart with the shadcn CLI and pass data to VolumeProfile, with each bin's id, priceLow, priceHigh and volume. With no children it renders VolumeProfilePlot, VolumeProfileTooltip and VolumeProfileSummary.",
      },
      {
        question: "Can I change or hide the value area?",
        answer:
          "Yes. Set valueArea to a fraction such as 0.68, or to false to hide it. color and pocColor set the bar and point of control colors.",
      },
      {
        question: "Does the chart calculate the bins for me?",
        answer:
          "No. It takes already aggregated bins, so you control the bin size from your own trade data. formatPrice, formatVolume and unit control how values are shown.",
      },
    ],
  },

  "status-bar": {
    overview:
      "Status Bar is an animated React status history chart, the row of colored bars used on uptime and status pages. Each period is a rounded bar colored by its status, the bars stagger in on first view, and when a period's status changes only its color crossfades with Framer Motion. It ships default operational, degraded, outage, maintenance and no data statuses, and you can define your own labels and colors.",
    useWhen: [
      "A status page shows 90 days of uptime for each service.",
      "A monitoring dashboard shows recent health checks or incidents for an API or region.",
      "A CI or cron dashboard shows pass and fail history for each job.",
    ],
    accessibility:
      "Inspection runs through one native range input over the bars, so Arrow keys, Home and End move between periods, and screen readers hear the period label, status and description. Escape closes the tooltip, and a visually hidden table lists every period with its status, so color is never the only way to read the history. With reduced motion enabled, the bars fade in without their rise.",
    faq: [
      {
        question: "How do I build an uptime status bar in React?",
        answer:
          "Install the chart with the shadcn CLI and pass data to StatusBar, with each period's id, label, status and optional description. With no children it renders StatusBarPlot, StatusBarTooltip and StatusBarLegend.",
      },
      {
        question: "Can I use my own statuses and colors?",
        answer:
          "Yes. Pass a statuses array with an id, label and color for each state. Every status used in data must exist in statuses, and the defaults are exported as STATUS_BAR_STATUSES.",
      },
      {
        question: "Can I control the highlighted period?",
        answer:
          "Yes. Pass activeId and onActiveChange for controlled use, or defaultActiveId for uncontrolled use. StatusBarLegend takes showCounts to show how many periods have each status.",
      },
    ],
  },

  "composition-chart": {
    overview:
      "Composition Chart is an animated React 100 percent stacked chart that shows how shares of a whole change over time. The same component draws normalized stacked bars or stacked areas through its view prop, and bar segments spring to their new shares with Framer Motion. A shared tooltip shows each series' exact value and share with animated numbers, a compact legend highlights or pins a series, and periods with missing values are shown as gaps rather than interpolated.",
    useWhen: [
      "A product analytics page shows the mix of traffic sources or devices per month.",
      "A finance report tracks the share of revenue by plan or region over quarters.",
      "An engineering dashboard shows how requests split across services or status codes over time.",
    ],
    accessibility:
      "Period inspection runs through an invisible native range input over the plot, so Arrow keys move between periods and the selected period is read out. Legend items are buttons that highlight a series on focus or hover, toggle a pinned state exposed with aria-pressed on click, and clear on Escape. With reduced motion enabled, bar segments and the period marker move without the spring.",
    faq: [
      {
        question: "How do I make a 100% stacked bar chart in React?",
        answer:
          "Install the chart with the shadcn CLI and pass series and periods to CompositionChart. Each series has an id, name, color and a values array aligned with periods.",
      },
      {
        question: "Can I switch between stacked bars and stacked areas?",
        answer:
          "Yes. Set view to bar or area. Both use the same data, legend and tooltip.",
      },
      {
        question: "Can I control the selected period?",
        answer:
          "Yes. Pass period and onPeriodChange for controlled use, or defaultPeriod for uncontrolled use. formatValue controls how values appear in the tooltip and legend.",
      },
    ],
  },

  "funnel-chart": {
    overview:
      "Funnel Chart is an animated React conversion funnel chart. Stages are drawn as connected curved segments whose widths match their counts, in a vertical or horizontal direction, and the shapes morph with Framer Motion when the numbers change. Each stage has a tooltip with its count, conversion from the previous stage, the amount dropped or gained, and the share of the starting total, with animated numbers, and a summary shows overall conversion.",
    useWhen: [
      "A product analytics dashboard shows signup, activation and purchase conversion.",
      "A sales pipeline report shows leads moving through qualification, demo and close.",
      "A marketing page or campaign report shows where visitors drop off in a checkout flow.",
    ],
    accessibility:
      "Each stage is a native button whose accessible name gives its label, count, unit and share of the starting total, and the stages sit in a labeled ordered list. The tooltip opens on hover and on keyboard focus. With reduced motion enabled, stage shapes change without the morph.",
    faq: [
      {
        question: "How do I make a funnel chart in React?",
        answer:
          "Install the chart with the shadcn CLI and pass stages to FunnelChart, each with an id, label, value and optional color. With no children it renders FunnelChartPlot and FunnelChartSummary.",
      },
      {
        question: "Can the funnel be horizontal?",
        answer:
          "Yes. Set direction to horizontal. The default is vertical.",
      },
      {
        question: "Can I change the unit and number format?",
        answer:
          "Yes. Set unit, such as users or leads, and pass formatValue to format counts. label sets the chart's accessible name.",
      },
    ],
  },

  "liquidity-heatmap": {
    overview:
      "Liquidity Heatmap is a React chart that shows resting order book liquidity across price and time. Each snapshot becomes a column of price bands colored by size, with an optional market price trace drawn over the grid, and cell colors and the trace animate with Framer Motion as new snapshots arrive. Hovering or focusing a band opens a tooltip with the time, price and a NumberTicker size readout, and the chart composes from LiquidityHeatmapPlot, LiquidityHeatmapLegend and the useLiquidityHeatmap hook.",
    useWhen: [
      "A crypto or trading dashboard needs to show where large resting orders sit around the current price over the last hour.",
      "A market microstructure tool wants to compare liquidity walls across sessions on one fixed color scale.",
      "An exchange or analytics page streams order book snapshots and needs a heatmap that updates in place without redrawing from scratch.",
    ],
    accessibility:
      "The plot is a real HTML table with visually hidden column headers, and every band is a button whose label reads the time, price and size or \"No data\". The grid has a single tab stop: Arrow keys move between bands, Home and End jump to the start or end of a row, and Escape closes the tooltip. With reduced motion enabled, the price trace moves to new positions without animating, while band colors still fade.",
    faq: [
      {
        question: "How do I build a liquidity heatmap in React?",
        answer:
          "Pass LiquidityHeatmap an array of snapshots, each with a stable id, a label, its levels as price and size pairs and an optional price for the trace. With no children it renders LiquidityHeatmapPlot and LiquidityHeatmapLegend.",
      },
      {
        question: "How do I keep colors stable while data streams in?",
        answer:
          "Set the maxSize prop. It fixes the intensity ceiling, so a band of the same size keeps the same color across updates instead of rescaling to each snapshot's maximum.",
      },
      {
        question: "Can I change the units and number formatting?",
        answer:
          "Yes. The unit prop names the size unit, and formatPrice and formatSize replace the default formatters used by the axis, cell labels, tooltip and legend.",
      },
    ],
  },

  "bump-chart": {
    overview:
      "Bump Chart is a React ranking chart that draws how positions change over time as curved lines between rank dots. Curves, dots and end labels share one set of spring-animated coordinates in Framer Motion, so when rankings update everything moves together. Hovering a series isolates it, rank dots open tooltips with the change from the previous period, and a legend pins a series. Missing periods break the line instead of inventing a rank.",
    useWhen: [
      "A sports or esports page shows league standings week by week.",
      "A product analytics dashboard tracks how features, pages or apps move in a top ten list over several months.",
      "A leaderboard or market share report needs to show who climbed and who fell, not just the final order.",
    ],
    accessibility:
      "The chart is an SVG with the img role, a title and a description, followed by a visually hidden table with the exact rank of every series in every period. Each rank dot and legend entry is a button with a descriptive label and a pressed state for the pinned series, and Escape clears the pin. The plot region is focusable so keyboard users can scroll it horizontally. With reduced motion enabled, lines and dots jump to new ranks and skip the reveal, keeping only opacity changes.",
    faq: [
      {
        question: "How do I make a bump chart in React?",
        answer:
          "Pass BumpChart a periods array of labels and a series array where each item has an id, a name, one rank per period and an optional color. Use null for a period with no rank.",
      },
      {
        question: "Can I control which series is highlighted?",
        answer:
          "Yes. Use active with onActiveChange for controlled pinning, or defaultActive to let the chart manage it. Passing null clears the selection.",
      },
      {
        question: "Can I rearrange the plot and legend?",
        answer:
          "Yes. Pass children to BumpChart and place BumpChartPlot and BumpChartLegend wherever you want. The useBumpChart hook reads the shared state from any child.",
      },
    ],
  },

  "order-book": {
    overview:
      "Order Book is a React depth ladder for trading interfaces. You pass bid and ask snapshots, and it combines equal prices, accumulates totals from the best quote outward, and draws depth bars that animate with Framer Motion while the numbers stay still. Hovering a level highlights it and every better level on that side, and OrderBookDepthSummary shows the size, quote value and average fill price to reach it. It composes from OrderBookHeader, OrderBookSide, OrderBookSpread, OrderBookBalance and the useOrderBook hook.",
    useWhen: [
      "A crypto exchange or trading terminal needs a live bid and ask ladder next to a chart.",
      "An order ticket should fill its price when a trader clicks a level in the book.",
      "A trading education or demo page wants to show how deep a market is and what a market order would cost.",
    ],
    accessibility:
      "Asks and bids each render as a labeled HTML table with visually hidden column headers for price, size and cumulative total, and the reference price carries a visually hidden label. When onLevelSelect is set, prices become buttons, and focusing one inspects its depth just like hover. OrderBookDepthSummary is a polite live region, so the fill estimate is announced as it changes. With reduced motion enabled, depth bars and the balance bar update without springing and the size change flash is skipped.",
    faq: [
      {
        question: "How do I build an order book component in React?",
        answer:
          "Render OrderBook with bids and asks arrays of price and size pairs, and supply new arrays whenever the book changes. The levels prop sets how many levels show on each side, and lastPrice sets the reference price.",
      },
      {
        question: "How do I show the cost of filling an order up to a price?",
        answer:
          "Add OrderBookDepthSummary as a child. It totals the inspected levels and shows the average price, size and quote value, and its children prop takes a function for a custom readout.",
      },
      {
        question: "Can I control the inspected level?",
        answer:
          "Yes. activeLevel takes a side and price and pairs with onActiveLevelChange, or use defaultActiveLevel. A level that leaves the book clears the inspection instead of pointing at another row.",
      },
    ],
  },

  "heat-calendar": {
    overview:
      "Heat Calendar is a React contribution graph that shows activity as a grid of weeks and days in a single color, so a stronger shade means more activity. Cells spring in on a diagonal wave with Framer Motion, hovering lifts a cell and ripples its neighbours, and a shared tooltip shows the date and exact count. Clicking a cell anchors a range, and a second click locks the span with its total. The legend doubles as a filter by level.",
    useWhen: [
      "A developer profile or portfolio shows commits or deploys per day, GitHub style.",
      "A habit tracker, fitness or learning app shows streaks and consistency over the last few months.",
      "An internal dashboard needs to total activity between two dates by clicking the start and end days.",
    ],
    accessibility:
      "Every day is a button labeled with its count, unit and date, the selected range ends report a pressed state, and the focused cell is linked to the tooltip with aria-describedby. Escape clears the selection, and legend steps are buttons that filter the grid on focus or click. Hover lifts only run on devices that can hover. With reduced motion enabled, the entrance wave, ripple and press scale are removed and only fades remain.",
    faq: [
      {
        question: "How do I make a GitHub style contribution graph in React?",
        answer:
          "Pass HeatCalendar a values array shaped values[week][day] with intensities from 0 to 1, plus weeks, unit and maxCount, which sets the count an intensity of 1 stands for.",
      },
      {
        question: "Why do the dates appear after the page loads?",
        answer:
          "Without endDate the grid ends on today, which is read after mount so server and client markup match. Pass endDate to render fixed dates immediately. Dates are calculated in UTC.",
      },
      {
        question: "Can I control the selected range?",
        answer:
          "Yes. Use selection with onSelectionChange, or defaultSelection. A selection is a start cell and optional end cell given as zero based week and day coordinates.",
      },
    ],
  },

  "returns-calendar": {
    overview:
      "Returns Calendar is a React heatmap of monthly investment returns, laid out as years by months with a compounded total for each year. Cells tint toward a gain or loss color by magnitude, spring in on a diagonal wave with Framer Motion, and show a tooltip with the exact return. Clicking one month and then another compounds the return across the span, and the year column selects whole years the same way. It composes from ReturnsCalendarGrid, ReturnsCalendarTooltip and the useReturnsCalendar hook.",
    useWhen: [
      "A fund, portfolio or trading strategy page shows monthly performance across several years.",
      "A backtest report needs readers to check the compounded return between any two months.",
      "An investor dashboard compares calendar years side by side with their total returns.",
    ],
    accessibility:
      "Every month and year total is a button whose label reads the period and signed percentage, span ends report a pressed state, and the focused cell is linked to the tooltip with aria-describedby. Escape clears the selection. Hover lifts only run on devices that can hover. With reduced motion enabled, the entrance wave, hover lift and year row replay are removed and only fades remain.",
    faq: [
      {
        question: "How do I build a monthly returns table in React?",
        answer:
          "Pass ReturnsCalendar a years array of row labels and a returns array shaped returns[year][month] in percent, twelve months per row. Missing months count as zero so later positions never shift.",
      },
      {
        question: "How is the span return calculated?",
        answer:
          "Returns are compounded, not added. Each month multiplies by one plus its return, so a span shows the real growth across those months.",
      },
      {
        question: "Can I change the tooltip content?",
        answer:
          "Yes. Pass a function as the child of ReturnsCalendarTooltip. It receives the label, value and note for the current cell or span.",
      },
    ],
  },

  "price-target-fan": {
    overview:
      "Price Target Fan is a React stock chart that shows a price history leading to today and three dashed projections fanning out to analyst high, mean and low price targets. The history draws itself with Framer Motion, the hovered target's projection draws solid and takes over the header, where its price and percentage roll in on a NumberTicker. Scrubbing the history or hovering a target shows a tooltip, and the chart composes from header, plot, axes, history, targets, now, cursor and tooltip parts with a usePriceTargetFan hook.",
    useWhen: [
      "A stock research or brokerage page shows where analysts expect a share price to go over the next twelve months.",
      "An investment newsletter or report wants an interactive version of the consensus price target chart.",
      "A portfolio app shows upside and downside to target next to the current price.",
    ],
    accessibility:
      "The chart is an SVG group labeled with the mean target and current price. The history line is a focusable slider: Arrow Left and Arrow Right step through dates, Home and End jump to the ends, and Escape lets go. Each target is a focusable button that toggles with Enter or Space, reports a pressed state and is linked to the tooltip. With reduced motion enabled, the chart appears finished, the cursor moves without travel and the live ring on the now dot is removed.",
    faq: [
      {
        question: "How do I build an analyst price target chart in React?",
        answer:
          "Pass PriceTargetFan the current price, a targets tuple of high, mean and low (each with key, price and analysts) and an optional history array of ISO date and price points.",
      },
      {
        question: "Does it generate sample data?",
        answer:
          "No. It only draws the data you pass. It throws a RangeError if history dates are not ascending ISO dates, or if there are not exactly three positive targets with unique keys.",
      },
      {
        question: "Can I control which point is shown?",
        answer:
          "Yes. Use active with onActiveChange, or defaultActive. The value is either a history point by date or a target by key.",
      },
    ],
  },

  "voice-orb": {
    overview:
      "Voice Orb is a React voice visualizer for AI voice assistants: a breathing liquid sphere drawn with a WebGL shader, with flowing highlights and three custom pigments. Its silhouette swells with a spring as activity rises, driven by a number, a Framer Motion MotionValue or an audio analyser you provide. The orb pauses when it is offscreen or the tab is hidden, and shows a fallback with an onError callback if WebGL is unavailable.",
    useWhen: [
      "A voice AI assistant needs a visual that reacts while the agent listens or speaks.",
      "A realtime voice chat or call screen wants a calm idle state that comes alive with audio levels.",
      "A landing page for a voice product needs a branded, animated hero element in its own colors.",
    ],
    accessibility:
      "The orb renders with the img role when you pass an aria-label and is hidden from assistive technology when you do not, so a decorative orb adds no noise. It never requests microphone access itself. With reduced motion enabled, the surface stops animating and the silhouette no longer reacts to activity, so the orb stays visible but still.",
    faq: [
      {
        question: "How do I make a voice reactive orb in React?",
        answer:
          "Render VoiceOrb and pass activity as a number from 0 to 1, or as a MotionValue to update it without re-rendering React. For live audio, pass an AnalyserNode through the analyser prop.",
      },
      {
        question: "Does it need access to the microphone?",
        answer:
          "No. The component never asks for the microphone. If you want it to react to audio, create the AudioContext and AnalyserNode in your app and pass the analyser in.",
      },
      {
        question: "How do I change its colors and speed?",
        answer:
          "Pass colors as three hex values for base pigment, highlight and shadow, and set speed. Set active to false to pause the material while keeping the current surface visible.",
      },
    ],
  },

  "message-bubble": {
    overview:
      "Message Bubble is the chat bubble surface for React AI chat and messaging interfaces. It comes in six treatments (solid, soft, tint, outline, ghost and danger), aligns to the start or end independently or from a surrounding Message, and can play a short pop with Framer Motion when a new bubble mounts. MessageBubbleGroup stacks related bubbles tightly, MessageBubbleContent can render as a link or button, and MessageBubbleCollapsible clamps long responses behind a Show more toggle.",
    useWhen: [
      "An AI chat app needs user and assistant bubbles with different tones in the same thread.",
      "A support or messaging inbox groups several short messages from one sender into a compact stack.",
      "A long model response should start collapsed to a few lines so the thread stays scannable.",
    ],
    accessibility:
      "The collapsible toggle is a real button with aria-expanded and aria-controls pointing at the clamped content. The bubble background is a decorative layer hidden from assistive technology, and when MessageBubbleContent renders a link or button it gets a visible focus ring. With reduced motion enabled, the mount pop and size morph are removed, the toggle chevron flips without rotating, and only fades remain.",
    faq: [
      {
        question: "How do I make chat bubbles in React?",
        answer:
          "Wrap content in MessageBubble with a variant and align, and put the text inside MessageBubbleContent. Inside a Message, alignment follows the sender automatically.",
      },
      {
        question: "How do I collapse a long AI response?",
        answer:
          "Wrap the text in MessageBubbleCollapsible inside the bubble content. collapsedLines sets how many lines show (2 to 6), moreLabel and lessLabel change the button text, and open, defaultOpen and onOpenChange control it.",
      },
      {
        question: "Can a bubble be clickable?",
        answer:
          "Yes. Pass a button or anchor element to the render prop of MessageBubbleContent. It keeps the bubble styling and adds hover, press and focus states.",
      },
    ],
  },

  message: {
    overview:
      "Message is a composable conversation row for React AI chat interfaces. Message sets the sender with from (user or assistant) and aligns everything for that side, while MessageAvatar, MessageHeader, MessageContent and MessageFooter fill in identity, metadata and delivery details. MessageGroup stacks consecutive rows, MessageMarker adds centered dividers such as dates, and MessageTyping shows a typing indicator. An opt-in animateIn prop makes a newly sent row rise from the live edge with a Framer Motion spring.",
    useWhen: [
      "An AI assistant chat needs user and assistant rows with avatars, names, timestamps and actions.",
      "A transcript groups consecutive messages from one sender under a single avatar.",
      "A conversation needs inline dividers, such as a date or \"Model changed\", between rows.",
    ],
    accessibility:
      "Each row renders as an article labeled by sender, for example \"user message\", unless you pass your own aria-label. MessageTyping includes a visually hidden label (\"Responding\" by default) so screen readers hear what the dots mean, and a placeholder MessageAvatar is hidden from assistive technology. With reduced motion enabled, the entrance rise and typing bounce are removed and only opacity changes remain.",
    faq: [
      {
        question: "How do I build a chat message list in React?",
        answer:
          "Render one Message per item with from set to user or assistant, and compose MessageAvatar, MessageContent with a MessageBubble, and optional MessageHeader and MessageFooter inside it.",
      },
      {
        question: "Can I use it with the Vercel AI SDK?",
        answer:
          "Yes. Message does not own data or transport, so you map each message from useChat to a Message row, setting from from its role and rendering its parts inside MessageContent.",
      },
      {
        question: "How do I keep grouped messages aligned without repeating the avatar?",
        answer:
          "Wrap the rows in MessageGroup and give later rows a MessageAvatar with placeholder set. It keeps the slot width so content stays aligned.",
      },
    ],
  },

  "message-scroller": {
    overview:
      "Message Scroller is a React chat scroll container built for streaming AI responses. It follows new output while the reader sits at the bottom, stops following as soon as they scroll, swipe or press a key to read earlier messages, and resumes when they return to the live edge. An optional navigation rail lists the rendered messages as ticks with previews, highlights the one in view and scrolls to any message on click.",
    useWhen: [
      "An AI chat app streams long answers and readers need to scroll back without being pulled down.",
      "A long agent transcript needs a compact rail to jump between earlier prompts and replies.",
      "A support chat shows a \"jump to latest\" button when the reader is no longer at the bottom.",
    ],
    accessibility:
      "The viewport is a labeled section, and the content is a log role with a polite live region and aria-busy while you mark it busy, so screen readers hear new messages without interruption. Arrow Up, Page Up and Home, as well as wheel and touch, release following right away. Rail items have labels such as \"Go to user message 2 of 6\". With reduced motion enabled, following and rail navigation jump to position instead of scrolling smoothly.",
    faq: [
      {
        question: "How do I auto scroll a chat to the bottom in React without trapping the reader?",
        answer:
          "Wrap your messages in MessageScroller. followOutput keeps it pinned while the reader is within followThreshold pixels of the end, and onFollowChange reports when they leave or return, for example to show a jump to latest button.",
      },
      {
        question: "How do I add message navigation?",
        answer:
          "Set navigation to rail. The rail reads the rendered Message rows, builds previews from their text and appears once the transcript overflows. navigationLabel names it for screen readers.",
      },
      {
        question: "Can I use it with the Vercel AI SDK?",
        answer:
          "Yes. It only manages the viewport. Render your useChat messages as children and set busy while a response is streaming.",
      },
    ],
  },

  "prompt-input": {
    overview:
      "Prompt Input is an AI chat composer for React. The textarea grows with the prompt between minRows and maxRows, Enter sends and Shift plus Enter adds a line, and the send button swaps into a stop button while a response is loading. It can show a model picker built on the beUI Select and an animated actions menu for things like attachments or tools, with the icon swaps animated by Framer Motion.",
    useWhen: [
      "An AI chat app needs a message box with a model selector and a send or stop button.",
      "An agent workspace needs an actions menu to attach files, add context or pick a tool before sending.",
      "A coding assistant needs a multiline prompt field that grows with the instruction instead of scrolling a single line.",
    ],
    accessibility:
      "The composer is a form with a labeled textarea (\"Prompt\" by default), and the send, stop and actions buttons have labels such as \"Send prompt\", \"Stop generating\" and \"Add to prompt\". Enter submits only when the prompt is not empty and ignores Enter during IME composition, so typing in languages like Japanese or Chinese does not send early. After sending, focus returns to the textarea. With reduced motion enabled, the send and stop swap and the plus icon rotation happen without movement.",
    faq: [
      {
        question: "How do I build a ChatGPT style prompt input in React?",
        answer:
          "Render PromptInput with onSubmit, which receives the trimmed prompt and the selected model. Use value and onValueChange for a controlled draft or defaultValue for uncontrolled.",
      },
      {
        question: "Can I use it with the Vercel AI SDK?",
        answer:
          "Yes. Call your send function from onSubmit, set loading while the response streams, and pass the stop function to onStop so the button stops generation.",
      },
      {
        question: "How do I add a model picker and actions?",
        answer:
          "Pass models as value and label pairs with model or defaultModel and onModelChange. Pass actions with onAction to show the plus menu, and leadingAction for any extra control.",
      },
    ],
  },

  "todo-list": {
    overview:
      "Todo List is a React task plan for AI agents that shows what the agent is working on and what remains. Each task is pending, in progress, completed or cancelled, and its mark morphs between a dashed circle, a progress ring, a check and a cross with Framer Motion. The header shows a rolling completion count, new tasks slide in while the list follows the newest one inside a capped height, and the list collapses on its own once every task is done.",
    useWhen: [
      "A coding agent shows its multi-step plan while it edits files and runs tests.",
      "A research or browsing agent lists the steps it will take and marks each one as it finishes.",
      "A workflow or onboarding checklist needs live status for each step with optional progress.",
    ],
    accessibility:
      "The list is a labeled section whose header is a button with aria-expanded and aria-controls, and the tasks sit in a region labeled by that header. Each task includes a visually hidden status such as \"In progress:\", the count reads \"3 of 5 tasks completed\" for screen readers, and the ordered list is a polite live region. While collapsed, the content is hidden from assistive technology and made inert. With reduced motion enabled, tasks appear without sliding, marks draw instantly and the indeterminate ring stops spinning.",
    faq: [
      {
        question: "How do I show an AI agent's plan in React?",
        answer:
          "Pass TodoList an items array where each task has an id, a title and a status. Add progress from 0 to 100 for an in progress ring, and detail for short metadata such as a file name.",
      },
      {
        question: "Can I stop it from collapsing when all tasks are done?",
        answer:
          "Yes. Set collapseOnComplete to false. When it is on, the list also reopens if a task becomes incomplete again.",
      },
      {
        question: "Can I control whether it is open?",
        answer:
          "Yes. Use open with onOpenChange, or defaultOpen. maxHeight caps the scrolling area, which follows the newest task.",
      },
    ],
  },

  "code-block": {
    overview:
      "Code Block is a syntax highlighted code viewer for AI chat and agent interfaces in React. It highlights with Shiki, keeps line rows stable while code streams in, follows the newest lines inside a capped height, and switches from a Writing badge to Ready when the code is complete. It supports line numbers, highlighted lines, a filename, wrapping and a copy button with confirmation feedback.",
    useWhen: [
      "An AI coding assistant writes a function into the chat and the reader watches it arrive line by line.",
      "An agent response cites a specific part of a file and needs to highlight those lines.",
      "A chat app shows a shell command or JSON payload the user can copy in one click.",
    ],
    accessibility:
      "While streaming, the container is marked aria-busy and the code viewport becomes a polite log region, and both return to normal when the code is complete. The copy button is labeled \"Copy code\" and changes to \"Copied\" after copying, and line numbers cannot be selected, so manual copying takes only code. With reduced motion enabled, the streaming spinner stops and auto following jumps instead of scrolling smoothly.",
    faq: [
      {
        question: "How do I show streaming code from an LLM in React?",
        answer:
          "Pass the code received so far to the code prop with status set to streaming, then switch status to complete when the response ends. Rows stay in place as lines are added.",
      },
      {
        question: "Which languages are highlighted?",
        answer:
          "The language prop accepts typescript, tsx, json, bash, diff and text, and defaults to typescript.",
      },
      {
        question: "Can I change what copy does?",
        answer:
          "Yes. Pass onCopy to replace the default clipboard write, or set copyable to false to hide the button. highlightLines takes line numbers to emphasize.",
      },
    ],
  },

  "approval-card": {
    overview:
      "Approval Card is a human in the loop component for React AI agents. It asks a person to approve, reject or request changes to a proposed action, or to answer questions with single choice, multiple choice or freeform input, including multi-step question flows. Single choices advance to the next question automatically, steps slide between each other with Framer Motion, and once a decision is made the card collapses into a short outcome summary.",
    useWhen: [
      "A coding or operations agent needs sign off before deploying, deleting data or sending email.",
      "An agent is unsure which option the user wants and asks a clarifying question before it continues.",
      "A setup or planning flow collects a few structured answers in sequence before an agent starts work.",
    ],
    accessibility:
      "Single choice questions render as a radio group with radio roles, multiple choice questions as checkboxes, and allowCustom adds a text input. Multi-step flows have labeled Previous question and Next question buttons and a visually hidden \"Question 1 of 3\" counter. The card is marked aria-busy while submitting, and after a decision the controls are hidden from assistive technology and made inert. With reduced motion enabled, question changes swap without sliding and the loading spinner stops.",
    faq: [
      {
        question: "How do I add human in the loop approval to an AI agent in React?",
        answer:
          "Render ApprovalCard with a title and description and pass onApprove. Add onReject or onRequestChanges to show those buttons, and set status to approved, rejected or changes-requested once the decision is made.",
      },
      {
        question: "How do I ask the user a question with options?",
        answer:
          "Pass a questions array. Each question has an id, a title and options, and can set multiple for checkboxes, allowCustom for a freeform field, and autoAdvance false to stop single choices from advancing. onSubmit receives all answers.",
      },
      {
        question: "Can I control the answers and step?",
        answer:
          "Yes. answers with onAnswersChange and step with onStepChange make it controlled, or use defaultAnswers and defaultStep. The result prop sets the summary shown after completion.",
      },
    ],
  },

  "file-diff": {
    overview:
      "File Diff is a React component for showing the file edits an AI agent makes, with syntax-highlighted rows, separate old and new line numbers, and live addition and deletion counts in its header. Rows stream in as you append them to the lines array, the viewport follows new rows inside a capped height, and the panel collapses to a one-line summary when the status turns complete. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A coding agent proposes an edit and the user needs to see exactly which lines change before accepting it.",
      "A chat transcript keeps completed file changes as compact summaries that can be reopened later.",
      "A code review or changelog view shows small patches inline next to the discussion about them.",
    ],
    accessibility:
      "The header is a real button with aria-expanded and aria-controls, and the patch is a labelled region that is hidden from assistive technology and made inert while collapsed, so its rows cannot be tabbed into. The diff viewport is a polite live region, the root sets aria-busy while streaming, and the status icon is labelled \"Applying changes\" or \"Changes applied\". The optional copy button is named \"Copy diff\" and switches to \"Copied\". With reduced motion enabled, the spinner stops, following new rows jumps instead of smooth scrolling, and the panel opens and closes instantly.",
    faq: [
      {
        question: "How do I show a code diff from an AI agent in React?",
        answer:
          "Render FileDiff with a file name and a lines array. Each line has an id and content, plus an optional type of added, removed or context and optional oldLine and newLine numbers. Set status to \"streaming\" while rows arrive and \"complete\" when the edit is done.",
      },
      {
        question: "Can I keep the diff open after it finishes?",
        answer:
          "Yes. Set collapseOnComplete to false, or control the panel with open and onOpenChange. defaultOpen sets the starting state when it is uncontrolled, and the panel reopens if status goes back to \"streaming\".",
      },
      {
        question: "How do I add a copy button to the diff?",
        answer:
          "Pass copyText to copy that string to the clipboard, or onCopy to handle copying yourself. Either one shows the copy button. Use maxHeight to change how tall the viewport grows before it scrolls.",
      },
    ],
  },

  "tool-result": {
    overview:
      "Tool Result is a React disclosure for showing what happened when an AI agent ran a tool, such as a terminal command or an API request. The header shows the tool name, a title, optional meta text and a running, success, error or cancelled status, and each of these rolls into place when it changes. The body follows output as it streams inside a capped height and collapses when the run ends, while ToolResultOutput renders plain output strings with syntax highlighting. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "An agent runs shell commands such as tests or builds, and the user wants the output one click away.",
      "An agent calls an HTTP API and the response should be inspectable without crowding the chat.",
      "A failed tool run needs a clear error state and a way to run it again.",
    ],
    accessibility:
      "The header is a button with aria-expanded and aria-controls, and the output sits in a labelled region with the log role and polite announcements; collapsed content is hidden and inert. The root sets aria-busy while running, and the status is written out as text (Running, Completed, Failed or Cancelled), so it does not rely on color alone. Copy and retry are icon buttons named \"Copy result\" and \"Run again\". With reduced motion enabled, the spinner stops, output follows without smooth scrolling, and the panel opens and closes instantly.",
    faq: [
      {
        question: "How do I display terminal output from an AI agent in React?",
        answer:
          "Render ToolResult with kind=\"terminal\", a tool and a title, and put ToolResultOutput inside it with the output string as children. ToolResultOutput highlights as bash by default and takes a language prop for other formats.",
      },
      {
        question: "How do I add retry and copy buttons?",
        answer:
          "Pass onRetry to show a \"Run again\" button, and copyText or onCopy to show a copy button. Both sit in a footer under the output alongside the current status.",
      },
      {
        question: "Does the tool result collapse automatically?",
        answer:
          "Yes. When status changes from \"running\" to anything else, the panel closes because collapseOnComplete defaults to true. Set it to false to keep it open, or control it with open and onOpenChange. It reopens when status returns to \"running\".",
      },
    ],
  },

  "streaming-response": {
    overview:
      "Streaming Response is a React surface for an AI agent's answer as it streams in. It renders whatever you pass as children, plain text or the output of your Markdown renderer, and styles the paragraphs, lists, links and code inside it. Once streaming stops it reveals copy and retry actions, thumbs up and down feedback for completed answers, and an optional collapsible source list with favicons. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A chatbot streams tokens from a model and needs actions that appear only after the answer settles.",
      "A research or search assistant answers with sources that readers can expand and open.",
      "A product collects helpful or not helpful ratings on generated answers.",
    ],
    accessibility:
      "The content sits in a polite live region so screen readers hear the response as it arrives; set announce to false when a surrounding conversation log already announces new messages. The root sets aria-busy while streaming. Actions have names such as \"Copy response\" and \"Retry response\", the Helpful and Not helpful buttons expose aria-pressed, and the sources toggle uses aria-expanded with aria-controls. With reduced motion enabled, the action row fades in without sliding and the sources panel opens instantly.",
    faq: [
      {
        question: "How do I render a streaming AI response in React?",
        answer:
          "Wrap the response content in StreamingResponse and set status to \"streaming\" while text arrives, then \"complete\" or \"error\". Pass copyText for the copy action and onRetry for the retry action.",
      },
      {
        question: "Does it work with Markdown?",
        answer:
          "Yes. children can be the output of any Markdown renderer. The component styles nested p, ul, ol, a, code and pre elements, and contentClassName lets you adjust them.",
      },
      {
        question: "Can I control the feedback buttons?",
        answer:
          "Pass feedback with onFeedbackChange for controlled use, or defaultFeedback for uncontrolled use. The value is \"up\", \"down\" or null, and pressing the active button again clears it. Set showActions to false to hide the built-in actions entirely.",
      },
    ],
  },

  "image-generation": {
    overview:
      "Image Generation is a React canvas for media that an AI model is still producing. It reserves the final aspect ratio up front, shows an animated dither field while the job is queued or generating, partly reveals the image while refining, and resolves to the finished media when complete, without remounting or shifting the surrounding conversation. An error state dims the media and can show a Try again button. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A chat assistant generates images from a prompt and the reply should hold its space while the job runs.",
      "A design or marketing tool shows several renders in progress, each with its prompt and resolution.",
      "A generation queue needs a clear failed state with a one-click retry.",
    ],
    accessibility:
      "The canvas has the img role with an aria-label built from the status text and the prompt, or from your own label, and the root sets aria-busy while the job is active. The status line underneath is a polite live region, so a change such as \"Generating image\" to \"Image ready\" is announced. The dither field is decorative and hidden from assistive technology. With reduced motion enabled, the dither field is drawn once as a still pattern, the media fades in without blur or scale, and the status mark stops spinning.",
    faq: [
      {
        question: "How do I show an AI image generation loading state in React?",
        answer:
          "Render ImageGeneration with status set to \"queued\", \"generating\", \"refining\", \"complete\" or \"error\", and pass the finished media as children. Set aspectRatio so the frame reserves the right space before the image exists.",
      },
      {
        question: "Does it work with the Next.js Image component?",
        answer:
          "Yes. children accepts an img, a Next.js Image, a canvas, a video or any custom preview, and the component sizes it to cover the frame.",
      },
      {
        question: "Can I change the status text and retry behavior?",
        answer:
          "Use statusText to replace the default message, showStatus to hide the status line, and resolution to change or remove the size badge. Pass onRetry to show a Try again button in the error state, and set interactive to false to stop the dither cluster following the pointer.",
      },
    ],
  },

  "tool-approval": {
    overview:
      "Tool Approval is a React permission card for human-in-the-loop AI agents. It shows which tool wants to run, an optional description and an expandable list of parameters, then offers Allow once, an optional Always allow, and Deny. A status badge follows the request through pending, approving, approved, denied, running, complete and error, and ToolApprovalCode renders commands or code values with syntax highlighting. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A coding agent wants to run a shell command or write to disk and the user must approve it first.",
      "An assistant is about to call an external API that sends email, spends money or changes data.",
      "A user wants to give a trusted tool standing permission so later calls run without asking.",
    ],
    accessibility:
      "Every decision is a real button with visible text, and the \"View details\" toggle uses aria-expanded and aria-controls. Parameters render as a description list, so each label stays paired with its value for screen readers, and collapsed details are hidden and inert. The root sets aria-busy while approving or running, and the status badge spells the state out in words. With reduced motion enabled, the action row fades without sliding, buttons skip their press scale, and the spinner stops.",
    faq: [
      {
        question: "How do I add tool call approval to an AI agent UI in React?",
        answer:
          "Render ToolApproval with tool, an optional description and parameters, and handlers for onApprove and onDeny. Pass onAlwaysAllow as well to show the Always allow button.",
      },
      {
        question: "What happens after the user makes a choice?",
        answer:
          "The action buttons only show while status is \"pending\". Your app updates status to \"approving\", \"approved\", \"denied\", \"running\", \"complete\" or \"error\", the badge follows it, and the details panel closes once the request leaves pending.",
      },
      {
        question: "Can I show the exact command that will run?",
        answer:
          "Yes. Use ToolApprovalCode as a parameter value, passing code and an optional language (bash by default). Long values wrap inside the parameter column instead of clipping.",
      },
    ],
  },

  citations: {
    overview:
      "Citations is a set of React components for grounding AI answers in sources. Citation renders a small numbered inline marker that links to its source, and Citations renders a collapsible Sources list with each source's favicon, title, domain and matching number. CitationList and CitationStack are exported for custom layouts, and rows animate in with Framer Motion as sources stream.",
    useWhen: [
      "A retrieval or RAG chatbot needs to show which documents support each claim.",
      "A web search assistant lists the pages it read, with favicons, so readers can open them.",
      "An internal knowledge tool cites files or notes that have no URL and shows a custom icon instead of a favicon.",
    ],
    accessibility:
      "Inline markers are links named \"View citation 1\" and so on by default; the label prop overrides this, and keeping the number in it lets voice control users say what they see. Each marker links to its source row by id, and rows with a URL are links that open in a new tab with noopener. The Sources toggle is a button with aria-expanded and aria-controls, and favicons are decorative. With reduced motion enabled, rows appear and leave without sliding and the list opens instantly.",
    faq: [
      {
        question: "How do I add citations to AI responses in React?",
        answer:
          "Place Citation inline with a citationId, an index and an idPrefix, then render Citations below the answer with the same citations array and the same idPrefix so each marker links to its row.",
      },
      {
        question: "Where do the source favicons come from?",
        answer:
          "They are derived from each CitationItem's url. If a favicon fails to load, a globe icon is shown instead, and you can pass icon on an item to replace the favicon, for example with a document icon.",
      },
      {
        question: "Can I control whether the sources list is open?",
        answer:
          "Yes. Pass open and onOpenChange for controlled use, or defaultOpen for uncontrolled use (closed by default). The title prop renames the \"Sources\" label.",
      },
    ],
  },

  "agent-activity": {
    overview:
      "Agent Activity is a React disclosure that shows what an AI agent is doing while it works: reasoning steps, plain text, web searches with results, tool calls with addition and deletion counts, and structured execution traces, alone or mixed in order. While the run is active it shows a shimmering status line above a capped viewport that glides to the newest entry. When the run completes it collapses to a derived summary such as \"Thought for 12s\", \"Searched the web\" or \"Ran 3 tools\" that can be reopened. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A reasoning model streams its thinking steps and the chat should show progress without a wall of text.",
      "A research agent searches the web and readers want to see the queries and pages it visited.",
      "A coding agent reads, edits and runs files, and each turn should end with a compact summary of the tools it ran.",
    ],
    accessibility:
      "While working, the header has the status role, so the active label is announced; once complete it becomes a button with aria-expanded and aria-controls that opens a labelled region. Entries render as a list with listitem roles, the root sets aria-busy during the run, and collapsed content is hidden and inert. With reduced motion enabled, the shimmer stops, entries appear without sliding, the stream jumps to the newest entry instead of gliding, and the disclosure opens instantly.",
    faq: [
      {
        question: "How do I show AI agent reasoning steps in React?",
        answer:
          "Pass AgentActivity an items array where each entry has an id and a type of \"step\", \"text\", \"search\", \"tool\" or \"trace\". Append items as events stream, set status to \"working\" and then \"complete\", and pass duration in seconds for the \"Thought for\" summary.",
      },
      {
        question: "Can I change the status and summary text?",
        answer:
          "Yes. activeLabel replaces the working label and summary replaces the derived completed summary. For full control, renderWorkingStatus and renderCompletedStatus render the contents of each header yourself.",
      },
      {
        question: "Can the activity stay open after the run finishes?",
        answer:
          "Set collapseOnComplete to false, or control the completed state with open and onOpenChange (or defaultOpen). The activity always stays expanded while working, and maxHeight sets how tall the viewport grows before the stream starts gliding.",
      },
    ],
  },

  "loading-states": {
    overview:
      "Agent Loading States are three React loading indicators for AI agents, each installed on its own. ThinkingShimmer sweeps a gradient across a short message such as \"Thinking…\". AgentProgress pairs a pulsing dot grid with a verb and a live elapsed timer, like a command line coding agent. ReasoningText cycles through status phrases beside a terminal-style ASCII loader and switches them with a letter cascade, a vertical swap or a character scramble, using Framer Motion.",
    useWhen: [
      "A chat interface needs a quiet placeholder while it waits for the first token.",
      "A long-running agent task should show how long it has been working.",
      "A reasoning model should show rotating phrases such as \"Reading the context\" while it thinks.",
    ],
    accessibility:
      "AgentProgress has the status role with an aria-label such as \"Churning, in progress\", and hides the dot grid and ticking timer from screen readers so the time is not read out every tenth of a second. ReasoningText is a polite status region named by a visually hidden copy of the current phrase, so screen readers get the words rather than the animated letters. With reduced motion enabled, the shimmer sweep stops, AgentProgress pulses opacity without scaling, the cascade shows whole phrases, and the swap fades without moving.",
    faq: [
      {
        question: "How do I make a thinking indicator for an AI chat in React?",
        answer:
          "Render ThinkingShimmer with your message as children (it defaults to \"Thinking…\"). The duration prop sets how many seconds one shimmer pass takes.",
      },
      {
        question: "Can I control the elapsed time in AgentProgress?",
        answer:
          "Yes. Pass elapsedSeconds to drive the timer yourself. Without it, an internal timer starts from initialSeconds and runs while running is true. The label prop sets the verb, which defaults to \"Churning\".",
      },
      {
        question: "How do I change the phrases in ReasoningText?",
        answer:
          "Pass a phrases array and choose variant \"cascade\", \"swap\" or \"scramble\". interval sets how many milliseconds each phrase stays (at least 600), and indicator replaces the default ASCII loader.",
      },
    ],
  },

  "ai-sidebar": {
    overview:
      "AI Sidebar is a React resource tree for AI workspaces that organizes folders, projects, files and bookmarks. Rows can be dragged before, after or into a folder, moved with the keyboard, and renamed inline, and every move applies optimistically then rolls back if your onMove promise rejects. Folders show an open icon when expanded, long labels scroll as a marquee only when they overflow and the row is hovered, and each row has an actions menu that also carries the move commands for touch devices. It is built with Framer Motion and Tailwind CSS and sits inside the Animated Sidebar, which handles collapsing.",
    useWhen: [
      "An AI chat app lets users file conversations into projects and folders in the sidebar.",
      "An agent workspace lists the files, documents and bookmarks the agent can work with.",
      "A research or notes tool needs a drag and drop tree that saves every move to a server.",
    ],
    accessibility:
      "The tree uses the tree and treeitem roles with aria-level, aria-expanded on folders and projects, aria-selected on files and bookmarks, and a single roving tab stop. Arrow Up and Down move between rows, Home and End jump to the ends, Arrow Right and Left expand, collapse or step between parent and child, Enter or Space opens a folder or selects an item, F2 renames, and Shift+F10 or the context menu key opens the row menu. Alt+Shift with an arrow moves a row up, down, into the folder above or out of its parent, and each move, rename failure and rollback is announced in a polite live region. With reduced motion enabled, rows reorder without spring animation and labels do not scroll.",
    faq: [
      {
        question: "How do I build a drag and drop file tree sidebar in React?",
        answer:
          "Pass AISidebar items or defaultItems made of SidebarResource objects with an id, a label, a kind of \"folder\", \"project\", \"file\" or \"bookmark\", and optional children. onItemsChange receives the new tree after each move.",
      },
      {
        question: "How do I save moves and renames to my backend?",
        answer:
          "onMove receives the itemId, targetId and position of each move. Return a promise, and if it rejects the tree rolls back and onMoveError is called. onRename works the same way for inline renames.",
      },
      {
        question: "Can I customize the icons, menu and selection?",
        answer:
          "Yes. renderIcon draws each row's icon, and renderMenu receives the item plus close, rename and moves controls to build your own menu. Use activeId with onActiveChange, or defaultActiveId, to manage the selected resource.",
      },
    ],
  },

  "chat-app": {
    overview:
      "Chat App is a complete AI agent chat workspace for React. ChatApp is the shell: it wraps the Animated Sidebar provider, sets the sidebar width, and folds the sidebar off-canvas when its own box gets too narrow for two panes. Its usage example composes the rest of the beUI agent kit around it, including the AI Sidebar, message scroller, messages, streaming responses, agent activity, todo plans, approvals, tool results, code blocks, file diffs, generated images and the prompt input. Everything is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "You are starting an AI chat product and want a working layout with navigation, conversation and composer already in place.",
      "A coding agent dashboard needs tool calls, approvals and file diffs shown inside one conversation.",
      "A chat panel embedded in a larger page or split view should hide its sidebar when the panel is narrow, not only on phones.",
    ],
    accessibility:
      "ChatApp inherits the Animated Sidebar's behavior: Cmd+B or Ctrl+B toggles the sidebar, and on phone-sized viewports the sidebar opens as a modal dialog that closes with Escape. Each composed part keeps its own semantics, such as the AI Sidebar's keyboard tree, live regions in streaming responses and tool output, and labelled disclosures. With reduced motion enabled, the sidebar uses reduced transitions and each composed part follows its own reduced-motion rules.",
    faq: [
      {
        question: "How do I build a full AI chat interface in React?",
        answer:
          "Install chat-app with the shadcn CLI, which brings the agent components it uses along with a usage example. Wrap your AnimatedSidebar and AnimatedSidebarInset in ChatApp, then place messages, responses and the prompt input inside the inset.",
      },
      {
        question: "Can I control when the sidebar collapses?",
        answer:
          "Yes. collapseSidebarBelow sets the shell width in pixels under which the sidebar folds away (600 by default), and sidebarWidth sets its docked width (17rem by default). Passing open with onOpenChange makes the state fully yours and turns the automatic fitting off.",
      },
      {
        question: "Does it work with Next.js?",
        answer:
          "Yes. The components are client components that render in the Next.js App Router. They take plain props such as status and children, so you can drive them from any streaming backend.",
      },
    ],
  },

  "infinite-masonry": {
    overview:
      "Infinite Masonry is a responsive, virtualized masonry grid for React that measures each card's real height, fits as many lanes as the width allows, and calls onLoadMore as the reader nears the end. Only cards near the viewport are rendered, so long feeds stay fast, and newly loaded cards rise into place with a short staggered spring. It includes loading placeholders, an error card with retry, an empty state and an end state, and is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "An image gallery, moodboard or portfolio shows mixed-height cards in an endless feed.",
      "A social or inspiration feed loads posts page by page as the user scrolls.",
      "A search results page lays out cards of different lengths without wasting vertical space.",
    ],
    accessibility:
      "The feed is a section with an aria-label (\"Infinite masonry feed\" by default, set with ariaLabel) that sets aria-busy while loading, and a polite live region announces \"Loading more items\". Placeholder cards are hidden from assistive technology, and a failed page shows a \"Try again\" button when you pass onRetry. With reduced motion enabled, new cards appear in place without the rise.",
    faq: [
      {
        question: "How do I make an infinite scroll masonry grid in React?",
        answer:
          "Pass items, getItemKey, renderItem, onLoadMore and hasMore, and set loading while a page is being fetched. prefetch (3 by default) controls how close to the end the next load starts.",
      },
      {
        question: "How do I control the number of columns?",
        answer:
          "minColumnWidth (208 by default) and maxColumns (4 by default) decide how many lanes fit, and gap sets the spacing. estimateSize gives a starting height for each card before it is measured.",
      },
      {
        question: "Can I turn off the card entrance animation?",
        answer:
          "Yes. Set animateItems to false. Cards that are already present when the grid mounts never animate, so only items loaded later rise in.",
      },
    ],
  },

  "notification-stack": {
    overview:
      "Notification Stack is a React notification summary built with Framer Motion where cards sit stacked behind one another and spring apart into a readable list on hover, focus or tap. Collapsed, only the newest card is shown with the others peeking out beneath it, and a footer shows the count and a label that rolls to \"View all\" when the list opens. A second activation calls your view-all handler, and an empty state shows when there are no items.",
    useWhen: [
      "A dashboard header or sidebar needs a compact preview of recent notifications that expands on demand.",
      "A home screen or widget wants to show the latest alerts, messages or activity without a full notification center.",
      "A mobile layout needs a tap-to-expand summary that leads to a full notifications page.",
    ],
    accessibility:
      "The whole stack is a single button with aria-expanded and an accessible name that states the notification count and the next action. Keyboard focus expands it, Escape collapses it while keeping focus in place, and tabbing away collapses it. On touch, the first tap expands the stack and a tap outside collapses it. With reduced motion enabled, the cards and footer move between states instantly.",
    faq: [
      {
        question: "How do I make a stacked notification card list in React?",
        answer:
          "Install the block and pass items to NotificationStack, each with an id, a title and optionally a description and trailing content. maxVisible sets how many cards appear in the stack.",
      },
      {
        question: "Can I control whether the stack is expanded?",
        answer:
          "Yes. Pass expanded with onExpandedChange for controlled use, or defaultExpanded for uncontrolled use.",
      },
      {
        question: "How do I link to a full notifications page?",
        answer:
          "Pass onViewAll. When the stack is already expanded, activating it calls onViewAll. collapsedLabel, expandedLabel and emptyLabel change the footer and empty-state text.",
      },
    ],
  },

  "project-folder": {
    overview:
      "Project Folder is an interactive React folder card that fans its file previews out on hover or focus while the back tilts and the front flap folds down. Clicking it morphs the previews into a full-screen overlay grid with shared layout animation, and closing retraces the same path back into the folder. Up to five previews show, and both the fanned state and the overlay can be controlled or left uncontrolled. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A portfolio or dashboard shows projects as folders with a peek at the files inside.",
      "A file manager or asset library wants a playful way to preview a collection before opening it.",
      "A case study page lets visitors open a project to see its screens in a larger grid.",
    ],
    accessibility:
      "The folder is a real button with aria-haspopup set to dialog and aria-expanded. Opening it renders a modal dialog labelled by the project title, moves focus to the close button, keeps Tab inside, closes on Escape or a backdrop click, locks page scroll, and returns focus to the folder once the closing animation finishes. The fan opens on keyboard focus as well as hover, and hover only applies on devices that can hover. With reduced motion enabled, the fan and tilt are removed and the overlay opens and closes without movement.",
    faq: [
      {
        question: "How do I make an animated folder card in React?",
        answer:
          "Render ProjectFolder with a title, an optional description and a previews array of objects with an id and content. count and itemLabel set the footer text, such as \"12 files\".",
      },
      {
        question: "Can I control whether the folder is open?",
        answer:
          "Yes. open, defaultOpen and onOpenChange control the fanned state, and expanded, defaultExpanded and onExpandedChange control the full-screen overlay. disabled turns the folder off.",
      },
      {
        question: "Will the overlay work inside a container with overflow hidden?",
        answer:
          "Yes. The overlay renders into the document body through a portal, so parent clipping and stacking contexts do not affect it.",
      },
    ],
  },

  "card-folder": {
    overview:
      "Card Folder is a React payment card component that shows a landscape card tucked into a stitched purse pocket. Pressing it lifts the card forward while the purse compresses into its bottom seam, and a separate eye button reveals the full card number and CVV with a rolling digit swap. The open state and the detail visibility are each controlled or uncontrolled, and an optional overflow action button sits beside the card. It is built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A fintech or banking app shows a virtual card that users can lift out to view.",
      "A wallet screen hides card numbers by default and reveals them only on request.",
      "A card management page needs a per-card actions button for tasks like freezing or replacing a card.",
    ],
    accessibility:
      "The card is a button with aria-expanded and a default label that reads the title, the last four digits and the expiry, such as \"Open Travel card, card ending in 4242, expires 08/29\"; ariaLabel replaces it. The detail toggle is a separate button named \"Show card details\" or \"Hide card details\" with aria-pressed, and while the card is lifted the purse layer is inert and hidden from assistive technology. With reduced motion enabled, the purse fades instead of compressing and the card does not lift.",
    faq: [
      {
        question: "How do I build an animated credit card component in React?",
        answer:
          "Render CardFolder with title, cardNumber, expiry and cvv, and pass your card artwork as the card prop. cardClassName styles the card surface.",
      },
      {
        question: "How do I hide the card number by default?",
        answer:
          "Details start hidden, showing only the last four digits and a masked CVV. Use defaultDetailsVisible for uncontrolled use, or detailsVisible with onDetailsVisibleChange to control it.",
      },
      {
        question: "Can I add a menu button to the card?",
        answer:
          "Yes. Pass onAction to render an overflow button next to the card, and actionLabel to name it (it defaults to \"Open actions for\" followed by the title).",
      },
    ],
  },

  "knockout-bracket": {
    overview:
      "Fixtures is a React tournament bracket block with two styles that read the same rounds array. Knockout Bracket pages through rounds a few columns at a time, centers each later match between its two feeders, and animates cards, elbow connectors, headers and stage height into each new layout, with an optional third place play-off below. Knockout Wheel lays the same tournament out radially, with the champion at the hub, one ring per round and the teams on the rim, and springs nodes in ring by ring. Both fit any single-elimination draw and are built with Framer Motion and Tailwind CSS.",
    useWhen: [
      "A sports site or app shows a world cup, league cup or playoff bracket with scores and kick-off times.",
      "An esports or gaming tournament page needs custom result badges such as BO5 or Forfeit.",
      "A community or office competition wants a visual of the winner's path to share after the final.",
    ],
    accessibility:
      "The bracket is a labelled section where each round is a named list and each match is a list item labelled with both teams, the kick-off time or result, and the winner, and a polite live region announces which rounds are showing after Previous round or Next round is pressed. In the wheel, every team is a button with a single roving tab stop: Arrow Up moves toward the hub, Arrow Down moves outward, and Arrow Left and Right step around the ring, while a visually hidden list restates every result for screen readers. With reduced motion enabled, paging and the ring-by-ring entrance happen without animation.",
    faq: [
      {
        question: "How do I make a tournament bracket in React?",
        answer:
          "Pass rounds ordered widest first, each with a name and a matches array, where matches[k] of a round is fed by matches 2k and 2k + 1 of the round before it. Each Team takes a name plus a logo URL or a country code for a flag.",
      },
      {
        question: "Can I show a third place match?",
        answer:
          "Yes, in KnockoutBracket. Pass a Match as thirdPlace and it renders under the bracket, and thirdPlaceLabel renames its heading from \"Third place play-off\".",
      },
      {
        question: "Can I start the bracket at a later round?",
        answer:
          "Yes. initialRound on KnockoutBracket sets the leftmost round on mount (1 by default), and on KnockoutWheel it sets the outermost ring and drops earlier rounds (0 by default). Each style installs on its own as knockout-bracket or knockout-wheel.",
      },
    ],
  },

  "availability-scheduler": {
    overview:
      "Availability Scheduler is a weekly availability editor for React, built with Framer Motion and Tailwind CSS. Each day has a switch that springs it between available and unavailable, time ranges add and remove with a short blur and slide while the rows reflow, and start and end times pick from a scrollable dropdown that only offers valid times. A copy menu on every day clones its hours to selected days or to every day at once.",
    useWhen: [
      "A booking or calendar app lets people set the weekly hours when they can be scheduled.",
      "A support or sales team tool records each agent's working hours, including split shifts with more than one range per day.",
      "An onboarding flow asks a new user for their default availability and wants Monday to Friday 9 to 5 as a starting point.",
    ],
    accessibility:
      "Each day uses a switch with the switch role and a label such as \"Toggle Monday availability\", and every icon button carries a descriptive name, such as \"Add time range to Monday\" or \"Copy Monday hours to other days\" (which also reports aria-expanded). Time fields are listbox selects, and the scheduler keeps only one time panel open at a time so keyboard and assistive technology users never end up with two overlapping lists. With reduced motion enabled, layout movement, the slide and blur on ranges and the press scale are removed, and changes fade in place.",
    faq: [
      {
        question: "How do I build a weekly availability picker in React?",
        answer:
          "Install the component and render AvailabilityScheduler. It starts from defaultWeek() (Monday to Friday 9 to 5, weekends off), or you can pass your own WeekAvailability object as defaultValue.",
      },
      {
        question: "Can I control the schedule value and save it?",
        answer:
          "Yes. Pass value and onChange for controlled use. The value is a WeekAvailability record keyed by day (mon to sun), where each day has enabled and a ranges array of start and end times in 24 hour HH:MM strings.",
      },
      {
        question: "How do I change the time interval in the dropdowns?",
        answer:
          "Set the step prop in minutes. It defaults to 30, so step={15} gives quarter hour options. Ranges stay valid because changing one end moves the other onto a neighboring option when needed.",
      },
    ],
  },

  swap: {
    overview:
      "Multi-chain Swap is a cross-chain token swap widget for React, built with Framer Motion and Tailwind CSS. It has a pay and receive field, a flip button that rotates as it swaps the two tokens, a quote row that blurs briefly while the price updates, an optional send-to-address row, and a token picker sheet that slides up with search, chain filters and popular tokens. The action button changes its label to match the state, such as \"Enter an amount\" or \"Insufficient ETH\".",
    useWhen: [
      "A crypto wallet or DeFi app needs a swap screen where users pick tokens across several chains.",
      "A bridge interface wants to show the rate, fee, slippage and estimated time before the user confirms.",
      "A product prototype or landing page needs a realistic, animated swap widget to demonstrate a trading flow.",
    ],
    accessibility:
      "The token picker opens as a dialog with aria-modal, moves focus to its search field and closes with Escape, the backdrop or a labelled Close button. The amount field has a visible label, chain filters report their state with aria-pressed, and icon buttons such as \"Reverse direction\" and \"Clear address\" are labelled. With reduced motion enabled, the flip rotation and press scale are removed and the picker fades in instead of sliding up.",
    faq: [
      {
        question: "How do I make a crypto swap UI in React?",
        answer:
          "Install the block and render MultiChainSwap. It ships with sample chains and tokens, so it works immediately, and you can replace them with the chains and tokens props.",
      },
      {
        question: "Can I use my own tokens and chains?",
        answer:
          "Yes. Pass arrays of Chain (id, name, tone, symbol) and Token (id, symbol, name, chainId, plus optional balance, usd, address and popular) objects, then set defaultFromId and defaultToId to token ids that exist in your list.",
      },
      {
        question: "Does it fetch real quotes?",
        answer:
          "No. The rate is calculated from each token's usd value, and the fee, slippage and time shown are display values. Connect the widget to your own quote and routing backend to place real swaps.",
      },
    ],
  },

  "command-palette": {
    overview:
      "Command Palette is a Cmd K style command menu for React, built with Framer Motion and Tailwind CSS. It opens over the page from a keyboard shortcut, filters commands as you type with ranked fuzzy matching across labels, groups and keywords, and slides a spring highlight between rows. Commands can carry an icon, a group heading, a badge and a keyboard hint.",
    useWhen: [
      "A dashboard or SaaS app wants a keyboard-first way to jump between pages and run actions.",
      "A documentation site needs a quick search over its sections that opens with Cmd K or Ctrl K.",
      "A power-user tool has more actions than fit in its toolbar and needs one searchable place for them.",
    ],
    accessibility:
      "The palette renders as a modal dialog with the search field as a combobox that points at the highlighted row through aria-activedescendant, and results use the listbox and option roles. Cmd K or Ctrl K toggles it, Arrow Up and Arrow Down move the highlight, Enter runs the command and Escape closes. The field takes focus on open and the page behind stops scrolling. With reduced motion enabled, the panel fades in without its slide and scale, and the highlight moves without a spring.",
    faq: [
      {
        question: "How do I add a Cmd K command palette to a React app?",
        answer:
          "Install the component and render CommandPalette with an items array. Each CommandItem needs an id, a label and an onSelect function, and can add group, keywords, icon, badge and hint.",
      },
      {
        question: "Can I change the keyboard shortcut?",
        answer:
          "Yes. Set the shortcut prop to another letter. It defaults to \"k\" and is always combined with Cmd on macOS or Ctrl elsewhere.",
      },
      {
        question: "Can I open the palette from a button?",
        answer:
          "Yes. Pass open and onOpenChange to control it, then set open to true from your own button. The keyboard shortcut and Escape still call onOpenChange.",
      },
    ],
  },

  "morphing-search": {
    overview:
      "Morphing Search is a pair of animated search components for React, built with Framer Motion and Tailwind CSS. Morphing Search turns a search field or a compact search icon into a results panel that grows out of the same shell, opened by a click or a single-key shortcut, and folds back on close. Chip Search is a docked search bar that widens on focus, unfolds a recent searches and suggestions panel from its own edge, and turns each term into a removable chip that the bar grows to fit.",
    useWhen: [
      "A site header needs a small search icon that expands into full results without navigating to a search page.",
      "A product catalog or file browser filters by several terms at once and shows each active filter as a chip.",
      "An app wants to remember recent searches and offer suggestions as the user types.",
    ],
    accessibility:
      "Both use a combobox input that tracks the active option through aria-activedescendant, with results in a listbox. Morphing Search opens as a modal dialog, traps Tab inside it, closes with Escape and returns focus to where it was; its shortcut is ignored while typing in another field. Chip Search adds Enter to add a chip, a two step Backspace that first selects and then removes the last chip, arrow keys to move between chips, Delete to remove a highlighted recent search, Escape that clears the query before closing, and polite announcements. With reduced motion enabled, the morphs and chip springs are replaced by instant or fade-only changes.",
    faq: [
      {
        question: "How do I make an expanding search bar in React?",
        answer:
          "Install @beui/morphing-search and render MorphingSearch with an items array of id and title objects. Add iconOnly to start from a compact icon, and handle picks with onSelect or each item's own onSelect.",
      },
      {
        question: "How do I build a search with filter chips?",
        answer:
          "Install @beui/morphing-search-chips and render MorphingSearchChips with suggestions. Use chips with onChipsChange for controlled filters, maxChips to cap them, and storageKey to keep recent searches in localStorage.",
      },
      {
        question: "Can I use server-side search results?",
        answer:
          "Yes. On MorphingSearchChips, set filter={false} to show your suggestions as given, update them from onQueryChange, and set loading while the request runs. On MorphingSearch, onQueryChange reports each query so you can replace items.",
      },
    ],
  },

  "expandable-action-bar": {
    overview:
      "Expandable Action Bar is a floating toolbar for React that shows compact icon actions and expands them into labeled controls on hover or keyboard focus, built with Framer Motion and Tailwind CSS. A highlight pill glides to the hovered or active item, labels and optional shortcuts slide in with a light blur, and badges sit on the icons. On touch screens the first tap expands the bar and the second runs the action.",
    useWhen: [
      "An editor or canvas app needs a compact floating toolbar that reveals what each icon does on demand.",
      "A mobile web app wants a bottom action bar where a first tap shows labels so users do not trigger an unknown icon.",
      "A media or document viewer needs quick actions with notification badges and keyboard shortcut hints.",
    ],
    accessibility:
      "Every action is a real button, and a string label is also set as the button's title, so icon-only items keep a name while the visible label is collapsed. Focusing any action expands the whole bar, and moving focus out collapses it again. With reduced motion enabled, labels appear and disappear without sliding or blurring and the press scale is removed.",
    faq: [
      {
        question: "How do I make an expandable toolbar in React?",
        answer:
          "Install the block and render ExpandableActionBar with an items array. Each item needs an id, a label and an icon, and can add onClick, disabled, active, badge and shortcut.",
      },
      {
        question: "Can I keep the bar expanded or control it myself?",
        answer:
          "Yes. Pass expanded and onExpandedChange to control it, or defaultExpanded for the starting state. Set expandOnHover or expandOnFocus to false to turn off either trigger, and collapseDelay to change how long it waits before collapsing.",
      },
      {
        question: "How do I show which action is selected?",
        answer:
          "Pass activeId, or set active on an item, and the highlight rests there. The useExpandableActionBar hook returns expanded, activeId and their setters if you want simple local state.",
      },
    ],
  },

  "overflow-actions": {
    overview:
      "Overflow Actions is a connected pill toolbar for React that keeps primary actions visible and springs open to reveal extra controls behind a more button, built with Framer Motion and Tailwind CSS. The rail resizes on a spring, overflow actions fade and slide into place, and the toggle swaps its more icon for a close icon. It works as a compact alternative to a dropdown menu for a handful of secondary actions.",
    useWhen: [
      "A list row or card has two main actions and a few secondary ones like archive, duplicate or share.",
      "A floating editor toolbar should stay small until the user asks for more tools.",
      "A mobile layout has no room for every action but a dropdown menu would feel heavy.",
    ],
    accessibility:
      "The toggle is a button with aria-expanded, aria-controls pointing at the revealed group, and a label that switches between openLabel and closeLabel. Each action is a real button and accepts an ariaLabel for icon-only items. With reduced motion enabled, the rail and actions change size and position instantly and only fade, and hover and press scaling are removed.",
    faq: [
      {
        question: "How do I make a more actions button that expands inline in React?",
        answer:
          "Install the block and render OverflowActions with primaryActions and overflowActions arrays. Each item needs an id and a label, and can add icon, onClick, disabled and ariaLabel.",
      },
      {
        question: "Can I close the extra actions after one is clicked?",
        answer:
          "Yes. Set collapseOnAction and the rail closes after any action runs. onAction also reports which item was clicked.",
      },
      {
        question: "Can I control whether it is open?",
        answer:
          "Yes. Pass expanded and onExpandedChange for controlled use, or defaultExpanded to start open. openLabel and closeLabel change the toggle's accessible name.",
      },
    ],
  },

  "expandable-tabs": {
    overview:
      "Expandable Tabs is an icon tab bar for React where the selected tab expands into a labeled pill and a panel opens above the bar, built with Framer Motion and Tailwind CSS. The whole surface resizes on a spring to fit each panel, and content slides in from the direction of the tab you picked. Clicking the active tab again, clicking outside or pressing Escape closes it back to the bar.",
    useWhen: [
      "A mobile web app needs a bottom navigation bar that reveals a quick panel for each section.",
      "A floating toolbar should show settings, notifications or a profile card without opening a full page.",
      "A compact widget needs icon-only tabs that still show the current label when selected.",
    ],
    accessibility:
      "The bar renders as a tablist, and each trigger has the tab role, aria-selected and an aria-label from its label, so icon-only tabs still have a name. Escape and a click outside close the open panel. With reduced motion enabled, the surface resizes instantly and panel content swaps with a short fade instead of sliding.",
    faq: [
      {
        question: "How do I make expandable icon tabs in React?",
        answer:
          "Install the block and render ExpandableTabs with an items array. Each item needs an id, a string label, an icon and the content to show in its panel.",
      },
      {
        question: "Can I control which tab is open?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. A value of null means every panel is closed and only the bar shows.",
      },
      {
        question: "Can I style the bar and the active pill?",
        answer:
          "Yes. className styles the root, and classNames takes root, panel, bar, tab, activeTab, icon, label and pill for each part.",
      },
    ],
  },

  "morphing-tabs": {
    overview:
      "Morphing Tabs is a browser-style tab strip for React whose selected tab grows into the content surface below it, built with Framer Motion and Tailwind CSS. The active shape glides as you switch tabs, tabs can be reordered by dragging or from the keyboard, and each tab can show a close button. Content cross-fades with a short blur when the selection changes.",
    useWhen: [
      "A workspace or editor app shows open documents as tabs that users rearrange and close.",
      "A dashboard groups views into rooms or sections that should feel like one connected surface.",
      "A settings or profile page wants tabs that read as part of the panel instead of a separate control.",
    ],
    accessibility:
      "Tabs sit in a tablist with an ariaLabel, each tab has the tab role, aria-selected and aria-controls pointing at a single tabpanel, and only the selected tab is in the tab order. Arrow Left and Arrow Right select and focus the previous or next tab with wrap-around, and Alt with an arrow key moves the focused tab. Close buttons are labelled \"Close\" plus the tab name. With reduced motion enabled, the active shape moves instantly and content fades without the slide and blur.",
    faq: [
      {
        question: "How do I make reorderable tabs in React?",
        answer:
          "Install the block and render MorphingTabs with items that each have an id, label and content. Listen to onOrderChange, which reports the new id order once after a drag or keyboard move, and store it.",
      },
      {
        question: "How do I add closable tabs?",
        answer:
          "Pass an onClose callback. Every tab then shows a close button, and onClose receives the tab id so you can remove it from items.",
      },
      {
        question: "Can I control the selected tab?",
        answer:
          "Yes. Pass value and onValueChange for controlled use, or defaultValue for uncontrolled use. Items can also set disabled and an optional icon.",
      },
    ],
  },

  "swipeable-list": {
    overview:
      "Swipeable List is a React list whose rows swipe left or right to reveal contextual action buttons, built with Framer Motion. Each row can carry its own leftActions and rightActions, and a release settles the row open or closed on a spring that carries the swipe velocity, so short flicks and slow drags both feel direct. Only one row is open at a time, and rows support a title, description, leading element, meta text or fully custom content.",
    useWhen: [
      "An inbox or notification list needs swipe to archive, delete or mark as read on mobile.",
      "A task or shopping list wants quick actions like complete, pin or remove without opening each item.",
      "A chat or contacts list should reveal call, mute or block actions with a swipe like a native app.",
    ],
    accessibility:
      "Actions are real buttons, each with an accessible label taken from its label. Each row has a toggle button, named \"Actions for\" plus the row title, that appears when it receives keyboard focus: Arrow Left and Arrow Right open the matching side the way a swipe would, Enter or Space opens the trailing actions, and Escape closes the row. While a row is closed, its action rail is inert and hidden from assistive technology. Rows can also be opened from code through the value prop. Vertical page scrolling keeps working through the rows because they only claim horizontal swipes. With reduced motion enabled, rows jump to their open or closed position without the spring.",
    faq: [
      {
        question: "How do I make swipe to delete list items in React?",
        answer:
          "Install the block and pass items to SwipeableList, giving each item rightActions or leftActions with an id, label, icon and optional tone such as danger. Handle the result in each action's onClick or in the list's onAction callback.",
      },
      {
        question: "Can I control which row is open?",
        answer:
          "Yes. Pass value and onValueChange, where the value is an object with the row id and side, or null when every row is closed. defaultValue works for uncontrolled use, and closeOnAction closes the row after an action runs.",
      },
      {
        question: "Can I render custom row content?",
        answer:
          "Use renderItem to render each row yourself, or set content on an item. classNames lets you style the root, item, rail, action buttons and surface.",
      },
    ],
  },

  "file-upload": {
    overview:
      "File Upload is two drag and drop upload components for React, built with Framer Motion and Tailwind CSS. Attachment Upload is an attachment workspace with a dropzone, staggered rows for files, links, images and audio, upload, success, failure and removal feedback, image previews that open into a larger view through shared layout, and an audio row with a waveform and play control. Upload Queue is a simpler progress list with per-file status, retry and remove actions.",
    useWhen: [
      "A chat, ticketing or email composer needs to attach mixed files, images and voice notes.",
      "A form uploads documents and should show progress, failures and a retry for each file.",
      "A media library or CMS lets people drop several files at once and preview images before saving.",
    ],
    accessibility:
      "Both components open the native file picker from a real button and keep a labelled file input behind it, and progress uses the progressbar role. Row actions are labelled per file, such as \"Retry\" or \"Remove\" plus the file name. In Attachment Upload the image preview is a modal dialog that moves focus to its close button, closes with Escape and returns focus afterward. With reduced motion enabled, rows appear without sliding, shared layout previews are skipped and the upload and removal feedback is shortened.",
    faq: [
      {
        question: "How do I make a drag and drop file upload in React?",
        answer:
          "Install @beui/file-upload for the queue or @beui/attachment-upload for the attachment workspace. Both accept accept, multiple, maxFiles and disabled, and report new files through onFilesAdded.",
      },
      {
        question: "How do I show real upload progress?",
        answer:
          "Use FileUpload in controlled mode with value and onValueChange, and update each item's progress (0 to 100) and status (queued, uploading, success or error) as your upload runs. onRetry and onRemove fire from the row buttons.",
      },
      {
        question: "Can I limit file size?",
        answer:
          "AttachmentUpload has maxFileSize (500 MB by default) and maxFiles (12 by default), and calls onFilesRejected with the files and a reason of too-large or max-files.",
      },
    ],
  },

  "prediction-market": {
    overview:
      "Prediction Market is a set of trading components for React, built with Framer Motion and Tailwind CSS. Market Cards show a market title, outcomes with probability bars, payout multipliers, a volume sparkline and a bookmark, and each odds button rolls from its price into a Yes or No label on hover or keyboard focus. The Trade Ticket has buy and sell modes, outcome selection, an amount field with quick add chips and Max, a payout figure that animates as it changes, and a trade button with loading, filled and error states.",
    useWhen: [
      "A prediction market or betting app needs listing cards for its markets page.",
      "A trading screen needs an order ticket that quotes the payout before the user confirms.",
      "A fintech prototype wants a polished buy and sell flow with clear validation feedback.",
    ],
    accessibility:
      "Each market card is an article labelled by its title, odds buttons are named like \"Trade Up at 9%\", and the bookmark is a toggle button with aria-pressed. In the trade ticket, mode and outcome use tab controls, the amount field is labelled Amount or Shares, and the trade button reports its state through its label. With reduced motion enabled, the invalid-amount shake, press scaling and the bookmark pop are removed, and probability bars update without animation.",
    faq: [
      {
        question: "How do I build a prediction market UI in React?",
        answer:
          "Install @beui/prediction-market-card for listings and @beui/prediction-market for the ticket. Render PredictionMarketCard with title, volume and outcomes, and PredictionMarket with your outcomes, each having an id, label and price.",
      },
      {
        question: "How do I place a trade from the ticket?",
        answer:
          "Pass onTrade, which receives the order (mode, outcomeId, amount) and the computed quote once the trade button finishes. Set balance, positions and minTrade so validation matches the user's account.",
      },
      {
        question: "Can I handle signed out users?",
        answer:
          "Yes. Set authenticated to false and the ticket shows a Connect button that calls onSignIn instead of trading.",
      },
    ],
  },

  "wallet-card": {
    overview:
      "Wallet Card is a composed React wallet overview card for crypto and fintech interfaces, built with Framer Motion. Its account switcher and search icon morph open into full-width panels from their triggers, the balance swaps with a per-letter cascade, a change pill reports balance moves, and a privacy toggle masks the balance. Each account row has a copy-address button, and Send, Deposit, Swap and Buy actions are plain callbacks you connect to your own flows.",
    useWhen: [
      "A web3 wallet or dApp needs a home card that shows the active account, balance and primary actions.",
      "A fintech or banking dashboard wants a balance card with a hide balance toggle and quick actions.",
      "A multi-account app needs an account switcher with copyable addresses in a compact space.",
    ],
    accessibility:
      "Icon-only controls carry labels such as \"Notifications\", \"Search\" and \"Copy address\", and the balance toggle is a button that switches between \"Show balance\" and \"Hide balance\" with aria-pressed. The account list uses listbox and option roles with the current account marked selected. The search field takes focus when it opens, Enter submits and Escape closes it, and both panels close on Escape or a click outside. With reduced motion enabled, the panel morphs and list staggers become instant and the change pill and action presses no longer move.",
    faq: [
      {
        question: "How do I build a crypto wallet card in React?",
        answer:
          "Install the block and render WalletCard with an accounts array of id, name and address, plus a balance number. Connect onSend, onDeposit, onSwap and onBuy to your own flows.",
      },
      {
        question: "Can I control the selected account?",
        answer:
          "Yes. Pass accountId with onAccountChange for controlled use, or defaultAccountId to let the card manage it.",
      },
      {
        question: "How do I wire up search and notifications?",
        answer:
          "Use onSearchChange and onSearchSubmit for the search panel, searchRecent for recent terms and searchPlaceholder for its hint. Set hasNotifications to show the unread pulse and onNotifications to handle the bell.",
      },
    ],
  },

  "otp-input": {
    overview:
      "OTP Input is a one-time code input for React, built with Framer Motion and Tailwind CSS. A focus ring glides between slots, each digit rolls into place, an error status shakes the row and a success status draws a check. It handles typing, pasting a full code and SMS autofill, and can mask digits as dots.",
    useWhen: [
      "A login or sign-up flow verifies an email or phone number with a six digit code.",
      "A two factor authentication screen asks for a code from an authenticator app.",
      "A payment or account change needs a confirmation code before it continues.",
    ],
    accessibility:
      "One real input with inputMode numeric and autoComplete one-time-code sits over the slots, so mobile keyboards show digits and SMS codes can autofill. It has an aria-label (\"One-time passcode\" by default) and sets aria-invalid when status is error. Digits fill the active slot, Backspace and Delete clear, Arrow Left, Arrow Right, Home and End move between slots, and each change is announced through a polite live region (masked codes say \"Filled\" instead of the digit), along with hint, error and success messages. With reduced motion enabled, the shake is skipped and states change with fades only.",
    faq: [
      {
        question: "How do I make an OTP input in React?",
        answer:
          "Install the block and render OTPInput. It has six slots by default, set by length, and calls onComplete with the code once every slot is filled.",
      },
      {
        question: "How do I show that the code was wrong?",
        answer:
          "Set status to \"error\" and pass errorMessage. The row shakes and the message appears below. Set status to \"success\" with successMessage to draw the check.",
      },
      {
        question: "Does it support paste and SMS autofill?",
        answer:
          "Yes. Pasted text is stripped to digits and spread across the slots from the active one, and autofilled codes fill from the start. Use mask to show dots instead of digits.",
      },
    ],
  },

  "signup-form": {
    overview:
      "Sign Up Form is a complete registration form for React with name, email, password, confirm password and terms fields, built with Framer Motion and Tailwind CSS. Errors only appear once a field has been left, then clear as soon as it is fixed, so nobody is flagged while still typing. It includes a password reveal toggle, a length-weighted strength meter and a submit button that moves through loading, success and error states from the promise you return.",
    useWhen: [
      "A SaaS product needs a ready sign-up page that validates politely without extra libraries.",
      "An onboarding flow wants a password strength hint that rewards length over symbol rules.",
      "A landing page collects accounts and needs clear loading and failure feedback on submit.",
    ],
    accessibility:
      "Each field has a visible label and a suitable autocomplete value, invalid fields set aria-invalid and point to their error message, and errors render with the alert role so they are announced. The strength label updates in a polite live region, the reveal button is labelled \"Show password\" or \"Hide password\", and a form-level error message is linked to the submit button. With reduced motion enabled, messages and the strength meter fade without sliding or blurring.",
    faq: [
      {
        question: "How do I make a sign up form in React?",
        answer:
          "Install the block and render SignUpForm with an onSubmit handler. onSubmit only receives valid values, and if it returns a promise the button shows loading, then success or error when it settles.",
      },
      {
        question: "Can I use my own validation, such as a schema library?",
        answer:
          "Yes. Pass validate, a function that takes the values and returns an object with a message for each invalid field. It replaces the built-in rules.",
      },
      {
        question: "How is password strength calculated?",
        answer:
          "The exported passwordStrength function scores mainly by length, with a small bonus for using three character types, and returns 0 to 4. Set strengthMeter to false to hide the meter.",
      },
    ],
  },

  "card-dealer": {
    overview:
      "Card Dealer is a React card table built with Framer Motion. It lays out a face-down deck, a fanned hand and a tilted discard pile, and you move a card by changing its zone. Every card stays mounted, so the change becomes a flight: the card arcs across the table on motion's arc() path and flips face up or down in 3D on the way. Several cards moving at once leave one after another, and reordering the hand makes cards hop over each other into their new slots. Faces and backs are yours to render.",
    useWhen: [
      "A card game, flashcard app or quiz needs to deal, play and collect cards with motion people expect from a real table.",
      "An onboarding flow or pricing page wants to deal out steps or plans as cards that can be picked and played.",
      "A landing page or demo wants a playful, tactile showcase of arc and flip motion.",
    ],
    accessibility:
      "The table is a labelled region. With onCardSelect, each hand card is a button named by its label, and the hand renders in fan order so Tab moves through it left to right. Focusing a card lifts it and parts its neighbours the same way hovering does. Deck and pile cards are decorative. With reduced motion enabled, cards move and flip instantly with no arc, stagger or lift animation.",
    faq: [
      {
        question: "How do I deal a card?",
        answer:
          "Change the card's zone from deck to hand in your state. The component animates the move; you never call an animation yourself. Moving a card to the end of your array puts it on top of its new zone.",
      },
      {
        question: "Can I use my own card design?",
        answer:
          "Yes. renderFace draws the front of every card and renderBack the back shown in the deck. Pass cardWidth and cardHeight to change the card size.",
      },
      {
        question: "Does it need playing cards?",
        answer:
          "No. A card is any object with an id, a zone and a label, so the same table works for flashcards, plans, steps or photos.",
      },
    ],
  },
  "bloom-menu": {
    overview:
      "Bloom Menu is a React button that morphs into a menu panel using a Framer Motion shared layout animation. When it opens, the grid of options reveals from the center outward like an iris, and each option fades and scales in with a stagger based on its distance from the middle. It ships with a set of create actions (doc, board, table, folder, reminder, link) that you can replace with your own items and icons.",
    useWhen: [
      "A productivity or notes app needs a Create button that opens a grid of new item types.",
      "A dashboard or toolbar wants a compact quick actions menu that expands in place instead of opening a dropdown.",
      "A landing page or demo wants a playful menu reveal that showcases motion.",
    ],
    accessibility:
      "The trigger is a button with aria-haspopup and aria-expanded, and the open panel is a labelled menu whose options have the menuitem role. Focus moves into the menu on open, arrow keys move across the grid, Home and End jump to the first and last option, and Escape or a click outside closes it and returns focus to the trigger. With reduced motion enabled, the morph shortens to a quick transition, the iris reveal is skipped, and options fade in together without scaling or blur.",
    faq: [
      {
        question: "How do I make a button that morphs into a menu in React?",
        answer:
          "Install the block and render BloomMenu. Pass items as an array of label and icon pairs, and onSelect to receive the chosen label; the menu closes after a selection.",
      },
      {
        question: "Can I use my own icons and options?",
        answer:
          "Yes. Each item in the items prop takes any icon component that accepts a className. The grid lays items out in three columns.",
      },
      {
        question: "Does it work with Next.js?",
        answer:
          "Yes. It is a client component with no portal or browser-only setup, so it renders inside any Next.js page or layout.",
      },
    ],
  },

  "feedback-widget": {
    overview:
      "Feedback Widget is a floating feedback button for React that morphs open from the screen corner into a small popup, built with Framer Motion and Tailwind CSS. Users type a message and submit it, the button shows a sending state, a check draws on success and the popup closes on its own, while a failed send keeps the message and offers a retry. It sits in the bottom right or bottom left corner.",
    useWhen: [
      "A beta product wants a lightweight way to collect bug reports and ideas from any page.",
      "A documentation site asks readers for feedback without sending them to a separate form.",
      "An internal tool needs a quick channel for staff to report problems.",
    ],
    accessibility:
      "The corner trigger is a button named by the title prop with aria-haspopup set to dialog, and the message field is labelled by the popup title. The field takes focus once the popup has opened, Escape or a click outside closes it except while a message is sending, and a failed send is shown in an element with the alert role. With reduced motion enabled, the panel content fades in and out without sliding, scaling or blurring, and the field is focused right away.",
    faq: [
      {
        question: "How do I add a feedback button to a React app?",
        answer:
          "Install the block and render FeedbackWidget near the root of your layout with an onSubmit handler. onSubmit receives an object with the message.",
      },
      {
        question: "How do I send the feedback to my backend?",
        answer:
          "Make onSubmit async and post the message inside it. The widget shows Sending until the promise resolves, shows success when it does, and switches to a retry state if it throws.",
      },
      {
        question: "Can I move it to the left corner or change the text?",
        answer:
          "Yes. Set position to \"bottom-left\", and use title, placeholder and icon to change the heading, the field hint and the trigger icon.",
      },
    ],
  },

  "not-found": {
    overview:
      "404 / Not Found is a set of five animated 404 pages for React, built with Framer Motion and Tailwind CSS. Glitch scrambles the code through random characters before it settles and splits it into color channels on hover, Magnetic pulls each digit toward the cursor, Spotlight reveals the code under a cursor-tracked light, Stacked fans out a deck of cards on hover, and Terminal types out a failed command and a 404 status. Every version shares the same title, description and two call-to-action links.",
    useWhen: [
      "A Next.js or React app needs a branded not found page instead of the default one.",
      "A portfolio or product site wants a playful error page that still points people back home.",
      "A developer tool or documentation site wants a terminal-style 404 that fits its look.",
    ],
    accessibility:
      "Each version renders the code in a heading and uses real links for the Back home and Browse actions. Magnetic and Spotlight give the heading the code as its label while their decorative layers are hidden from assistive technology. With reduced motion enabled, Glitch shows the code without scrambling, Magnetic, Spotlight and Stacked turn off their cursor and hover effects, and the same effects stay off on touch devices.",
    faq: [
      {
        question: "How do I make a custom 404 page in Next.js?",
        answer:
          "Install one version, such as @beui/not-found-glitch, and render NotFoundGlitch from your app/not-found.tsx file. Each version is a separate install, so you only ship the one you use.",
      },
      {
        question: "Can I change the text and links?",
        answer:
          "Yes. Every version takes code, title, description, homeHref, homeLabel, browseHref and browseLabel, so you can point the buttons at your own routes.",
      },
      {
        question: "Can I use it for other error codes?",
        answer:
          "Yes. Set the code prop to any string, for example \"500\", and update title and description to match.",
      },
    ],
  },
};

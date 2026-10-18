// biome-ignore-all lint/suspicious/noTemplateCurlyInString: code samples are stored as plain strings.
import type { SeoPage } from "@/lib/seo-pages/types";

export const guidePages: SeoPage[] = [
  {
    "slug": "framer-motion-animated-tabs",
    "title": "Framer Motion Animated Tabs with a Sliding Indicator",
    "description": "Build animated React tabs with a sliding indicator using Framer Motion layoutId, then drop in the free beUI Tabs component with pill, segment and underline styles.",
    "heading": "How to build animated tabs with a sliding indicator in Framer Motion",
    "intro": "A sliding tab indicator is one of the most common Framer Motion patterns, and it takes surprisingly little code once you know about layoutId. This guide builds the technique from scratch, explains the details that make it feel right, and then shows the beUI Tabs component, which packages the same idea with overflow scrolling, icons and three visual styles.",
    "sections": [
      {
        "heading": "How does a layoutId tab indicator work?",
        "paragraphs": [
          "Render the indicator only inside the selected tab and give it the same layoutId everywhere. When the selection changes, the old indicator unmounts and a new one mounts inside a different button. Because both share a layoutId, Framer Motion treats them as one element: it measures where the new box is, starts it at the old box's position and size, and animates the difference with transforms.",
          "That means you never calculate offsets or widths yourself. The indicator can be absolutely positioned to fill its button, and tabs of any width work, because the animation is measured from the real layout on every change."
        ]
      },
      {
        "heading": "A sliding tabs component from scratch",
        "paragraphs": [
          "The snippet below is a complete, working version. The indicator sits behind the label, which gets relative z-10 so the text stays on top. A spring transition gives the slide a natural settle."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { motion } from \"motion/react\";\nimport { useId, useState } from \"react\";\n\nconst tabs = [\"Overview\", \"Activity\", \"Settings\"];\n\nexport function SlidingTabs() {\n  const [active, setActive] = useState(tabs[0]);\n  // A unique id per instance, so two tab bars on one page never share an indicator.\n  const indicatorId = useId();\n\n  return (\n    <div role=\"tablist\" className=\"inline-flex gap-1 rounded-full bg-neutral-100 p-1\">\n      {tabs.map((tab) => (\n        <button\n          key={tab}\n          type=\"button\"\n          role=\"tab\"\n          aria-selected={active === tab}\n          onClick={() => setActive(tab)}\n          className=\"relative rounded-full px-3.5 py-1.5 text-sm font-medium\"\n        >\n          {active === tab ? (\n            <motion.span\n              layoutId={indicatorId}\n              // Set the radius in style so Motion can correct it while the box scales.\n              style={{ borderRadius: 9999 }}\n              transition={{ type: \"spring\", stiffness: 400, damping: 36 }}\n              className=\"absolute inset-0 bg-white shadow-sm\"\n            />\n          ) : null}\n          <span className=\"relative z-10\">{tab}</span>\n        </button>\n      ))}\n    </div>\n  );\n}",
          "lang": "tsx",
          "filename": "sliding-tabs.tsx"
        },
        "list": [
          "Use a unique layoutId per tab bar (useId works). Two bars sharing a string id would pass one indicator between them.",
          "Put borderRadius in style, not only in a class. Framer Motion animates layout with scale, and it can only counter-correct corner radius values it knows about.",
          "Pick a spring that settles without much overshoot. A bouncy indicator in a scrollable list can briefly push past the edge and flash a scrollbar."
        ]
      },
      {
        "heading": "Install the beUI Tabs component",
        "paragraphs": [
          "If you want the pattern ready-made, beUI ships Tabs as copy-paste source through the shadcn CLI. The command adds the file to components/motion/tabs.tsx along with the small helpers it imports, so you own and can edit the code."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/tabs",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "Using Tabs, TabsList, TabsTrigger and TabsContent",
        "paragraphs": [
          "The API is composable: Tabs holds the value, TabsList renders the tablist, TabsTrigger renders each tab and TabsContent shows the matching panel. The variant prop switches between pill, segment and underline styles, and icons=\"selected\" springs a trigger's icon open only on the selected tab.",
          "For controlled state, pass value and onValueChange instead of defaultValue. When the triggers do not fit, TabsList fades the edges and adds scroll buttons, and it scrolls the selected tab into view."
        ],
        "code": {
          "code": "import { BarChart3, Bell, Home } from \"lucide-react\";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/motion/tabs\";\n\nexport function DashboardTabs() {\n  return (\n    <Tabs defaultValue=\"home\" variant=\"pill\" icons=\"selected\">\n      <TabsList>\n        <TabsTrigger value=\"home\" icon={<Home className=\"size-3.5\" />}>Home</TabsTrigger>\n        <TabsTrigger value=\"stats\" icon={<BarChart3 className=\"size-3.5\" />}>Stats</TabsTrigger>\n        <TabsTrigger value=\"alerts\" icon={<Bell className=\"size-3.5\" />}>Alerts</TabsTrigger>\n      </TabsList>\n      <TabsContent value=\"home\">Your summary.</TabsContent>\n      <TabsContent value=\"stats\">Charts and numbers.</TabsContent>\n      <TabsContent value=\"alerts\">Recent notifications.</TabsContent>\n    </Tabs>\n  );\n}",
          "lang": "tsx",
          "filename": "dashboard-tabs.tsx"
        }
      },
      {
        "heading": "Controlled tabs for filters and date ranges",
        "paragraphs": [
          "Segment tabs work well as a compact switch for a chart range or a list filter. Keep the value in your own state and read it wherever you fetch or filter data. TabsTrigger also accepts indicatorClassName if you want a different indicator color for one bar."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { useState } from \"react\";\nimport { Tabs, TabsList, TabsTrigger } from \"@/components/motion/tabs\";\n\nexport function RangeTabs() {\n  const [range, setRange] = useState(\"week\");\n\n  return (\n    <Tabs value={range} onValueChange={setRange} variant=\"segment\">\n      <TabsList>\n        <TabsTrigger value=\"day\">Day</TabsTrigger>\n        <TabsTrigger value=\"week\">Week</TabsTrigger>\n        <TabsTrigger value=\"month\">Month</TabsTrigger>\n      </TabsList>\n    </Tabs>\n  );\n}",
          "lang": "tsx",
          "filename": "range-tabs.tsx"
        }
      },
      {
        "heading": "Accessibility and reduced motion for animated tabs",
        "paragraphs": [
          "Each beUI trigger is a native button with role tab and aria-selected, so it is focusable and clickable with the keyboard by default. Inactive TabsContent panels stay in the DOM with the hidden attribute, which keeps their text in server-rendered HTML without exposing it to screen readers. Arrow keys move between enabled tabs and Home and End jump to the ends, and each tab points at its panel with aria-controls while the panel has the tabpanel role labelled by its tab, which covers the WAI-ARIA tabs pattern.",
          "When the user has reduced motion enabled, Tabs sets its transitions to zero duration through MotionConfig: the indicator jumps to the new tab instead of sliding, and panels fade in without the small vertical offset. In your own from-scratch version, you can get similar behavior by wrapping the app in MotionConfig with reducedMotion=\"user\", or by reading useReducedMotion and swapping the transition."
        ]
      }
    ],
    "faq": [
      {
        "question": "What is layoutId in Framer Motion?",
        "answer": "layoutId links two motion elements across renders. When one with a given layoutId unmounts and another with the same id mounts, Framer Motion animates from the old element's position and size to the new one, which is exactly what a sliding tab indicator needs."
      },
      {
        "question": "Why does my tab indicator stretch or have squashed corners?",
        "answer": "Layout animations use scale transforms. Set borderRadius in the style prop so Framer Motion can correct it during the animation, and keep text out of the scaled element; put the label in a sibling span above the indicator."
      },
      {
        "question": "Why does the indicator jump between two tab bars on the same page?",
        "answer": "They share the same layoutId string. Give each bar its own id, for example from useId, or wrap each bar in its own LayoutGroup with a distinct id."
      },
      {
        "question": "Do I need the motion package or framer-motion?",
        "answer": "beUI imports from motion/react, the current package name for Framer Motion. The shadcn CLI installs it for you when you add the Tabs component."
      },
      {
        "question": "Is the beUI Tabs component free?",
        "answer": "Yes. beUI is free and open source under the MIT license, and you install the source into your own project, so you can change it however you like."
      }
    ],
    "components": [
      "tabs",
      "expandable-tabs",
      "morphing-tabs",
      "shared-layout-bg"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "dynamic-island-react",
    "title": "Dynamic Island in React: Build an iPhone-style Pill",
    "description": "Build an iPhone Dynamic Island in React with Framer Motion: measure content, spring the pill to size and cross-fade views. Then use the free beUI DynamicIsland.",
    "heading": "How to build an iPhone Dynamic Island in React",
    "intro": "The Dynamic Island feels alive because three things happen together: the black pill springs to the exact size of its new content, the old content gets pulled back into the pill, and the new content unfurls out of it. This guide builds each piece with Framer Motion, then shows the beUI DynamicIsland block that does the same with a small, controlled API.",
    "sections": [
      {
        "heading": "Measure the content, then spring the shell to it",
        "paragraphs": [
          "The pill cannot animate to width auto, so you measure the content and animate to real numbers. Wrap the content in an element sized with w-max so it takes its natural width, read offsetWidth and offsetHeight in a layout effect before the first paint, and keep reading with a ResizeObserver as views change.",
          "Animate the shell's width and height rather than scaling it. A scale transform would squash the text and icons inside, while a real resize keeps them crisp. It is a layout animation, so keep it on this one small element. A constant border radius of 32px does the shape change for free: browsers clamp the radius to half the height, so the shell reads as a pill when compact and a rounded rectangle when expanded."
        ]
      },
      {
        "heading": "Cross-fade views with AnimatePresence popLayout",
        "paragraphs": [
          "Key each view and render it inside AnimatePresence with mode=\"popLayout\". That mode pops the exiting view out of the layout immediately, so the measured size reflects only the incoming view and the shell starts resizing right away. Make the exit short and blur-free so it disappears before the shrinking shell clips it, and anchor the transform origin to the top so content unfurls downward like it does under a notch."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { AnimatePresence, motion } from \"motion/react\";\nimport { useLayoutEffect, useRef, useState, type ReactNode } from \"react\";\n\nfunction useMeasure() {\n  const ref = useRef<HTMLDivElement>(null);\n  const [size, setSize] = useState<{ width: number; height: number } | null>(null);\n\n  // Measure before paint, then keep measuring as the content changes.\n  useLayoutEffect(() => {\n    const el = ref.current;\n    if (!el) return;\n    const update = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });\n    update();\n    const observer = new ResizeObserver(update);\n    observer.observe(el);\n    return () => observer.disconnect();\n  }, []);\n\n  return [ref, size] as const;\n}\n\nexport function Island({ viewKey, children }: { viewKey: string; children: ReactNode }) {\n  const [ref, size] = useMeasure();\n\n  return (\n    <motion.div\n      initial={false}\n      animate={size ?? { width: 126, height: 37 }}\n      transition={{ type: \"spring\", duration: 0.7, bounce: 0.2 }}\n      style={{ borderRadius: 32 }}\n      className=\"overflow-hidden bg-black text-white\"\n    >\n      {/* w-max keeps this wrapper at the natural size of the current view. */}\n      <div ref={ref} className=\"w-max\">\n        <AnimatePresence mode=\"popLayout\" initial={false}>\n          <motion.div\n            key={viewKey}\n            initial={{ opacity: 0, scale: 0.9, filter: \"blur(4px)\" }}\n            animate={{ opacity: 1, scale: 1, filter: \"blur(0px)\" }}\n            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.08 } }}\n            style={{ transformOrigin: \"top center\" }}\n          >\n            {children}\n          </motion.div>\n        </AnimatePresence>\n      </div>\n    </motion.div>\n  );\n}",
          "lang": "tsx",
          "filename": "island.tsx"
        }
      },
      {
        "heading": "Install the beUI Dynamic Island block",
        "paragraphs": [
          "beUI ships this pattern as a block you install as source with the shadcn CLI. It lands at components/motion/dynamic-island.tsx, and Framer Motion is added as a dependency if your project does not have it yet."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/dynamic-island",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "Using DynamicIsland and DynamicIslandView",
        "paragraphs": [
          "DynamicIsland is controlled by a single view prop. Pass null to show the compact pill with whatever you put in compact, or pass a view id to expand into the DynamicIslandView with that id. Views are plain children, so a call, a timer and a now-playing card can all live side by side and only the active one renders.",
          "Put the island in a top-aligned container with room below it, so expansion reads as unfurling downward rather than pushing content around."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { Phone, PhoneOff } from \"lucide-react\";\nimport { useState } from \"react\";\nimport { DynamicIsland, DynamicIslandView } from \"@/components/motion/dynamic-island\";\n\ntype View = \"call\" | \"music\" | null;\n\nexport function CallIsland() {\n  const [view, setView] = useState<View>(null);\n\n  return (\n    <div className=\"flex h-32 items-start justify-center pt-2\">\n      <DynamicIsland\n        view={view}\n        compact={<span>9:41</span>}\n      >\n        <DynamicIslandView id=\"call\" className=\"gap-4\">\n          <span className=\"text-sm font-semibold\">Incoming call</span>\n          <button type=\"button\" aria-label=\"Decline\" onClick={() => setView(null)}>\n            <PhoneOff className=\"size-3.5\" />\n          </button>\n          <button type=\"button\" aria-label=\"Accept\" onClick={() => setView(null)}>\n            <Phone className=\"size-3.5\" />\n          </button>\n        </DynamicIslandView>\n        <DynamicIslandView id=\"music\" className=\"gap-3\">\n          <span className=\"text-xs font-semibold\">Now playing</span>\n        </DynamicIslandView>\n      </DynamicIsland>\n    </div>\n  );\n}",
          "lang": "tsx",
          "filename": "call-island.tsx"
        }
      },
      {
        "heading": "Accessibility and reduced motion for a Dynamic Island",
        "paragraphs": [
          "The beUI shell renders with role status and aria-live polite, so screen readers announce new content when the view changes without interrupting the user. Keep view content short so announcements stay useful, and give icon-only buttons an aria-label, as the Decline and Accept buttons do above.",
          "With reduced motion enabled, the shell resize runs with zero duration and the views cross-fade with opacity only, dropping the scale, slide and blur. If you build your own, read useReducedMotion and swap the transitions the same way, because the CSS prefers-reduced-motion media query cannot stop a JavaScript spring."
        ]
      }
    ],
    "faq": [
      {
        "question": "Why not animate scale for the Dynamic Island resize?",
        "answer": "Scaling the shell would also scale everything inside it, so text and icons would stretch mid-animation. Animating real width and height on one small element keeps the content sharp."
      },
      {
        "question": "How do I animate to height auto in Framer Motion?",
        "answer": "Measure the content with a ref and ResizeObserver and animate to the measured pixel values. Wrapping the content in a w-max element lets you read its natural width as well as its height."
      },
      {
        "question": "What does AnimatePresence mode popLayout do?",
        "answer": "It removes the exiting element from the layout flow as soon as it starts leaving, so siblings and measured containers respond to the new content immediately instead of waiting for the exit to finish."
      },
      {
        "question": "Can the beUI Dynamic Island hold buttons?",
        "answer": "Yes. DynamicIslandView children are ordinary React nodes, so you can render buttons, timers or media controls. The preview on beUI uses a NumberTicker for a countdown and buttons for call actions."
      },
      {
        "question": "Is there a React Native version?",
        "answer": "beUI Native publishes React Native components separately at /react-native. Check that list for the components currently available there."
      }
    ],
    "components": [
      "dynamic-island",
      "notification-stack",
      "animated-toast-stack"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "shader-background-nextjs",
    "title": "Shader Background in Next.js: Animated WebGL Hero",
    "description": "Add an animated WebGL shader or mesh gradient background to a React or Next.js hero: client boundary, layering, contrast, performance and reduced motion.",
    "heading": "How to add an animated shader background to a Next.js hero",
    "intro": "A moving mesh gradient or grain shader can give a landing page hero real depth, but it is easy to end up with unreadable text, a busy GPU or a background that ignores motion preferences. This guide covers the parts that matter in Next.js, using the beUI ShaderBackground component, which wraps the Paper Design shaders behind one typed variant prop.",
    "sections": [
      {
        "heading": "Install the beUI Shader Background",
        "paragraphs": [
          "Add the component with the shadcn CLI. It installs the source to components/motion/shader-background.tsx and adds its dependencies, @paper-design/shaders-react and Framer Motion, to your package.json."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/shader-background",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "Where does the client component boundary go?",
        "paragraphs": [
          "WebGL needs the browser, so the shader file starts with \"use client\". You do not need to make your page a client component to use it. A Server Component page can render ShaderBackground directly as long as the props are serializable, and colors as hex strings and numeric settings all are. Keep your headline and copy in the server-rendered part of the page so they are in the initial HTML.",
          "ShaderBackground takes a variant such as mesh-gradient, grain-gradient, warp, waves, voronoi or dot-orbit, plus the props that variant accepts. The types are a discriminated union, so your editor only suggests the props that belong to the variant you picked."
        ]
      },
      {
        "heading": "Position the shader behind the hero content",
        "paragraphs": [
          "Make the section relative and isolate, then place the shader in an absolutely positioned layer with inset-0 and a negative z-index. The isolate class creates a stacking context, so the negative z-index stays inside the section instead of slipping behind the page background. ShaderBackground fills its parent with h-full w-full, so the wrapper decides its size.",
          "Mark the wrapper aria-hidden because the shader is decorative and has nothing for assistive technology to read."
        ],
        "code": {
          "code": "import { ShaderBackground } from \"@/components/motion/shader-background\";\n\nexport default function Page() {\n  return (\n    <section className=\"relative isolate overflow-hidden\">\n      {/* Decorative layer: behind the content and hidden from assistive tech. */}\n      <div aria-hidden=\"true\" className=\"absolute inset-0 -z-10\">\n        <ShaderBackground\n          variant=\"mesh-gradient\"\n          colors={[\"#e0eaff\", \"#241d9a\", \"#f75092\", \"#9f50d3\"]}\n          distortion={0.8}\n          swirl={0.3}\n          speed={0.4}\n        />\n        {/* A scrim keeps headline contrast steady across every frame. */}\n        <div className=\"absolute inset-0 bg-black/45\" />\n      </div>\n\n      <div className=\"mx-auto max-w-3xl px-6 py-32 text-center text-white\">\n        <h1 className=\"text-5xl font-semibold tracking-tight\">Ship faster</h1>\n        <p className=\"mt-4 text-lg text-white/80\">A short line that stays readable.</p>\n      </div>\n    </section>\n  );\n}",
          "lang": "tsx",
          "filename": "app/page.tsx"
        }
      },
      {
        "heading": "Keep text readable over a moving gradient",
        "paragraphs": [
          "A gradient that animates will pass through light and dark areas, so contrast that works on one frame can fail on the next. Check your text against the lightest and darkest colors in the palette, not just the average.",
          "The simplest fix is a semi-transparent scrim between the shader and the text, like the bg-black/45 layer above. Choosing a palette that stays within one lightness range, keeping speed low and using larger, heavier type for the headline all help as well."
        ]
      },
      {
        "heading": "Shader background performance tips",
        "paragraphs": [
          "The cost of a fragment shader scales with the number of pixels it draws every frame. The underlying Paper Design mount accepts maxPixelCount and minPixelRatio, and ShaderBackground passes them through, so you can cap the drawing buffer for a full-bleed hero. Its animation loop also pauses while the browser tab is hidden.",
          "A few more habits keep it light: use one shader per page rather than several, prefer lower speed values, and for sections far down the page consider a static variant such as static-mesh-gradient or static-radial-gradient, which renders a gradient without animating it."
        ],
        "code": {
          "code": "<ShaderBackground\n  variant=\"grain-gradient\"\n  colors={[\"#7300ff\", \"#eba8ff\", \"#00bfff\", \"#2a00ff\"]}\n  colorBack=\"#000000\"\n  softness={0.6}\n  speed={0.5}\n  // Cap the drawing buffer: fewer pixels means less GPU work per frame.\n  maxPixelCount={1280 * 720 * 2}\n/>",
          "lang": "tsx",
          "filename": "hero-background.tsx"
        }
      },
      {
        "heading": "Reduced motion for shader backgrounds",
        "paragraphs": [
          "ShaderBackground reads useReducedMotion from Framer Motion and sets speed to 0 when the user prefers reduced motion, so the gradient freezes on a still frame instead of disappearing. This applies to every animated variant, whether or not you pass speed yourself.",
          "Freezing keeps the visual design intact for everyone while removing continuous movement, which can be uncomfortable for people with vestibular disorders."
        ]
      }
    ],
    "faq": [
      {
        "question": "Can I use a WebGL shader background in a Next.js Server Component?",
        "answer": "The shader itself is a client component, but you can render it from a Server Component page and pass serializable props like color strings and numbers. Your text stays server-rendered."
      },
      {
        "question": "How do I make a mesh gradient background in React?",
        "answer": "Install the beUI Shader Background and render it with variant=\"mesh-gradient\", a colors array of hex values, and optional distortion, swirl and speed props."
      },
      {
        "question": "Does the shader background respect prefers-reduced-motion?",
        "answer": "Yes. The component sets speed to 0 on every animated variant for users who prefer reduced motion, which freezes the shader on a still frame."
      },
      {
        "question": "Why is my shader background on top of my text?",
        "answer": "The shader layer needs a lower stacking order than the content. Put it in an absolute inset-0 wrapper with -z-10 and add isolate to the section so the negative z-index stays contained."
      },
      {
        "question": "Will an animated shader slow down my page?",
        "answer": "It uses the GPU on every frame, so cost grows with screen size. Cap the drawing buffer with maxPixelCount, keep one shader per page and use a static variant where motion adds little."
      }
    ],
    "components": [
      "shader-background",
      "text-animation",
      "marquee"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "animated-sidebar-nextjs",
    "title": "Animated Sidebar in Next.js: Collapsible shadcn-style Nav",
    "description": "Build a collapsible animated sidebar in Next.js with shadcn-style composition: a provider, icon rail or offcanvas collapse, a mobile sheet and a Cmd+B shortcut.",
    "heading": "How to build a collapsible animated sidebar in Next.js",
    "intro": "An application sidebar has more moving parts than it looks: desktop and mobile states, a collapsed icon rail, a toggle that works from anywhere, and focus handling when it becomes a sheet on small screens. This guide walks through each part using the beUI Animated Sidebar, which follows the same provider and composition model as the shadcn sidebar and adds Framer Motion transitions.",
    "sections": [
      {
        "heading": "Install the beUI Animated Sidebar",
        "paragraphs": [
          "Add the component with the shadcn CLI. It installs components/motion/animated-sidebar.tsx and the files it imports, including the shared layout highlight used for the active row."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/animated-sidebar",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "How is the sidebar composed?",
        "paragraphs": [
          "AnimatedSidebarProvider owns the state: whether the desktop sidebar is open, whether the mobile sheet is open, and whether the viewport is mobile. AnimatedSidebar renders the panel, and AnimatedSidebarInset is the main content area next to it. Inside the panel you compose AnimatedSidebarHeader, AnimatedSidebarContent, AnimatedSidebarGroup with its label and content, AnimatedSidebarMenu, AnimatedSidebarMenuItem and AnimatedSidebarMenuButton, then an optional AnimatedSidebarFooter.",
          "Any component below the provider can call useAnimatedSidebar to read state, open, isMobile or call toggleSidebar, which is how AnimatedSidebarTrigger works."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { Home, Inbox, PanelLeft, Settings } from \"lucide-react\";\nimport { usePathname } from \"next/navigation\";\nimport type { ReactNode } from \"react\";\nimport {\n  AnimatedSidebar,\n  AnimatedSidebarContent,\n  AnimatedSidebarGroup,\n  AnimatedSidebarGroupContent,\n  AnimatedSidebarGroupLabel,\n  AnimatedSidebarHeader,\n  AnimatedSidebarInset,\n  AnimatedSidebarMenu,\n  AnimatedSidebarMenuButton,\n  AnimatedSidebarMenuItem,\n  AnimatedSidebarProvider,\n  AnimatedSidebarRail,\n  AnimatedSidebarTrigger,\n} from \"@/components/motion/animated-sidebar\";\n\nconst links = [\n  { href: \"/\", label: \"Home\", icon: Home },\n  { href: \"/inbox\", label: \"Inbox\", icon: Inbox },\n  { href: \"/settings\", label: \"Settings\", icon: Settings },\n];\n\nexport function AppShell({ children }: { children: ReactNode }) {\n  const pathname = usePathname();\n\n  return (\n    <AnimatedSidebarProvider>\n      <AnimatedSidebar ariaLabel=\"Main navigation\" collapsible=\"icon\">\n        <AnimatedSidebarHeader>\n          <span className=\"px-2 text-sm font-semibold\">Acme</span>\n        </AnimatedSidebarHeader>\n        <AnimatedSidebarContent className=\"px-2\">\n          <AnimatedSidebarGroup>\n            <AnimatedSidebarGroupLabel>Workspace</AnimatedSidebarGroupLabel>\n            <AnimatedSidebarGroupContent>\n              <AnimatedSidebarMenu>\n                {links.map(({ href, label, icon: Icon }) => (\n                  <AnimatedSidebarMenuItem key={href}>\n                    <AnimatedSidebarMenuButton\n                      href={href}\n                      isActive={pathname === href}\n                      icon={<Icon className=\"size-4\" />}\n                    >\n                      {label}\n                    </AnimatedSidebarMenuButton>\n                  </AnimatedSidebarMenuItem>\n                ))}\n              </AnimatedSidebarMenu>\n            </AnimatedSidebarGroupContent>\n          </AnimatedSidebarGroup>\n        </AnimatedSidebarContent>\n        <AnimatedSidebarRail />\n      </AnimatedSidebar>\n\n      <AnimatedSidebarInset>\n        <header className=\"flex h-14 items-center gap-2 border-b px-4\">\n          <AnimatedSidebarTrigger>\n            <PanelLeft aria-hidden=\"true\" className=\"size-4\" />\n          </AnimatedSidebarTrigger>\n        </header>\n        {children}\n      </AnimatedSidebarInset>\n    </AnimatedSidebarProvider>\n  );\n}",
          "lang": "tsx",
          "filename": "components/app-shell.tsx"
        }
      },
      {
        "heading": "Add the sidebar to a Next.js App Router layout",
        "paragraphs": [
          "The shell above is a client component because it reads usePathname to mark the active link and passes icons and handlers to the menu. Your layout can stay a Server Component and simply wrap its children in the shell, so the pages inside still render on the server.",
          "AnimatedSidebarMenuButton renders a plain anchor when you pass href. For client-side navigation without a full page load, omit href and call router.push from onSelect instead, keeping in mind that a button does not support opening in a new tab."
        ],
        "code": {
          "code": "import type { ReactNode } from \"react\";\nimport { AppShell } from \"@/components/app-shell\";\n\nexport default function AppLayout({ children }: { children: ReactNode }) {\n  return <AppShell>{children}</AppShell>;\n}",
          "lang": "tsx",
          "filename": "app/(app)/layout.tsx"
        }
      },
      {
        "heading": "Icon rail vs offcanvas: choosing a collapse mode",
        "paragraphs": [
          "The collapsible prop on AnimatedSidebar decides what closing does on desktop. With icon, the default, the panel springs down to a narrow rail: labels fade out, icons stay, and each button gets the label as its accessible name and title. With offcanvas, the panel slides fully out of view and the inset content takes the whole width. With none, the sidebar stays open.",
          "Widths come from CSS variables on the provider: --sidebar-width (16rem), --sidebar-width-icon (4.25rem) and --sidebar-width-mobile (18rem). Override them through the provider's style prop. AnimatedSidebar also takes side (left or right) and variant (sidebar, floating or inset)."
        ],
        "list": [
          "Pass open, defaultOpen and onOpenChange to the provider to control or persist the desktop state, for example in a cookie.",
          "Use AnimatedSidebarMenuSub with AnimatedSidebarMenuSubItem and AnimatedSidebarMenuSubButton for nested items. Selecting a group from the icon rail expands the panel so its children are reachable.",
          "AnimatedSidebarRail adds a thin edge you can click to toggle the panel."
        ],
        "code": {
          "code": "<AnimatedSidebarMenuItem>\n  <AnimatedSidebarMenuButton\n    icon={<Target className=\"size-4\" />}\n    ariaExpanded={open}\n    onSelect={() => setOpen((value) => !value)}\n  >\n    Opportunities\n  </AnimatedSidebarMenuButton>\n  <AnimatedSidebarMenuSub open={open}>\n    <AnimatedSidebarMenuSubItem>\n      <AnimatedSidebarMenuSubButton href=\"/pipeline\" isActive={pathname === \"/pipeline\"}>\n        Pipeline\n      </AnimatedSidebarMenuSubButton>\n    </AnimatedSidebarMenuSubItem>\n  </AnimatedSidebarMenuSub>\n</AnimatedSidebarMenuItem>",
          "lang": "tsx",
          "filename": "nested-item.tsx"
        }
      },
      {
        "heading": "Mobile sheet and keyboard shortcut",
        "paragraphs": [
          "Below 768px the same AnimatedSidebar renders as a sheet in a portal on document.body: a dialog with aria-modal that slides in over a dimmed backdrop. Opening it locks page scroll and moves focus to the first focusable item; Tab and Shift+Tab stay inside the sheet, Escape or the backdrop closes it, and focus returns to the trigger. Selecting a regular menu item closes the sheet, while items with ariaExpanded keep it open so the submenu can unfold.",
          "Cmd+B on macOS or Ctrl+B elsewhere calls toggleSidebar, which toggles the desktop panel or the mobile sheet depending on the viewport. Use AnimatedSidebarClose inside the panel for an explicit close button on mobile."
        ]
      },
      {
        "heading": "Accessibility and reduced motion for an animated sidebar",
        "paragraphs": [
          "The desktop panel is an aside with an accessible name from ariaLabel, and AnimatedSidebarTrigger is a button with aria-expanded that reflects the current state. Active items get aria-current=\"page\", and expandable items expose aria-expanded. The rail is skipped in the tab order because the trigger and the shortcut already cover keyboard users.",
          "With reduced motion enabled, the panel width changes without the spring, labels switch to a short fade, the mobile sheet fades in place instead of sliding, the active highlight stops gliding between rows and press feedback is removed."
        ]
      }
    ],
    "faq": [
      {
        "question": "How do I make a collapsible sidebar in Next.js?",
        "answer": "Wrap your app layout in a client component that renders AnimatedSidebarProvider, AnimatedSidebar and AnimatedSidebarInset, add an AnimatedSidebarTrigger in your header, and pick collapsible=\"icon\" or \"offcanvas\"."
      },
      {
        "question": "Is the beUI Animated Sidebar compatible with shadcn/ui?",
        "answer": "It installs through the shadcn CLI and follows the same composition model as the shadcn sidebar, with a provider, a panel, an inset and menu parts. It is its own component, so the part names start with AnimatedSidebar."
      },
      {
        "question": "What keyboard shortcut toggles the sidebar?",
        "answer": "Cmd+B on macOS and Ctrl+B on other platforms. It toggles the desktop panel, or the mobile sheet on small screens."
      },
      {
        "question": "How do I remember whether the sidebar was collapsed?",
        "answer": "Control the provider with open and onOpenChange, save the value in a cookie or local storage, and read it back as the initial value. Reading a cookie on the server avoids a flash of the wrong state."
      },
      {
        "question": "Can the sidebar sit on the right side?",
        "answer": "Yes. Pass side=\"right\" to AnimatedSidebar. The mobile sheet then slides in from the right as well."
      }
    ],
    "components": [
      "animated-sidebar",
      "bounce-sidebar",
      "ai-sidebar",
      "dock"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "ios-wheel-picker-react",
    "title": "iOS Wheel Picker in React: Build a Scroll Time Picker",
    "description": "Build an iOS-style scroll wheel and time picker in React: a 3D rotateX drum, momentum and snapping, keyboard control and reduced motion, with beUI WheelPicker.",
    "heading": "How to build an iOS-style wheel picker in React",
    "intro": "The iOS picker wheel is a drum of rows that you flick, coast and snap to a value. On the web it is a small 3D trick plus some physics: rows sit on a cylinder made with rotateX and translateZ, a scroll position in rows drives the rotation, and a release velocity decides where it comes to rest. This guide walks through the technique, then shows how to compose the beUI WheelPicker into a working time picker you can install with the shadcn CLI.",
    "sections": [
      {
        "heading": "How does a 3D wheel picker work?",
        "paragraphs": [
          "Every row is placed on the surface of a cylinder. Row i is rotated by minus i times a fixed angle around the X axis and pushed out by the cylinder radius with translateZ. The whole list is then pulled back by the radius and rotated by the angle times the current scroll position. When scroll is 3, row 3 faces you and the rows above and below curve away, which is what produces the drum look.",
          "The angle comes from how many rows you want visible. With five rows, two sit on each side of the center, so each row spans 90 divided by 3, or 30 degrees. The radius follows from the row height: itemHeight divided by tan(angle). That keeps neighbouring rows touching on the curve instead of overlapping or leaving gaps.",
          "Keep a single number for the scroll position, measured in rows rather than pixels. A drag converts pixel movement into rows, a flick adds a projected distance, and snapping is just rounding to the nearest integer. Rows more than a quarter turn from the center are behind the horizon, so hide them to avoid the back of the drum bleeding through."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { animate, motion, useMotionValue, useTransform } from \"motion/react\";\n\nconst ITEM_HEIGHT = 36;\nconst ROWS_EACH_SIDE = 2; // 5 visible rows\nconst ANGLE = 90 / (ROWS_EACH_SIDE + 1); // degrees each row spans on the drum\nconst RADIUS = ITEM_HEIGHT / Math.tan((ANGLE * Math.PI) / 180);\nconst HEIGHT = Math.round(\n  2 * RADIUS * Math.sin((ROWS_EACH_SIDE * ANGLE * Math.PI) / 180) + ITEM_HEIGHT,\n);\n\nexport function Drum({\n  options,\n  onChange,\n}: {\n  options: string[];\n  onChange: (value: string) => void;\n}) {\n  // Scroll position measured in rows, so 2.4 means \"between row 2 and 3\".\n  const scroll = useMotionValue(0);\n  const transform = useTransform(\n    scroll,\n    (s) => `translateZ(${-RADIUS}px) rotateX(${ANGLE * s}deg)`,\n  );\n\n  const settle = (velocityRows: number) => {\n    // Project where the flick would coast, then snap to the nearest row.\n    const projected = scroll.get() + velocityRows * 0.25;\n    const target = Math.max(0, Math.min(options.length - 1, Math.round(projected)));\n    animate(scroll, target, { type: \"spring\", stiffness: 300, damping: 30 });\n    onChange(options[target]);\n  };\n\n  return (\n    <motion.div\n      className=\"relative touch-none overflow-hidden\"\n      style={{ height: HEIGHT, perspective: 1000 }}\n      onPan={(_, info) => scroll.set(scroll.get() - info.delta.y / ITEM_HEIGHT)}\n      onPanEnd={(_, info) => settle(-info.velocity.y / ITEM_HEIGHT)}\n    >\n      <motion.ul\n        className=\"absolute inset-x-0 top-1/2 m-0 h-0 list-none p-0 [transform-style:preserve-3d]\"\n        style={{ transform }}\n      >\n        {options.map((label, i) => (\n          <li\n            key={label}\n            className=\"absolute inset-x-0 flex items-center justify-center [backface-visibility:hidden]\"\n            style={{\n              top: -ITEM_HEIGHT / 2,\n              height: ITEM_HEIGHT,\n              transform: `rotateX(${-ANGLE * i}deg) translateZ(${RADIUS}px)`,\n            }}\n          >\n            {label}\n          </li>\n        ))}\n      </motion.ul>\n    </motion.div>\n  );\n}",
          "lang": "tsx",
          "filename": "drum.tsx"
        }
      },
      {
        "heading": "Adding momentum, snapping and keyboard support",
        "paragraphs": [
          "A flick should feel like it coasts. On release, average the pointer velocity over the last few dozen milliseconds of movement instead of the final two samples, because a single noisy frame makes an even flick feel like it caught. Convert that velocity to rows, project how far it would travel under a constant deceleration, round to a row, and glide there. A small overshoot on the settle reads as the spring bounce users expect from iOS.",
          "Mouse wheels need a different model. Firing a fresh animation for every wheel notch stacks interrupted animations and feels laggy. Instead, move the scroll position continuously with the wheel delta and snap once the wheel has been idle for a short moment. Bind the wheel and touchmove listeners natively with passive set to false so you can call preventDefault and stop the page from scrolling behind the drum; React's synthetic wheel and touch handlers are passive.",
          "For keyboard users, make the drum focusable and map ArrowUp and ArrowDown to one row, Home to the first row and End to the last. The from-scratch example above leaves those out to stay short; the beUI WheelPicker includes all of them, plus rubber-banding past the ends and a frame-coalesced drag so touch movement paints once per animation frame."
        ]
      },
      {
        "heading": "Install the beUI Wheel Picker",
        "paragraphs": [
          "beUI is a free, MIT-licensed motion component library for React, built with Tailwind CSS 4 and Framer Motion. Components are copied into your project as source, so you own the code. The wheel picker installs from the @beui namespace in the shadcn registry and lands at components/motion/wheel-picker.tsx, together with the small helpers it imports."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/wheel-picker",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "Compose wheels into a time picker",
        "paragraphs": [
          "WheelPicker is one column. A time picker is three of them side by side: hours, minutes and AM or PM. Each wheel takes an options array, a value with onValueChange (or defaultValue for uncontrolled use), visibleCount for how many rows show through the window (odd numbers, default 5) and itemHeight in pixels (default 36). Strip the border and background from each wheel and put a single frame around the group so the columns read as one control.",
          "Show the selected time as text above the wheels. It confirms the choice at a glance and gives you a natural place to format the value. The same pattern builds a date picker: the beUI preview composes month, day and year wheels and clamps the day when a shorter month is chosen."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { useState } from \"react\";\nimport { WheelPicker } from \"@/components/motion/wheel-picker\";\n\nconst HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));\nconst MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, \"0\"));\nconst PERIODS = [\"AM\", \"PM\"];\n\nexport function TimePicker() {\n  const [hour, setHour] = useState(\"7\");\n  const [minute, setMinute] = useState(\"30\");\n  const [period, setPeriod] = useState(\"AM\");\n\n  return (\n    <div className=\"flex flex-col items-center gap-4\">\n      <p className=\"text-sm text-muted-foreground\">\n        Alarm at{\" \"}\n        <span className=\"font-medium text-foreground tabular-nums\">\n          {hour}:{minute} {period}\n        </span>\n      </p>\n      <div className=\"flex items-stretch gap-1 rounded-3xl border border-border bg-background p-2\">\n        <WheelPicker\n          options={HOURS}\n          value={hour}\n          onValueChange={setHour}\n          aria-label=\"Hour\"\n          visibleCount={7}\n          itemHeight={42}\n          className=\"w-14 border-0 bg-transparent\"\n        />\n        <WheelPicker\n          options={MINUTES}\n          value={minute}\n          onValueChange={setMinute}\n          aria-label=\"Minute\"\n          visibleCount={7}\n          itemHeight={42}\n          className=\"w-14 border-0 bg-transparent\"\n        />\n        <WheelPicker\n          options={PERIODS}\n          value={period}\n          onValueChange={setPeriod}\n          aria-label=\"AM or PM\"\n          visibleCount={7}\n          itemHeight={42}\n          className=\"w-16 border-0 bg-transparent\"\n        />\n      </div>\n    </div>\n  );\n}",
          "lang": "tsx",
          "filename": "time-picker.tsx"
        }
      },
      {
        "heading": "Labels, values and the optional tick sound",
        "paragraphs": [
          "Options can be plain strings or objects with a label and a value, which is useful when the text you show differs from what you store. onValueChange always receives the value string. Set sound to play a short synthesized tick as rows cross the center; it is off by default. disabled dims the wheel and removes it from the tab order."
        ],
        "code": {
          "code": "import { WheelPicker } from \"@/components/motion/wheel-picker\";\n\nconst DURATIONS = [\n  { label: \"15 min\", value: \"15\" },\n  { label: \"30 min\", value: \"30\" },\n  { label: \"1 hour\", value: \"60\" },\n  { label: \"2 hours\", value: \"120\" },\n];\n\nexport function DurationPicker() {\n  return (\n    <WheelPicker\n      options={DURATIONS}\n      defaultValue=\"30\"\n      onValueChange={(minutes) => console.log(Number(minutes))}\n      sound\n      aria-label=\"Meeting length\"\n      className=\"w-32\"\n    />\n  );\n}",
          "lang": "tsx",
          "filename": "duration-picker.tsx"
        }
      },
      {
        "heading": "Accessibility and reduced motion for wheel pickers",
        "paragraphs": [
          "The beUI drum is a focusable element with your aria-label and full keyboard control (ArrowUp, ArrowDown, Home, End), and it shows a focus ring on keyboard focus. The 3D rows are decorative copies marked aria-hidden, so give every wheel a clear aria-label such as Hour or Minute, and render the chosen value as visible text near the wheels so everyone can confirm it.",
          "When the operating system asks for reduced motion, useReducedMotion returns true and WheelPicker renders a different control: a flat list of native buttons in a CSS scroll-snap container, with no 3D rotation, no momentum and no drag physics. Selecting a row is a plain click. That is a stronger answer than shortening the animation, because a spinning cylinder is exactly the kind of large movement reduced-motion users are asking to avoid."
        ],
        "list": [
          "Give each wheel its own aria-label.",
          "Show the combined value as text, for example 7:30 AM.",
          "Keep a native time input or a text field as a fallback for very long ranges such as years.",
          "Test with a keyboard: Tab to each wheel and use the arrow keys."
        ]
      }
    ],
    "faq": [
      {
        "question": "How do I make an iOS style picker wheel in React?",
        "answer": "Place each row on a cylinder with rotateX and translateZ, rotate the whole list by a scroll position measured in rows, and snap that position to the nearest integer on release. The beUI WheelPicker packages this with momentum, wheel and keyboard input, and installs with npx shadcn@latest add @beui/wheel-picker."
      },
      {
        "question": "How do I build a scroll time picker with hours and minutes?",
        "answer": "Render three WheelPicker components side by side, one each for hours, minutes and AM or PM, each with its own options array, value and onValueChange. Combine the three values into a time string in state and show it as text above the wheels."
      },
      {
        "question": "Does the wheel picker work on touch devices?",
        "answer": "Yes. beUI WheelPicker binds native touch listeners that are not passive, so a finger drag drives the drum instead of scrolling the page, and a release velocity carries into a momentum coast that snaps to a row."
      },
      {
        "question": "Can I use CSS scroll snap instead of 3D transforms?",
        "answer": "You can, and it is the simplest accessible version: a scroll container with scroll-snap-type and one snap point per row. You lose the curved drum and the tuned momentum. beUI uses exactly that flat scroll-snap list as its reduced-motion rendering."
      },
      {
        "question": "Is the beUI wheel picker controlled or uncontrolled?",
        "answer": "Both. Pass value and onValueChange to control it, or defaultValue to let it manage its own state. It also follows external value changes by gliding to the new row unless a drag is in progress."
      }
    ],
    "components": [
      "wheel-picker",
      "arc-picker",
      "date-range-picker"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "reduced-motion-framer-motion",
    "title": "Reduced Motion in Framer Motion: useReducedMotion Guide",
    "description": "How to respect prefers-reduced-motion in Framer Motion: useReducedMotion, MotionConfig reducedMotion, why CSS cannot stop JS springs, and real beUI examples.",
    "heading": "How to respect prefers-reduced-motion in Framer Motion",
    "intro": "Some people get dizzy, nauseous or distracted from large on-screen movement, and they turn on Reduce Motion in their operating system. Browsers expose that choice as the prefers-reduced-motion media query. Framer Motion gives you two tools to honor it, useReducedMotion and MotionConfig, and this guide covers when each one works, why a global CSS rule is not enough, and how the components in beUI handle it in practice.",
    "sections": [
      {
        "heading": "Why the CSS media query cannot stop Framer Motion springs",
        "paragraphs": [
          "A common first step is a global rule inside @media (prefers-reduced-motion: reduce) that sets animation-duration and transition-duration to almost zero on every element. beUI ships that rule too, and it is worth having: it calms CSS transitions and keyframe animations across the site.",
          "It does not reach Framer Motion. A spring is calculated in JavaScript frame by frame and the result is written to the element's style, so there is no CSS transition for the media query to shorten. The same is true for anything you drive with requestAnimationFrame, useSpring or the imperative animate function. To stop that movement you have to read the preference in JavaScript and change what you animate."
        ]
      },
      {
        "heading": "Using useReducedMotion to drop transforms and keep opacity",
        "paragraphs": [
          "useReducedMotion is a hook from motion/react that returns true when the user has asked for reduced motion. Its type is boolean or null, because the value is not known during server rendering, so beUI components read it as useReducedMotion() ?? false.",
          "The right response is usually fewer and gentler animations, not none. Movement is what causes discomfort: translation, scaling, rotation, parallax and large layout morphs. A short opacity fade or a color change still helps people notice that something changed. So branch the animation: with reduced motion on, keep the fade and drop the transform, and swap the spring for a short tween."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { motion, useReducedMotion } from \"motion/react\";\nimport type { ReactNode } from \"react\";\n\nexport function Toast({ children }: { children: ReactNode }) {\n  // true when the OS setting is on, false when off, null before it is known.\n  const reduce = useReducedMotion() ?? false;\n\n  return (\n    <motion.div\n      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}\n      animate={{ opacity: 1, y: 0, scale: 1 }}\n      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}\n      transition={\n        reduce\n          ? { duration: 0.15 }\n          : { type: \"spring\", stiffness: 420, damping: 32 }\n      }\n    >\n      {children}\n    </motion.div>\n  );\n}",
          "lang": "tsx",
          "filename": "toast.tsx"
        }
      },
      {
        "heading": "MotionConfig reducedMotion versus per-component checks",
        "paragraphs": [
          "MotionConfig sets defaults for every motion component below it. Its reducedMotion prop accepts \"user\", \"always\" or \"never\". With \"user\", Framer Motion follows the device setting and disables transform and layout animations for people who ask for reduced motion, while other values such as opacity and color still animate. Wrapping your app once is a cheap safety net.",
          "It has limits. It does not change code you run yourself, such as an imperative animate call in an effect, a useSpring you read every frame, or a hand-written requestAnimationFrame loop. It also cannot redesign an interaction: a drum that spins, a drag with momentum or a scroll-linked parallax needs a different behavior, not just a disabled transform. Use MotionConfig as the baseline and useReducedMotion where the component needs a real alternative."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { MotionConfig } from \"motion/react\";\nimport type { ReactNode } from \"react\";\n\n// \"user\" follows the OS setting: transform and layout animations are\n// disabled for people who ask for reduced motion, opacity and color still run.\nexport function Providers({ children }: { children: ReactNode }) {\n  return <MotionConfig reducedMotion=\"user\">{children}</MotionConfig>;\n}",
          "lang": "tsx",
          "filename": "providers.tsx"
        }
      },
      {
        "heading": "Gating imperative animations and springs",
        "paragraphs": [
          "Anything you start by hand needs its own check. Read the hook, and return early from the effect when it is true. An error shake is a good example: under reduced motion the red text and the message already explain the error, so the shake can simply be skipped.",
          "For a control with several animated children, a MotionConfig with a transition override is a tidy pattern. The beUI Switch wraps its button in MotionConfig with transition set to duration 0 when reduced motion is on and to its thumb spring otherwise, and it also skips the press squish and the disabled shake."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { animate, useReducedMotion } from \"motion/react\";\nimport { useEffect, useRef } from \"react\";\n\nexport function Shake({ error }: { error: boolean }) {\n  const ref = useRef<HTMLDivElement>(null);\n  const reduce = useReducedMotion();\n\n  useEffect(() => {\n    // Imperative animations are not covered by MotionConfig. Gate them here.\n    if (!error || !ref.current || reduce) return;\n    const controls = animate(\n      ref.current,\n      { x: [0, -6, 6, -3, 0] },\n      { duration: 0.4 },\n    );\n    return () => controls.stop();\n  }, [error, reduce]);\n\n  return <div ref={ref} className={error ? \"text-red-600\" : undefined}>Check the code</div>;\n}",
          "lang": "tsx",
          "filename": "shake.tsx"
        }
      },
      {
        "heading": "How beUI components handle reduced motion",
        "paragraphs": [
          "Every beUI component that moves reads useReducedMotion from motion/react, because the global CSS rule cannot stop its springs. The answer differs by component, which is the point: each one keeps what helps comprehension and removes what moves."
        ],
        "list": [
          "Wheel Picker swaps the whole 3D drum for a flat list of native buttons in a CSS scroll-snap container. No rotation, no momentum, no drag physics.",
          "Message drops the trailing-edge pop-up that translates and scales a new row, so the row simply appears in place, and a removed row fades out over 120 ms instead of shifting.",
          "Adaptive Stepper sets the rolling distance to zero, removes the blur and makes the value change instant, while its live region still announces the new value.",
          "Switch uses MotionConfig with a zero-duration transition so the thumb jumps instead of springing, and skips the press squish and the disabled shake."
        ],
        "code": {
          "code": "import { motion, MotionConfig, useReducedMotion } from \"motion/react\";\n\nconst THUMB_SPRING = { type: \"spring\", stiffness: 800, damping: 80, mass: 4 } as const;\n\nexport function Thumb({ checked }: { checked: boolean }) {\n  const reduce = useReducedMotion();\n  return (\n    // One switch for every motion child: springs normally, instant when reduced.\n    <MotionConfig transition={reduce ? { duration: 0 } : THUMB_SPRING}>\n      <motion.span layout className={checked ? \"ml-auto size-5\" : \"size-5\"} />\n    </MotionConfig>\n  );\n}",
          "lang": "tsx",
          "filename": "switch-pattern.tsx"
        }
      },
      {
        "heading": "Testing reduced motion and other accessibility checks",
        "paragraphs": [
          "Turn the setting on and use the interface. On macOS it is in System Settings under Accessibility, Display, Reduce motion; on iOS under Accessibility, Motion; on Windows under Accessibility, Visual effects, Animation effects. Chrome DevTools can also emulate prefers-reduced-motion from the Rendering panel, which is the fastest loop while you work.",
          "Check the things automated tools miss. Make sure nothing still slides, scales, spins or scrolls smoothly on its own, that state changes are still visible through color or opacity, and that focus still lands in the right place when an overlay opens without its animation. If you smooth-scroll in JavaScript, switch to instant scrolling under reduced motion; beUI's Message Scroller does that.",
          "beUI components install with the shadcn CLI and keep this handling in their source, so you can read and adjust it."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/wheel-picker @beui/message @beui/adaptive-stepper @beui/switch",
          "lang": "bash",
          "filename": "Terminal"
        }
      }
    ],
    "faq": [
      {
        "question": "How do I detect prefers-reduced-motion in React?",
        "answer": "With Framer Motion, call useReducedMotion from motion/react. Without it, use window.matchMedia(\"(prefers-reduced-motion: reduce)\") and listen for its change event so the UI updates when the setting changes."
      },
      {
        "question": "Does Framer Motion respect reduced motion automatically?",
        "answer": "Not by default. Wrap your app in MotionConfig with reducedMotion set to \"user\" to disable transform and layout animations for people who ask for reduced motion, or read useReducedMotion in each component for finer control."
      },
      {
        "question": "Why does my animation still play with Reduce Motion turned on?",
        "answer": "Framer Motion springs and imperative animations run in JavaScript, so a CSS rule that shortens transition-duration has no effect on them. Gate them with useReducedMotion, and check any animate calls or requestAnimationFrame loops you start yourself."
      },
      {
        "question": "Should reduced motion remove all animation?",
        "answer": "Usually not. The guidance is to remove movement such as translation, scaling, rotation and parallax, and keep short opacity or color transitions that help people notice a change. Removing all feedback can make an interface harder to follow."
      },
      {
        "question": "What does useReducedMotion return on the server?",
        "answer": "It returns null before the preference is known, so treat it as a boolean with a fallback, for example useReducedMotion() ?? false, and make sure the first render looks correct either way."
      }
    ],
    "components": [
      "wheel-picker",
      "message",
      "adaptive-stepper",
      "switch"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "animated-number-counter-react",
    "title": "Animated Number Counter in React: Count-Up and Tickers",
    "description": "Animate numbers in React: count-up on scroll with useSpring and useInView, a rolling digit ticker, tabular numbers and accessible values, using beUI components.",
    "heading": "How to animate numbers in React",
    "intro": "An animated number draws the eye to a stat, a price or a live counter. There are two common styles: a count-up that runs the value from zero to its target, and a ticker where each digit rolls like a slot machine. This guide builds both with Framer Motion, covers the details that keep them from jittering, and shows how to make sure screen reader users hear the real number instead of every frame in between.",
    "sections": [
      {
        "heading": "Count up a number on scroll with useSpring and useInView",
        "paragraphs": [
          "A count-up needs three pieces. useInView tells you when the element enters the viewport, so the animation plays when someone can see it rather than on page load. useSpring holds the animated value and eases toward a target you set. useTransform turns that raw value into display text, here rounded and formatted with toLocaleString.",
          "Render the motion value directly as a child of motion.span. Framer Motion updates the text node on each frame without re-rendering your component, which keeps a large dashboard of counters cheap. Use once: true on useInView so scrolling back up does not replay it.",
          "Under reduced motion, call jump instead of set. jump moves the spring to the value immediately, so people who asked for less motion see the final number with no counting."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { motion, useInView, useReducedMotion, useSpring, useTransform } from \"motion/react\";\nimport { useEffect, useRef } from \"react\";\n\nexport function CountUp({ value }: { value: number }) {\n  const ref = useRef<HTMLSpanElement>(null);\n  const inView = useInView(ref, { once: true, amount: 0.6 });\n  const reduce = useReducedMotion();\n  const spring = useSpring(0, { stiffness: 90, damping: 24 });\n  const text = useTransform(spring, (v) => Math.round(v).toLocaleString());\n\n  useEffect(() => {\n    if (!inView) return;\n    if (reduce) spring.jump(value); // no count, just the answer\n    else spring.set(value);\n  }, [inView, reduce, value, spring]);\n\n  return (\n    <span ref={ref} className=\"tabular-nums\">\n      <span className=\"sr-only\">{value.toLocaleString()}</span>\n      <motion.span aria-hidden=\"true\">{text}</motion.span>\n    </span>\n  );\n}",
          "lang": "tsx",
          "filename": "count-up.tsx"
        }
      },
      {
        "heading": "Build a rolling digit ticker",
        "paragraphs": [
          "A ticker gives each digit its own slot. The slot holds a vertical column of the digits 0 to 9 and translates it so the current digit shows through. Changing a digit from 3 to 7 slides the column four rows, which reads as a roll. Clip the slot with clip-path: inset(0) rather than overflow: hidden, and keep an invisible copy of the digit in normal flow so the slot sits on the same text baseline as the words around it.",
          "Key each slot by its place value counted from the right, not by its index from the left. Then when 999 becomes 1,000 the ones, tens and hundreds keep their identity and roll to their new digits, and the new thousands slot is the only one that mounts. Keying from the left would remount every slot and replay them all from zero."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { motion, useReducedMotion } from \"motion/react\";\n\nconst DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];\n\n// One slot: a column of 0 to 9 that slides so the right digit shows.\nexport function Digit({ digit }: { digit: number }) {\n  const reduce = useReducedMotion();\n  return (\n    <span className=\"relative inline-block h-[1.1em] w-[1ch] leading-[1.1em] [clip-path:inset(0)]\">\n      <span className=\"invisible\">{digit}</span>\n      <motion.span\n        className=\"absolute inset-x-0 top-0 flex flex-col items-center\"\n        animate={{ y: `${-digit * 1.1}em` }}\n        transition={reduce ? { duration: 0 } : { type: \"spring\", stiffness: 260, damping: 28 }}\n      >\n        {DIGITS.map((n) => (\n          <span key={n} className=\"h-[1.1em]\">{n}</span>\n        ))}\n      </motion.span>\n    </span>\n  );\n}",
          "lang": "tsx",
          "filename": "digit.tsx"
        }
      },
      {
        "heading": "Why tabular numbers stop the jitter",
        "paragraphs": [
          "In most fonts, digits are proportional: a 1 is narrower than an 8. While a number counts up, every frame changes the width of the string, so the text shifts left and right and the layout around it twitches. The fix is font-variant-numeric: tabular-nums, which Tailwind exposes as the tabular-nums class. Every digit then takes the same width.",
          "Tabular figures fix the digits but not the length. Going from 999 to 1,000 still adds characters. For counters that cross a magnitude, reserve space with a min-width in ch units, or pad the value; beUI NumberTicker has a pad prop that left-pads with zeros to a fixed digit count."
        ],
        "list": [
          "Add tabular-nums to every animated number.",
          "Format with toLocaleString or Intl.NumberFormat so group separators match the reader's locale.",
          "Round inside the formatter, not in state, so the spring can keep its fractional value.",
          "Give single-digit slots a width of 1ch so a roll never changes the slot size."
        ]
      },
      {
        "heading": "Install beUI Number Animation components",
        "paragraphs": [
          "beUI's Number Animation page has three variants, and each one installs on its own from the @beui namespace in the shadcn registry. AnimatedNumber is the spring count-up triggered in view. NumberTicker is the slot-machine roll with a staggered entrance. DigitSwap rolls fixed-slot glyphs and also works for masked values such as card numbers."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/animated-number\nnpx shadcn@latest add @beui/number-ticker\nnpx shadcn@latest add @beui/digit-swap",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "Using AnimatedNumber, NumberTicker and DigitSwap",
        "paragraphs": [
          "AnimatedNumber takes value, an optional format function, duration in seconds (default 1.2) and startOnView (default true). It starts from 0 and eases to value when 60 percent of it is visible, then animates from the previous value on later changes.",
          "NumberTicker takes value plus prefix, suffix, decimals, pad, locale for group separators, or a custom format function. duration and stagger tune the roll; the stagger only plays on the first reveal, so live updates roll every digit at once instead of lagging. Set blur for a light motion blur during the roll.",
          "DigitSwap takes a string or number value, a direction of up or down, and suffixLength with suffixClassName to highlight the last few characters, such as the final four digits of a card. Change animationKey to replay every glyph even when the characters are the same."
        ],
        "code": {
          "code": "import { AnimatedNumber } from \"@/components/motion/animated-number\";\nimport { DigitSwap } from \"@/components/motion/digit-swap\";\nimport { NumberTicker } from \"@/components/motion/number-ticker\";\n\nexport function Stats({ revenue, users, code }: { revenue: number; users: number; code: string }) {\n  return (\n    <div className=\"grid gap-6 text-4xl font-semibold tracking-tight\">\n      {/* Counts up from 0 once the number scrolls into view. */}\n      <AnimatedNumber\n        value={revenue}\n        format={(n) => `$${Math.round(n).toLocaleString()}`}\n      />\n\n      {/* Slot-machine digits that roll when the value changes. */}\n      <NumberTicker value={users} locale suffix=\" users\" />\n\n      {/* Fixed-slot glyph swap, good for codes and masked values. */}\n      <DigitSwap value={code} direction=\"up\" className=\"font-mono\" />\n    </div>\n  );\n}",
          "lang": "tsx",
          "filename": "stats.tsx"
        }
      },
      {
        "heading": "Accessibility of changing numbers",
        "paragraphs": [
          "A screen reader that lands on a counting number can read whatever frame is on screen, such as 48,113 on the way to 129,480. Rolling digits are worse: a column of ten digits per slot is meaningless when read aloud. The pattern that fixes both is to render the final value in a visually hidden span and mark the animated copy aria-hidden. NumberTicker and DigitSwap both do this, so assistive technology reads the real number once.",
          "Be careful with live regions. Putting aria-live on a counter that updates every couple of seconds makes a screen reader interrupt the user over and over. Reserve announcements for values the user changed themselves. The beUI Adaptive Stepper is an example: its value is an output element with aria-live polite, because each change is the result of a button press.",
          "Count-ups that start in view begin at 0, so render meaningful surrounding text, such as a label and a comparison line, rather than relying on the number alone. All three beUI number components honor reduced motion: AnimatedNumber shows the final value immediately, NumberTicker digits jump without rolling, and DigitSwap keeps a short fade without the vertical slide."
        ]
      }
    ],
    "faq": [
      {
        "question": "How do I make a number count up in React?",
        "answer": "Hold the value in a Framer Motion useSpring, set its target when useInView reports the element is visible, and render a useTransform of the spring that rounds and formats it. Or install beUI AnimatedNumber with npx shadcn@latest add @beui/animated-number."
      },
      {
        "question": "How do I animate a number only when it scrolls into view?",
        "answer": "Use useInView from motion/react with once set to true, and only start the animation inside an effect once inView is true. beUI AnimatedNumber and NumberTicker do this by default through their startOnView prop."
      },
      {
        "question": "Why does my animated counter jitter or shift sideways?",
        "answer": "Proportional digits have different widths, so the string width changes every frame. Add font-variant-numeric: tabular-nums (the Tailwind tabular-nums class), and reserve width or pad the value when it can gain digits."
      },
      {
        "question": "What is the difference between a count-up and a number ticker?",
        "answer": "A count-up animates the value itself from a start to a target and shows every number in between. A ticker animates each digit independently, rolling a column of 0 to 9 into place, which suits live values that change often."
      },
      {
        "question": "Are animated numbers accessible to screen readers?",
        "answer": "They can be. Put the final value in a visually hidden element, hide the animated copy with aria-hidden, and avoid aria-live on values that update on their own. Respect reduced motion by showing the final value without counting."
      }
    ],
    "components": [
      "number",
      "adaptive-stepper",
      "text-animation"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "ai-chat-ui-react",
    "title": "AI Chat UI in React: Build a Streaming Chat Interface",
    "description": "Build an AI chat interface in React: message list, auto-scroll that releases when the reader scrolls up, streaming replies, prompt input and loading states.",
    "heading": "How to build an AI chat interface in React",
    "intro": "A chat interface for an AI model looks simple and hides a lot of state: a list that grows while a reply streams in, a scroll position that should follow the output but never fight the reader, a composer that knows when to send and when to stop, and a loading state for the gap before the first token. This guide breaks the interface into those parts and builds it with beUI's AI agent components, which install as source through the shadcn CLI.",
    "sections": [
      {
        "heading": "The parts of an AI chat UI",
        "paragraphs": [
          "Most AI chat screens share the same anatomy. Keep each part separate so you can change one without touching the others, and so the streaming logic never leaks into presentational components."
        ],
        "list": [
          "Message list: rows for the user and the assistant, with avatars, names and timestamps.",
          "Scroll viewport: follows new output at the bottom and lets go when the reader scrolls up.",
          "Streaming response: the assistant text as it arrives, with copy, retry and feedback once it completes.",
          "Prompt input: an auto-growing textarea that sends on Enter and turns into a stop button while a reply runs.",
          "Loading and thinking states: something calm to show between sending and the first token.",
          "Tool calls: visible records of what the agent ran and what came back."
        ]
      },
      {
        "heading": "Install the beUI AI agent components",
        "paragraphs": [
          "Each component installs from the @beui namespace in the shadcn registry into components/agents. Installing message also brings message-bubble, which it imports. Agent loading states install per variant, so pick thinking-shimmer, reasoning-text or agent-progress. If you want the whole workspace with a sidebar, chat-app installs the shell plus the components its example composes."
        ],
        "code": {
          "code": "npx shadcn@latest add @beui/message @beui/message-scroller @beui/prompt-input @beui/streaming-response @beui/thinking-shimmer",
          "lang": "bash",
          "filename": "Terminal"
        }
      },
      {
        "heading": "Message list and auto-scroll that releases when the reader scrolls up",
        "paragraphs": [
          "The classic bug in chat UIs is a scroll container that jumps to the bottom on every token, so anyone who scrolls up to reread an earlier answer gets dragged back down. The fix is to follow only while the reader is at the live edge. MessageScroller watches its content with a ResizeObserver and scrolls to the end when content grows, but only while the reader is within followThreshold pixels of the bottom (56 by default). Scrolling up with the wheel, touch, ArrowUp, PageUp or Home releases it; scrolling back down to the end resumes following.",
          "Wrap the rows in MessageGroup and render each one with Message, which takes from set to user or assistant and lays the row out on the correct side. MessageAvatar, MessageHeader, MessageContent and MessageFooter fill in the row, and MessageBubble with MessageBubbleContent draws the bubble in a variant such as solid, soft or ghost. Set animateIn on newly sent rows for a short pop-up from the live edge; leave it off for history so a long conversation does not animate on load.",
          "MessageScroller also takes onFollowChange, which reports when the reader leaves or returns to the live edge, so you can show a jump to latest button. Set navigation to rail for a compact rail that previews and scrolls to individual messages; give each Message an id when you use it."
        ],
        "code": {
          "code": "\"use client\";\n\nimport { useState } from \"react\";\nimport { ThinkingShimmer } from \"@/components/agents/loading-states/thinking-shimmer\";\nimport {\n  Message,\n  MessageAvatar,\n  MessageContent,\n  MessageGroup,\n} from \"@/components/agents/message\";\nimport { MessageBubble, MessageBubbleContent } from \"@/components/agents/message-bubble\";\nimport { MessageScroller } from \"@/components/agents/message-scroller\";\nimport { PromptInput } from \"@/components/agents/prompt-input\";\nimport { StreamingResponse } from \"@/components/agents/streaming-response\";\nimport { streamReply } from \"./stream-reply\";\n\ntype ChatMessage = {\n  id: string;\n  from: \"user\" | \"assistant\";\n  content: string;\n  streaming?: boolean;\n};\n\nexport function Chat() {\n  const [messages, setMessages] = useState<ChatMessage[]>([]);\n  const [input, setInput] = useState(\"\");\n  const [waiting, setWaiting] = useState(false);\n  const busy = waiting || messages.some((m) => m.streaming);\n\n  async function send(prompt: string) {\n    const id = crypto.randomUUID();\n    setMessages((m) => [...m, { id: `u-${id}`, from: \"user\", content: prompt }]);\n    setInput(\"\");\n    setWaiting(true);\n    await streamReply(prompt, `a-${id}`, setMessages, () => setWaiting(false));\n  }\n\n  return (\n    <div className=\"flex h-[640px] flex-col rounded-2xl border border-border\">\n      <MessageScroller busy={busy} className=\"min-h-0 flex-1\" viewportClassName=\"px-4 py-5\">\n        <MessageGroup spacing=\"default\">\n          {messages.map((message) => (\n            <Message key={message.id} id={message.id} from={message.from} animateIn>\n              <MessageAvatar>{message.from === \"user\" ? \"You\" : \"AI\"}</MessageAvatar>\n              <MessageContent>\n                <MessageBubble variant={message.from === \"user\" ? \"solid\" : \"soft\"}>\n                  <MessageBubbleContent>\n                    {message.from === \"assistant\" ? (\n                      <StreamingResponse\n                        status={message.streaming ? \"streaming\" : \"complete\"}\n                        copyText={message.content}\n                        announce={false}\n                      >\n                        {message.content}\n                      </StreamingResponse>\n                    ) : (\n                      message.content\n                    )}\n                  </MessageBubbleContent>\n                </MessageBubble>\n              </MessageContent>\n            </Message>\n          ))}\n          {waiting ? (\n            <Message from=\"assistant\" animateIn>\n              <MessageAvatar>AI</MessageAvatar>\n              <MessageContent>\n                <ThinkingShimmer>Thinking…</ThinkingShimmer>\n              </MessageContent>\n            </Message>\n          ) : null}\n        </MessageGroup>\n      </MessageScroller>\n\n      <div className=\"border-border border-t p-3\">\n        <PromptInput\n          value={input}\n          onValueChange={setInput}\n          onSubmit={send}\n          loading={busy}\n          minRows={1}\n          maxRows={6}\n          placeholder=\"Ask anything…\"\n        />\n      </div>\n    </div>\n  );\n}",
          "lang": "tsx",
          "filename": "chat.tsx"
        }
      },
      {
        "heading": "Streaming the response token by token",
        "paragraphs": [
          "Read the response body as a stream and append each decoded chunk to the assistant message in state. Keep a streaming flag on the message and clear it when the stream ends. Wrap the assistant text in StreamingResponse with status set to streaming or complete: its copy, retry and feedback actions only appear once the response is no longer streaming, so they never jump around under a growing paragraph.",
          "StreamingResponse renders whatever children you give it, so pass plain text or the output of your Markdown renderer. Pass copyText with the raw text for the copy action, onRetry to show a retry button, and sources to add an expandable source summary after streaming. The example below uses fetch with a plain text stream; the same shape works with any SDK that yields chunks."
        ],
        "code": {
          "code": "import type { Dispatch, SetStateAction } from \"react\";\n\nexport type ChatMessage = {\n  id: string;\n  from: \"user\" | \"assistant\";\n  content: string;\n  streaming?: boolean;\n};\n\nexport async function streamReply(\n  prompt: string,\n  id: string,\n  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,\n  onFirstToken: () => void,\n) {\n  const res = await fetch(\"/api/chat\", {\n    method: \"POST\",\n    headers: { \"content-type\": \"application/json\" },\n    body: JSON.stringify({ prompt }),\n  });\n  if (!res.body) throw new Error(\"No response body\");\n\n  const reader = res.body.getReader();\n  const decoder = new TextDecoder();\n  let started = false;\n\n  while (true) {\n    const { done, value } = await reader.read();\n    if (done) break;\n    const chunk = decoder.decode(value, { stream: true });\n    if (!started) {\n      started = true;\n      onFirstToken(); // swap the thinking row for the real message\n      setMessages((m) => [...m, { id, from: \"assistant\", content: chunk, streaming: true }]);\n      continue;\n    }\n    setMessages((m) =>\n      m.map((msg) => (msg.id === id ? { ...msg, content: msg.content + chunk } : msg)),\n    );\n  }\n\n  setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, streaming: false } : msg)));\n}",
          "lang": "ts",
          "filename": "stream-reply.ts"
        }
      },
      {
        "heading": "Prompt input, loading states and tool calls",
        "paragraphs": [
          "PromptInput grows with its content between minRows and maxRows, sends on Enter, inserts a newline on Shift+Enter, and ignores Enter while an input method editor is composing text. Pass onSubmit to receive the prompt and the selected model, loading while a reply runs, and onStop to turn the send button into a stop button. models with model or defaultModel add a model picker, and actions with onAction add a menu for attachments or context.",
          "Between send and first token, show a thinking row. ThinkingShimmer is a quiet shimmer over a status label. ReasoningText cycles through phrases with an ASCII loader. AgentProgress shows an activity glyph, a verb and a live timer for longer runs. For tool calls, beUI ToolResult shows terminal output or a request payload with running, success, error and cancelled states, and collapses when the run completes."
        ],
        "code": {
          "code": "import { ToolResult, ToolResultOutput } from \"@/components/agents/tool-result\";\n\nexport function TestRun({ running, output }: { running: boolean; output: string }) {\n  return (\n    <ToolResult\n      tool=\"terminal.run\"\n      title={running ? \"Running tests\" : \"Tests passed\"}\n      status={running ? \"running\" : \"success\"}\n      kind=\"terminal\"\n      meta={running ? \"Live\" : \"2.8s\"}\n      defaultOpen\n    >\n      <ToolResultOutput>{output}</ToolResultOutput>\n    </ToolResult>\n  );\n}",
          "lang": "tsx",
          "filename": "test-run.tsx"
        }
      },
      {
        "heading": "Accessibility for AI chat interfaces",
        "paragraphs": [
          "The transcript needs to be announced without flooding the screen reader. MessageScroller labels its viewport (Conversation by default, change it with label) and renders the content as a log region with aria-live polite and aria-relevant set to additions and text, and it sets aria-busy from the busy prop while a reply is in progress. StreamingResponse has its own polite live region; inside MessageScroller, pass announce={false} so the same text is not announced twice.",
          "Each Message is an article labelled user message or assistant message unless you pass your own aria-label. PromptInput is labelled Prompt by default. ReasoningText and AgentProgress use role status. Under reduced motion, Message drops its pop-up so new rows appear in place, MessageScroller scrolls instantly instead of smoothly, and MessageTyping, ReasoningText and AgentProgress read useReducedMotion to remove their movement."
        ],
        "list": [
          "Give the transcript a meaningful label if the page has more than one conversation.",
          "Pass busy to MessageScroller while a reply streams.",
          "Set announce={false} on StreamingResponse inside a MessageScroller.",
          "Keep the composer reachable and focused after sending so keyboard users can continue."
        ]
      }
    ],
    "faq": [
      {
        "question": "How do I build a ChatGPT-style chat UI in React?",
        "answer": "Split it into a message list, a scroll viewport that follows new output, a streaming response surface and a prompt input. beUI provides Message, MessageScroller, StreamingResponse and PromptInput for those parts, installed with npx shadcn@latest add @beui/<name>."
      },
      {
        "question": "How do I auto-scroll a chat to the bottom without fighting the user?",
        "answer": "Only follow while the reader is near the bottom. Measure the distance from the end on scroll, stop following when they scroll up, and resume when they return to the end. beUI MessageScroller does this with a configurable followThreshold."
      },
      {
        "question": "How do I stream an AI response in React?",
        "answer": "Read the response body with a stream reader, decode each chunk and append it to the assistant message in state. Mark the message as streaming until the stream ends, then show completion actions such as copy and retry."
      },
      {
        "question": "What should a chat UI show while the AI is thinking?",
        "answer": "Show a calm status row in the assistant's position, such as a shimmering Thinking label, then replace it with the real message when the first token arrives. For long agent runs, a label with an elapsed timer sets expectations better than a spinner."
      },
      {
        "question": "Do beUI chat components depend on a specific AI SDK?",
        "answer": "No. They take plain props such as message content, status and callbacks, so you can drive them from fetch, the Vercel AI SDK, or any client that streams text."
      },
      {
        "question": "How do I make a chat transcript accessible to screen readers?",
        "answer": "Render the transcript as a log region with aria-live polite, set aria-busy while a reply streams, and avoid nesting a second live region that repeats the same text. beUI MessageScroller handles the log region for you."
      }
    ],
    "components": [
      "chat-app",
      "message",
      "message-scroller",
      "prompt-input",
      "streaming-response",
      "loading-states"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  }
];

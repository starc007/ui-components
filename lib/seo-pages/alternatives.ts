import type { AlternativePage } from "@/lib/seo-pages/types";

export const alternativePages: AlternativePage[] = [
  {
    "slug": "aceternity-ui",
    "title": "Aceternity UI Alternative: Free Animated React Components",
    "description": "Comparing Aceternity UI and beUI: license, pricing, shadcn CLI installs, Framer Motion and Tailwind CSS, plus when each library is the better pick.",
    "heading": "An Aceternity UI alternative for animated React components",
    "intro": "Aceternity UI is a popular collection of animated React components, blocks and templates built with Tailwind CSS and Framer Motion, aimed at standout landing pages. beUI covers similar ground with a different emphasis: free, MIT-licensed interface primitives, charts and AI agent components that install through the same shadcn CLI. This page compares the two fairly so you can pick the right one, or use both.",
    "competitor": "Aceternity UI",
    "competitorUrl": "https://ui.aceternity.com",
    "comparison": [
      {
        "label": "License",
        "beui": "MIT, free and open source",
        "other": "Free components; paid items covered by the Aceternity License (see its licence page)"
      },
      {
        "label": "Price",
        "beui": "Free, no paid tier needed for any beUI component",
        "other": "Free plan plus paid All-Access, Lifetime and Team plans, one-time payment (as of October 2026)"
      },
      {
        "label": "Install",
        "beui": "shadcn CLI (npx shadcn@latest add @beui/<slug>) or copy the source from the page",
        "other": "shadcn CLI with the @aceternity namespace, or manual copy-paste"
      },
      {
        "label": "Animation library",
        "beui": "Framer Motion (the motion package), shared tokens in lib/ease.ts",
        "other": "Framer Motion (Motion for React)"
      },
      {
        "label": "Styling",
        "beui": "Tailwind CSS 4, TypeScript, React 19",
        "other": "Tailwind CSS (Pro templates on Next.js 15 and Tailwind CSS v4)"
      },
      {
        "label": "Focus",
        "beui": "App interface primitives, charts, AI agent UI and composed blocks",
        "other": "Landing page effects, backgrounds, sections, blocks and full templates"
      },
      {
        "label": "React Native",
        "beui": "Yes, beUI Native ports with Reanimated and Gesture Handler (npx beui-native add <slug>)",
        "other": "Not listed on its site as of October 2026"
      },
      {
        "label": "AI agent components",
        "beui": "Yes, a dedicated AI Agents category (messages, prompt input, tool approval, streaming, citations)",
        "other": "Has an AI chat interface block and supports installs by AI agents via MCP"
      },
      {
        "label": "Reduced motion",
        "beui": "Movement gated behind useReducedMotion; opacity and color transitions stay",
        "other": "Check each component's source"
      },
      {
        "label": "Source ownership",
        "beui": "Source copied into your repo; you own and edit it",
        "other": "Source copied into your project"
      }
    ],
    "sections": [
      {
        "heading": "What is Aceternity UI good at?",
        "paragraphs": [
          "Aceternity UI describes itself as a React component library for beautiful landing pages. Its catalog leans into visual effects: aurora and beam backgrounds, sparkles, 3D card effects, parallax and scroll showcases, animated text and hero sections. On top of the free components it sells All-Access plans with blocks and complete marketing, SaaS and portfolio templates.",
          "If you are building a marketing site and want a dramatic hero or section ready to paste, that breadth of landing page material is its main strength. Components install with the shadcn CLI from the @aceternity registry, so adding one is a single command."
        ]
      },
      {
        "heading": "Where does beUI differ from Aceternity UI?",
        "paragraphs": [
          "beUI focuses on the interface inside the product rather than the marketing page around it. Its 107 web components are split across Components (tabs, select, combobox, tooltip, popover, switch, sliders), Charts, AI Agents and Blocks such as a command palette, dynamic island and swap widget.",
          "Every beUI component is free under the MIT license, with no paid tier required. Motion values come from one set of shared tokens, and transform-based movement is gated behind useReducedMotion so people who ask for less motion still get opacity and color feedback. Decorative hover effects such as the tilt card only run on devices that can hover."
        ],
        "list": [
          "Controlled and uncontrolled APIs on larger components (value, defaultValue, onChange)",
          "Keyboard and focus handling on overlays, menus and lists",
          "React Native versions of many components through beUI Native",
          "An MCP server, llms.txt and agent skill so coding assistants can find and install components"
        ]
      },
      {
        "heading": "How do I install a beUI component?",
        "paragraphs": [
          "beUI is listed in the official shadcn registry directory as @beui, so the install works exactly like an Aceternity UI install. The command below adds the 3D tilt card with its cursor-tracked glare. The source lands in your components folder, ready to edit."
        ],
        "code": {
          "code": "# once per project, if components.json does not exist yet\nnpx shadcn@latest init\n\nnpx shadcn@latest add @beui/tilt-card",
          "lang": "bash",
          "filename": "terminal"
        }
      },
      {
        "heading": "Can I use Aceternity UI and beUI together?",
        "paragraphs": [
          "Yes. Both copy plain source files into your project, both use Tailwind CSS and Framer Motion, and both install through the shadcn CLI, so they sit side by side without conflict. A common split is Aceternity UI for marketing sections and backgrounds, and beUI for the app: forms, menus, charts and agent chat.",
          "If you are moving from one to the other, there is no runtime package to uninstall. Replace components one at a time, check that each import path points at the file you installed, and remove the old file once nothing imports it."
        ]
      },
      {
        "heading": "When is Aceternity UI the better pick?",
        "paragraphs": [
          "Choose Aceternity UI when your main job is a visually striking landing page and you want ready-made sections or a full template to start from. Its library of backgrounds, hero sections and paid templates is built for exactly that, and a one-time purchase can save days on a marketing site.",
          "Choose beUI when you need free, accessible primitives for the product itself, charts, AI agent interfaces or React Native parity."
        ]
      }
    ],
    "faq": [
      {
        "question": "Is there a free alternative to Aceternity UI?",
        "answer": "beUI is a free, MIT-licensed library of animated React components that installs through the shadcn CLI. Aceternity UI also offers free components alongside its paid All-Access plans."
      },
      {
        "question": "Does beUI use Framer Motion like Aceternity UI?",
        "answer": "Yes. beUI components are built with Framer Motion (the motion package), Tailwind CSS 4 and TypeScript, so the stack matches Aceternity UI closely."
      },
      {
        "question": "Can I install beUI with the shadcn CLI?",
        "answer": "Yes. beUI is in the official shadcn registry directory as @beui. Run npx shadcn@latest add @beui/ followed by the component slug, for example @beui/tilt-card."
      },
      {
        "question": "Will beUI conflict with Aceternity UI components in the same project?",
        "answer": "No. Both copy source files into your project rather than installing a shared runtime, so they can be used side by side."
      },
      {
        "question": "Does beUI have landing page templates?",
        "answer": "beUI focuses on components and composed blocks rather than full page templates. For complete marketing templates, Aceternity UI's paid plans are a strong option."
      }
    ],
    "components": [
      "tilt-card",
      "marquee",
      "dock",
      "text-animation",
      "shader-background",
      "button"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "magic-ui",
    "title": "Magic UI Alternative: Free Animated React Components",
    "description": "Magic UI vs beUI: both free, open source and shadcn-compatible. Compare stacks, install, charts, AI agent components and React Native support.",
    "heading": "A Magic UI alternative for animated React components",
    "intro": "Magic UI is a free, open-source library of animated components and effects built with React, TypeScript, Tailwind CSS and Framer Motion, positioned as a companion to shadcn/ui. beUI shares that stack and install path but spends its effort on application primitives, charts and AI agent interfaces. Here is how the two compare and when each one fits.",
    "competitor": "Magic UI",
    "competitorUrl": "https://magicui.design",
    "comparison": [
      {
        "label": "License",
        "beui": "MIT, free and open source",
        "other": "MIT, free and open source"
      },
      {
        "label": "Price",
        "beui": "Free",
        "other": "Free components; Magic UI Pro sells blocks and templates (as of October 2026)"
      },
      {
        "label": "Install",
        "beui": "shadcn CLI (npx shadcn@latest add @beui/<slug>) or copy the source from the page",
        "other": "shadcn CLI with the @magicui namespace (same process as shadcn/ui)"
      },
      {
        "label": "Animation library",
        "beui": "Framer Motion (the motion package), shared tokens in lib/ease.ts",
        "other": "Framer Motion (Motion)"
      },
      {
        "label": "Styling",
        "beui": "Tailwind CSS 4, TypeScript, React 19",
        "other": "Tailwind CSS, TypeScript, React"
      },
      {
        "label": "Focus",
        "beui": "App primitives, charts, AI agent UI and composed blocks",
        "other": "Landing page effects, text animations, backgrounds and device mockups"
      },
      {
        "label": "React Native",
        "beui": "Yes, beUI Native ports with Reanimated and Gesture Handler (npx beui-native add <slug>)",
        "other": "Not listed on its site as of October 2026"
      },
      {
        "label": "Charts",
        "beui": "Yes, a Charts category (treemap, candlestick, donut, funnel, heat calendar and more)",
        "other": "Not a category in its docs as of October 2026"
      },
      {
        "label": "AI tooling",
        "beui": "MCP server, llms.txt and an agent skill",
        "other": "MCP documented in its docs"
      },
      {
        "label": "Source ownership",
        "beui": "Source copied into your repo; you own and edit it",
        "other": "Source copied into your project"
      }
    ],
    "sections": [
      {
        "heading": "What is Magic UI good at?",
        "paragraphs": [
          "Magic UI calls itself a UI library for design engineers. Its free catalog is full of polished landing page pieces: marquee, bento grid, globe, dock, animated beams and borders, number ticker, shimmer and rainbow buttons, a wide range of text animations, background patterns and device mockups such as Safari and iPhone frames.",
          "It installs with the same process as shadcn/ui and is MIT licensed, which makes it an easy, low-risk addition to any shadcn project. Magic UI Pro adds paid blocks and templates for teams that want complete pages."
        ]
      },
      {
        "heading": "Where does beUI differ from Magic UI?",
        "paragraphs": [
          "The libraries overlap on effects like marquee, dock, number tickers and text reveals, and both are free and MIT licensed. The difference is scope. beUI's 107 web components go deeper into the parts of a product people interact with every day: select, combobox, tooltip, popover, context menu, tabs, sliders, wheel picker, bottom sheet and toasts, with keyboard and focus behavior built in.",
          "beUI also ships two categories Magic UI does not list as of October 2026: Charts, such as treemap, candlestick and donut charts, and AI Agents, with message, prompt input, tool approval, streaming response and citation components. Many of these have React Native versions through beUI Native."
        ],
        "list": [
          "Shared motion tokens so springs and easing feel consistent across components",
          "Movement gated behind useReducedMotion, with opacity and color feedback kept",
          "Controlled and uncontrolled state on larger components"
        ]
      },
      {
        "heading": "How do I install a beUI component?",
        "paragraphs": [
          "If you already install Magic UI components with the shadcn CLI, beUI needs no extra setup. beUI is listed in shadcn's official registry directory as @beui. This command adds the rolling slot-machine number ticker."
        ],
        "code": {
          "code": "# once per project, if components.json does not exist yet\nnpx shadcn@latest init\n\nnpx shadcn@latest add @beui/number-ticker",
          "lang": "bash",
          "filename": "terminal"
        }
      },
      {
        "heading": "Can I use Magic UI and beUI in the same project?",
        "paragraphs": [
          "Yes, and many projects should. Both are copy-paste source with the same Tailwind CSS and Framer Motion stack, so they coexist cleanly. Use Magic UI for landing page flourishes and mockups, and beUI for the app's controls, charts and agent chat surfaces.",
          "Both libraries can install a file with a similar name, such as a marquee or dock. If the shadcn CLI asks before overwriting a file, choose a different path for one of them or keep the version you prefer."
        ]
      },
      {
        "heading": "When is Magic UI the better pick?",
        "paragraphs": [
          "Magic UI is the better pick when you are building a marketing or portfolio site and want a wide menu of eye-catching effects, background patterns and device frames, or when you want its paid templates to start a full page. Pick beUI when the work is inside the product: forms, menus, data visualization, AI chat, or a matching React Native app."
        ]
      }
    ],
    "faq": [
      {
        "question": "Is Magic UI free?",
        "answer": "Magic UI's components are free and open source under the MIT license. It also sells Magic UI Pro blocks and templates. beUI is free and MIT licensed too."
      },
      {
        "question": "What is the difference between Magic UI and beUI?",
        "answer": "Both use React, Tailwind CSS and Framer Motion and install through the shadcn CLI. Magic UI leans toward landing page effects; beUI adds app primitives, charts, AI agent components and React Native versions."
      },
      {
        "question": "Can I install beUI the same way as Magic UI?",
        "answer": "Yes. Run npx shadcn@latest add @beui/ followed by a slug, for example @beui/number-ticker. beUI is in shadcn's official registry directory."
      },
      {
        "question": "Does beUI have a marquee and dock like Magic UI?",
        "answer": "Yes. beUI has an infinite horizontal or vertical marquee with pause on hover, and a macOS-style dock with grouped actions and a gliding active pill."
      },
      {
        "question": "Does beUI support React Native?",
        "answer": "Yes. beUI Native offers React Native versions of many components, built with Reanimated and Gesture Handler, installed with npx beui-native add."
      }
    ],
    "components": [
      "marquee",
      "number",
      "dock",
      "text-animation",
      "theme-toggle",
      "button"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "motion-primitives",
    "title": "Motion Primitives Alternative: Free React Motion UI",
    "description": "Motion Primitives vs beUI: two open-source Framer Motion and Tailwind CSS libraries. Compare install options, scope, charts and React Native support.",
    "heading": "A Motion Primitives alternative for React motion components",
    "intro": "Motion Primitives is an open-source UI kit of animated components built with Framer Motion and Tailwind CSS, with a focus on clean, reusable building blocks. beUI is built on the same foundation and shares that primitive-first approach, while covering more application controls, charts and AI agent interfaces. This page compares them side by side.",
    "competitor": "Motion Primitives",
    "competitorUrl": "https://motion-primitives.com",
    "comparison": [
      {
        "label": "License",
        "beui": "MIT, free and open source",
        "other": "MIT, open source"
      },
      {
        "label": "Price",
        "beui": "Free",
        "other": "Free; Motion-Primitives Pro sells premium components, sections and templates (as of October 2026)"
      },
      {
        "label": "Install",
        "beui": "shadcn CLI (npx shadcn@latest add @beui/<slug>) or copy the source from the page",
        "other": "Its own CLI (npx motion-primitives@latest add), shadcn registry as @motion-primitives, or manual"
      },
      {
        "label": "Animation library",
        "beui": "Framer Motion (the motion package), shared tokens in lib/ease.ts",
        "other": "Framer Motion (Motion)"
      },
      {
        "label": "Styling",
        "beui": "Tailwind CSS 4, TypeScript, React 19",
        "other": "Tailwind CSS"
      },
      {
        "label": "Focus",
        "beui": "App primitives, charts, AI agent UI and composed blocks",
        "other": "Motion building blocks: text effects, number effects, dialogs, docks, toolbars"
      },
      {
        "label": "React Native",
        "beui": "Yes, beUI Native ports with Reanimated and Gesture Handler (npx beui-native add <slug>)",
        "other": "Not listed on its site as of October 2026"
      },
      {
        "label": "AI agent components",
        "beui": "Yes, a dedicated AI Agents category (messages, prompt input, tool approval, streaming, citations)",
        "other": "Not a category in its docs as of October 2026"
      },
      {
        "label": "Charts",
        "beui": "Yes, a Charts category (treemap, candlestick, donut, funnel, heat calendar and more)",
        "other": "Not a category in its docs as of October 2026"
      },
      {
        "label": "Source ownership",
        "beui": "Source copied into your repo; you own and edit it",
        "other": "Source copied into your project"
      }
    ],
    "sections": [
      {
        "heading": "What is Motion Primitives good at?",
        "paragraphs": [
          "Motion Primitives describes itself as a UI kit to make beautiful, animated interfaces faster: easy copy-paste, customizable and open source. Its docs group components into core components (accordion, animated background, carousel, dialog, disclosure, infinite slider), text effects (text effect, loop, morph, roll, scramble, shimmer), number effects, interactive elements such as dock, tilt and spotlight, toolbars, and advanced effects like morphing dialog, morphing popover and progressive blur.",
          "Each component has examples and documentation, and installs through its own CLI, the shadcn registry, or by hand. A Pro offering adds premium sections and templates."
        ]
      },
      {
        "heading": "Where does beUI differ from Motion Primitives?",
        "paragraphs": [
          "The philosophy is close: small, composable motion pieces built on Framer Motion and Tailwind CSS that you copy and own. beUI pushes that approach into a larger surface of product UI. Its 107 web components include form and selection controls (select, combobox, multi select, checkbox, radio, sliders, wheel picker, OTP input), overlays (tooltip, popover, context menu, drawer, bottom sheet), Charts and an AI Agents category.",
          "Larger beUI components support controlled and uncontrolled state, overlays manage focus and keyboard input, and transform-based motion is gated behind useReducedMotion. Shared tokens in lib/ease.ts keep springs and easing consistent from one component to the next."
        ]
      },
      {
        "heading": "How do I install a beUI component?",
        "paragraphs": [
          "beUI uses the shadcn CLI directly and is listed in its official registry directory as @beui. This example adds the text shimmer, a gradient sweep for loading or emphasis. You can add several components in one go."
        ],
        "code": {
          "code": "# once per project, if components.json does not exist yet\nnpx shadcn@latest init\n\nnpx shadcn@latest add @beui/text-shimmer\nnpx shadcn@latest add @beui/dock",
          "lang": "bash",
          "filename": "terminal"
        }
      },
      {
        "heading": "Can I use Motion Primitives and beUI together?",
        "paragraphs": [
          "Yes. Both depend on Framer Motion and Tailwind CSS and both write source into your project, so there is no runtime conflict and only one copy of Framer Motion is needed. You might keep a Motion Primitives morphing dialog or text effect you already like and add beUI for charts, agent chat or menus.",
          "To migrate a single piece, install the beUI equivalent, update the import and props at each call site, then delete the old file once nothing imports it."
        ]
      },
      {
        "heading": "When is Motion Primitives the better pick?",
        "paragraphs": [
          "Motion Primitives is a strong pick when you want a focused, compact set of motion building blocks, such as its text effects, morphing dialog or progressive blur, and prefer its CLI and documentation style. Pick beUI when you need a broader catalog of product controls, data visualization, AI agent interfaces or React Native versions."
        ]
      }
    ],
    "faq": [
      {
        "question": "Is Motion Primitives open source?",
        "answer": "Yes. Motion Primitives is open source under the MIT license, with a separate paid Pro offering. beUI is also MIT licensed and free."
      },
      {
        "question": "Do Motion Primitives and beUI both use Framer Motion?",
        "answer": "Yes. Both are built with Framer Motion (the motion package) and Tailwind CSS, so they share dependencies when used together."
      },
      {
        "question": "How do I install beUI components?",
        "answer": "Run npx shadcn@latest add @beui/ followed by a slug, such as @beui/text-shimmer, or copy the source from its beUI component page."
      },
      {
        "question": "Does beUI have text effects like Motion Primitives?",
        "answer": "Yes. beUI's text animations include spring word and character reveals, a chromatic sweep, shimmer, a letter cascade and a character scramble."
      },
      {
        "question": "Does beUI support reduced motion?",
        "answer": "Yes. beUI gates transform-based movement behind useReducedMotion and keeps opacity and color transitions so feedback still reads."
      }
    ],
    "components": [
      "text-animation",
      "dock",
      "tilt-card",
      "morphing-modal",
      "popover",
      "number"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "react-bits",
    "title": "React Bits Alternative: Free Animated React Components",
    "description": "React Bits vs beUI: compare license, shadcn CLI installs, JS and TS variants, charts, AI agent components and React Native support, fairly.",
    "heading": "A React Bits alternative for animated React components",
    "intro": "React Bits is a free, open-source library of animated React components and backgrounds for creative developers, offered in JavaScript or TypeScript with plain CSS or Tailwind. beUI is a Framer Motion and Tailwind CSS library centered on product interfaces, charts and AI agent UI. Both install as source through the shadcn CLI. Here is how they compare.",
    "competitor": "React Bits",
    "competitorUrl": "https://reactbits.dev",
    "comparison": [
      {
        "label": "License",
        "beui": "MIT, free and open source",
        "other": "MIT + Commons Clause: free for personal and commercial apps, but the components themselves may not be sold or redistributed"
      },
      {
        "label": "Price",
        "beui": "Free",
        "other": "Free components and tools; a Pro section is linked from its site (as of October 2026)"
      },
      {
        "label": "Install",
        "beui": "shadcn CLI (npx shadcn@latest add @beui/<slug>) or copy the source from the page",
        "other": "shadcn CLI with the @react-bits namespace, or copy files by hand"
      },
      {
        "label": "Language and styling",
        "beui": "Tailwind CSS 4, TypeScript, React 19",
        "other": "Four variants per component: JS or TS, with plain CSS or Tailwind"
      },
      {
        "label": "Animation library",
        "beui": "Framer Motion (the motion package), shared tokens in lib/ease.ts",
        "other": "Depends on the component; dependencies are listed on each page"
      },
      {
        "label": "Focus",
        "beui": "App primitives, charts, AI agent UI and composed blocks",
        "other": "Text animations, animations, backgrounds and micro interactions"
      },
      {
        "label": "React Native",
        "beui": "Yes, beUI Native ports with Reanimated and Gesture Handler (npx beui-native add <slug>)",
        "other": "Not listed on its site as of October 2026"
      },
      {
        "label": "AI agent components",
        "beui": "Yes, a dedicated AI Agents category (messages, prompt input, tool approval, streaming, citations)",
        "other": "Not a category on its site as of October 2026"
      },
      {
        "label": "AI tooling",
        "beui": "MCP server, llms.txt and an agent skill",
        "other": "Copy for AI, Copy as Markdown, MCP via the shadcn MCP server, llms.txt"
      }
    ],
    "sections": [
      {
        "heading": "What is React Bits good at?",
        "paragraphs": [
          "React Bits is built for creative work. Its library is organized into text animations, animations, backgrounds and micro interactions, and every component comes in four flavors: JavaScript or TypeScript, styled with plain CSS or Tailwind. That flexibility is useful if your project does not use TypeScript or Tailwind.",
          "It also ships free creative tools on its site, including a background studio for tuning and exporting animated backgrounds, and it supports AI workflows with Copy for AI buttons, Markdown copies of docs pages, the shadcn MCP server and an llms.txt map."
        ]
      },
      {
        "heading": "Where does beUI differ from React Bits?",
        "paragraphs": [
          "beUI is TypeScript and Tailwind CSS 4 only, and its components are built on one animation library, Framer Motion, with shared motion tokens. In exchange for that narrower stack you get a catalog aimed at the product itself: 107 web components across primitives such as select, combobox, tooltip and sliders, Charts, AI Agents, and composed Blocks.",
          "Licensing also differs. beUI uses the plain MIT license. React Bits uses MIT with the Commons Clause, which allows use in any app or product but does not allow selling or redistributing the components themselves. Read each license for your own case."
        ],
        "list": [
          "Transform-based motion gated behind useReducedMotion",
          "Keyboard and focus handling on overlays and lists",
          "React Native versions of many components through beUI Native"
        ]
      },
      {
        "heading": "How do I install a beUI component?",
        "paragraphs": [
          "React Bits and beUI both install through the shadcn CLI, so the workflow is the same. beUI is listed in shadcn's official registry directory as @beui. This command adds the shader background, a set of canvas shader variants whose animation freezes under reduced motion."
        ],
        "code": {
          "code": "# once per project, if components.json does not exist yet\nnpx shadcn@latest init\n\nnpx shadcn@latest add @beui/shader-background",
          "lang": "bash",
          "filename": "terminal"
        }
      },
      {
        "heading": "Can I use React Bits and beUI together?",
        "paragraphs": [
          "Yes. Both copy source into your project, so a React Bits background or text animation can sit on the same page as beUI menus, charts and chat components. If you pick React Bits' Tailwind variants, both libraries share the same styling approach.",
          "Check the dependencies each React Bits component lists so you know which animation libraries end up in your bundle alongside Framer Motion."
        ]
      },
      {
        "heading": "When is React Bits the better pick?",
        "paragraphs": [
          "React Bits is the better pick for creative and portfolio work that leans on striking backgrounds and text effects, for projects in plain JavaScript or plain CSS, and when its free design tools fit your workflow. Pick beUI when you need consistent product controls, charts, AI agent interfaces or React Native parity under a plain MIT license."
        ]
      }
    ],
    "faq": [
      {
        "question": "Is React Bits free for commercial use?",
        "answer": "Its site says it is free for personal and commercial work under MIT + Commons Clause, with the restriction that the components themselves may not be sold or redistributed. beUI is plain MIT."
      },
      {
        "question": "Does beUI offer JavaScript or plain CSS versions?",
        "answer": "No. beUI components are written in TypeScript and styled with Tailwind CSS 4. React Bits offers JS and TS with CSS or Tailwind variants."
      },
      {
        "question": "Can I install beUI with the shadcn CLI like React Bits?",
        "answer": "Yes. Run npx shadcn@latest add @beui/ followed by a slug, for example @beui/shader-background."
      },
      {
        "question": "Does beUI have animated backgrounds?",
        "answer": "Yes. beUI's shader background offers canvas variants such as mesh gradient, grain, warp, waves and voronoi through a single typed variant prop."
      },
      {
        "question": "Can React Bits and beUI be used in one project?",
        "answer": "Yes. Both install as source files you own, so they can be mixed freely on the same page."
      }
    ],
    "components": [
      "shader-background",
      "text-animation",
      "cylinder-carousel",
      "loader",
      "tilt-card",
      "marquee"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "animata",
    "title": "Animata Alternative: Free Animated React Components",
    "description": "Animata vs beUI: two free, open-source Tailwind CSS and Framer Motion libraries. Compare install, scope, charts, AI agent UI and React Native.",
    "heading": "An Animata alternative for animated React components",
    "intro": "Animata is a free, open-source collection of hand-crafted animations, effects and interactions for React and Tailwind CSS that you copy into your project. beUI is also free and open source, on Tailwind CSS and Framer Motion, with more emphasis on full interface components, charts and AI agent UI. This page lays out the differences.",
    "competitor": "Animata",
    "competitorUrl": "https://animata.design",
    "comparison": [
      {
        "label": "License",
        "beui": "MIT, free and open source",
        "other": "MIT, free and open source"
      },
      {
        "label": "Price",
        "beui": "Free",
        "other": "Free"
      },
      {
        "label": "Install",
        "beui": "shadcn CLI (npx shadcn@latest add @beui/<slug>) or copy the source from the page",
        "other": "shadcn CLI with a component URL, or manual copy-paste"
      },
      {
        "label": "Animation library",
        "beui": "Framer Motion (the motion package), shared tokens in lib/ease.ts",
        "other": "Framer Motion (the motion package) and Tailwind CSS animation utilities"
      },
      {
        "label": "Styling",
        "beui": "Tailwind CSS 4, TypeScript, React 19",
        "other": "Tailwind CSS for layout; colors and fonts left to you"
      },
      {
        "label": "Focus",
        "beui": "App primitives, charts, AI agent UI and composed blocks",
        "other": "Animations, effects and interactions to enhance an existing design"
      },
      {
        "label": "Charts",
        "beui": "Yes, a Charts category (treemap, candlestick, donut, funnel, heat calendar and more)",
        "other": "Has a graphs and charts section (bar, donut, gauge, ring)"
      },
      {
        "label": "React Native",
        "beui": "Yes, beUI Native ports with Reanimated and Gesture Handler (npx beui-native add <slug>)",
        "other": "Not listed on its site as of October 2026"
      },
      {
        "label": "AI agent components",
        "beui": "Yes, a dedicated AI Agents category (messages, prompt input, tool approval, streaming, citations)",
        "other": "Not a category on its site as of October 2026"
      }
    ],
    "sections": [
      {
        "heading": "What is Animata good at?",
        "paragraphs": [
          "Animata is clear about its scope: it is not a full UI library like Material UI or Chakra UI, but a collection of animations and effects you add to an existing design. It uses Tailwind CSS for layout and deliberately leaves colors and fonts to you, so its pieces blend into your own look.",
          "Its catalog is especially deep in text animations, with dozens of styles such as blur out, mask reveal, per-character rise and glitch text, plus buttons, backgrounds, bento grids, a marquee and simple charts. Components install with the shadcn CLI using a component URL, or by copying the code."
        ]
      },
      {
        "heading": "Where does beUI differ from Animata?",
        "paragraphs": [
          "beUI is closer to a full interface kit. Alongside motion effects it ships complete controls with state and keyboard handling: select, combobox, tooltip, popover, context menu, tabs, sliders, date range picker, OTP input and more. Larger components support controlled and uncontrolled state.",
          "Its Charts category goes further into data views such as treemap, candlestick, funnel and heat calendar, and its AI Agents category covers chat messages, prompt input, tool approval and streaming responses. beUI is in shadcn's official registry directory as @beui, so installs use a short namespaced name instead of a URL."
        ],
        "list": [
          "Shared motion tokens for consistent springs and easing",
          "Movement gated behind useReducedMotion",
          "React Native versions of many components through beUI Native"
        ]
      },
      {
        "heading": "How do I install a beUI component?",
        "paragraphs": [
          "Run the shadcn CLI with the @beui namespace. This example adds the donut chart, a composable share ring with legend rows and a center readout."
        ],
        "code": {
          "code": "# once per project, if components.json does not exist yet\nnpx shadcn@latest init\n\nnpx shadcn@latest add @beui/donut-chart",
          "lang": "bash",
          "filename": "terminal"
        }
      },
      {
        "heading": "Can I use Animata and beUI together?",
        "paragraphs": [
          "Yes. Both are Tailwind CSS and Framer Motion source you copy into your project, so they combine without a shared runtime. Animata's text and button effects pair well with beUI's controls, charts and agent components on the same screen.",
          "When swapping one component for the other, install the beUI version, update the imports and props where it is used, then remove the old file."
        ]
      },
      {
        "heading": "When is Animata the better pick?",
        "paragraphs": [
          "Animata is the better pick when you already have a design system and only want effects layered on top, especially a wide choice of text animations that inherit your own colors and fonts. Pick beUI when you need complete, stateful controls, richer charts, AI agent interfaces or React Native versions."
        ]
      }
    ],
    "faq": [
      {
        "question": "Is Animata free and open source?",
        "answer": "Yes. Animata describes itself as a free and open-source collection, and its repository uses the MIT license. beUI is free and MIT licensed as well."
      },
      {
        "question": "Can I install Animata and beUI with the shadcn CLI?",
        "answer": "Yes. Animata pages give a shadcn command with a component URL. beUI uses its registry namespace: npx shadcn@latest add @beui/donut-chart, for example."
      },
      {
        "question": "Is beUI a full UI library?",
        "answer": "beUI covers interface primitives such as select, combobox, tooltip and tabs, plus charts, AI agent components and blocks, so it can serve as more than an effects collection."
      },
      {
        "question": "Does beUI have text animations like Animata?",
        "answer": "Yes. beUI includes spring word and character reveals, chromatic sweep, shimmer, letter cascade and scramble text components."
      },
      {
        "question": "Does beUI work with React Native?",
        "answer": "Yes. beUI Native provides React Native versions of many components, installed with npx beui-native add."
      }
    ],
    "components": [
      "text-animation",
      "donut-chart",
      "composition-chart",
      "marquee",
      "button",
      "loader"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  },
  {
    "slug": "shadcn-ui-animated",
    "title": "Animated shadcn/ui Components: Free and CLI Ready",
    "description": "Free animated components that install with the shadcn CLI as @beui. Add spring motion to tabs, select, tooltip and more alongside your shadcn/ui setup.",
    "heading": "Animated shadcn/ui components that install with the same CLI",
    "intro": "shadcn/ui is an open-code set of accessible components and a code distribution system that many React apps are built on. beUI is not a replacement for it. It is a free, MIT-licensed registry of animated components listed in shadcn's official registry directory as @beui, so you can add Framer Motion polish with the CLI you already use.",
    "competitor": "shadcn/ui",
    "competitorUrl": "https://ui.shadcn.com",
    "comparison": [
      {
        "label": "What it is",
        "beui": "A registry of animated components, charts, AI agent UI and blocks",
        "other": "Open-code components plus a schema and CLI for distributing code; how you build your component library"
      },
      {
        "label": "License",
        "beui": "MIT, free and open source",
        "other": "MIT, open source"
      },
      {
        "label": "Install",
        "beui": "npx shadcn@latest add @beui/<slug>",
        "other": "npx shadcn@latest add <component>; third-party registries via @namespace"
      },
      {
        "label": "Animation",
        "beui": "Framer Motion springs and gestures, shared tokens in lib/ease.ts",
        "other": "CSS transitions and animation utilities (tw-animate-css with Tailwind CSS v4)"
      },
      {
        "label": "Styling",
        "beui": "Tailwind CSS 4, TypeScript, React 19",
        "other": "Tailwind CSS with theme CSS variables"
      },
      {
        "label": "Primitives",
        "beui": "Built in beUI's own source on Framer Motion",
        "other": "Component versions for Radix UI and Base UI"
      },
      {
        "label": "React Native",
        "beui": "Yes, beUI Native ports with Reanimated and Gesture Handler (npx beui-native add <slug>)",
        "other": "Not listed in its docs as of October 2026"
      },
      {
        "label": "Reduced motion",
        "beui": "Movement gated behind useReducedMotion; opacity and color transitions stay",
        "other": "Mostly CSS animation; follow its docs per component"
      },
      {
        "label": "AI tooling",
        "beui": "MCP server, llms.txt and an agent skill",
        "other": "MCP server, skills and llms.txt"
      }
    ],
    "sections": [
      {
        "heading": "What is shadcn/ui good at?",
        "paragraphs": [
          "shadcn/ui describes itself as a set of beautifully designed, accessible components and a code distribution platform, and says plainly that it is not a component library but how you build your own. You get the source for every component, consistent composable APIs, strong defaults and a CLI that copies code into your project.",
          "It also defines the registry format that lets anyone publish components the CLI can install. Its registry directory lists community registries under namespaces such as @beui, which is why the rest of this page works with no extra setup. For most apps, shadcn/ui is the right foundation, and it is where to start."
        ]
      },
      {
        "heading": "What does beUI add on top of shadcn/ui?",
        "paragraphs": [
          "beUI focuses on motion. Its components use Framer Motion springs and gestures where shadcn/ui components generally use CSS transitions: tabs with a spring indicator that glides between triggers, a select panel that unfolds from its trigger, a switch with a spring-driven thumb, tooltips with scale-and-fade entry, and a combobox whose active row glides as you move through results.",
          "It also covers areas outside a base component set: Charts such as treemap and candlestick, an AI Agents category with messages, prompt input and tool approval, and Blocks like a command palette and dynamic island. Transform-based motion is gated behind useReducedMotion, and React Native versions of many components are available through beUI Native."
        ]
      },
      {
        "heading": "How do I add animated components to a shadcn/ui project?",
        "paragraphs": [
          "If your project already has a components.json from shadcn init, skip the first command. Each beUI component installs its own files, and any internal helpers it imports, into your project."
        ],
        "code": {
          "code": "# once per project, if components.json does not exist yet\nnpx shadcn@latest init\n\nnpx shadcn@latest add @beui/tabs\nnpx shadcn@latest add @beui/select\nnpx shadcn@latest add @beui/tooltip",
          "lang": "bash",
          "filename": "terminal"
        }
      },
      {
        "heading": "Can beUI and shadcn/ui components live in the same app?",
        "paragraphs": [
          "Yes, that is the intended setup. Both copy source into your repo and both use Tailwind CSS, so you can keep shadcn/ui as your base and use beUI only where motion helps, for example animated tabs on a settings page or a spring select in a signup flow.",
          "beUI motion components install under components/motion, while shadcn/ui components usually live under components/ui, so files with similar names do not collide. Import each from its own path, and swap one component at a time if you want to compare the feel."
        ]
      },
      {
        "heading": "When should I stick with plain shadcn/ui?",
        "paragraphs": [
          "Stick with shadcn/ui when you want the widest set of base components, the fewest dependencies, or CSS-only transitions. It covers far more form, layout and data components than an animation library aims to, and its Radix UI and Base UI versions give you a choice of primitive. Reach for beUI when a specific interaction should feel physical, or when you want animated charts and agent UI that install the same way."
        ]
      }
    ],
    "faq": [
      {
        "question": "Does shadcn/ui have animated components?",
        "answer": "shadcn/ui components use CSS transitions and Tailwind animation utilities. For spring-based Framer Motion versions, registries such as beUI install through the same shadcn CLI."
      },
      {
        "question": "How do I install beUI with the shadcn CLI?",
        "answer": "Run npx shadcn@latest add @beui/ followed by a component slug, for example @beui/tabs. beUI is listed in shadcn's official registry directory."
      },
      {
        "question": "Is beUI a replacement for shadcn/ui?",
        "answer": "No. beUI is designed to sit alongside shadcn/ui and adds animated components, charts and AI agent UI where you want motion."
      },
      {
        "question": "Do beUI components work with Tailwind CSS v4?",
        "answer": "Yes. beUI is built with Tailwind CSS 4, React 19, TypeScript and Framer Motion."
      },
      {
        "question": "Is beUI free?",
        "answer": "Yes. beUI is free and open source under the MIT license, like shadcn/ui."
      },
      {
        "question": "Do animated beUI components respect reduced motion?",
        "answer": "Yes. Movement is gated behind useReducedMotion, while opacity and color transitions remain so feedback is still visible."
      }
    ],
    "components": [
      "tabs",
      "select",
      "switch",
      "tooltip",
      "combobox",
      "popover"
    ],
    "publishedAt": "2026-10-18",
    "updatedAt": "2026-10-18"
  }
];

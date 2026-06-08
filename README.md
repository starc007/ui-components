# beUI v2

Bespoke motion components for React, now available through shadcn-compatible registry endpoints.

Copy. Paste. Done.

[beui.saura3h.xyz](https://beui.saura3h.xyz)

## What it is

A curated set of hand-built motion components for product UIs. Every component is a single file you own, with spring physics tuned by hand and zero third-party primitives.

- Word-by-word text reveal with blur
- Word-by-word text reveal with blur
- macOS-style magnifying dock
- Family-app morphing modal
- Vaul-style bottom sheet with drag-to-dismiss
- Command palette (⌘K) with fuzzy filter
- Tabs (pill, segment, underline) with shared layoutId
- Button family: base + multi-state (idle → loading → success / error) + magnetic
- Multi-chain swap widget with token picker bottom sheet
- Tilt cards, marquee, tooltip, switch, dock, shared layout bg, animated number, number ticker, text shimmer

Full live list at [/llms.txt](https://beui.saura3h.xyz/llms.txt), JSON at [/r](https://beui.saura3h.xyz/r), and shadcn registry catalog at [/r/registry.json](https://beui.saura3h.xyz/r/registry.json).

## Stack

- Next 15 (App Router)
- React 19
- Tailwind CSS v4
- [motion](https://motion.dev) (formerly framer-motion)
- TypeScript

## Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Using a component

Browse the site, open any component page, copy the source file into your project. Each component is self-contained and depends only on `motion`, `lucide-react`, and a `cn` helper.

## For AI agents

- `https://beui.saura3h.xyz/llms.txt` — markdown index ([llmstxt.org](https://llmstxt.org) format)
- `https://beui.saura3h.xyz/r` — JSON index of all components
- `https://beui.saura3h.xyz/r/{slug}` — JSON detail with files, deps, source
- `https://beui.saura3h.xyz/r/registry.json` — shadcn-compatible registry catalog
- `https://beui.saura3h.xyz/r/{slug}.json` — shadcn-compatible install item
- `https://beui.saura3h.xyz/r/{slug}/raw` — raw `.tsx` source (text/plain)

Each component entry lists external `dependencies` to install plus internal helpers shipped inline. Drop files at the listed paths and you are done.

## Contributing

PRs welcome. Keep components in `components/motion/`, add a preview in `components/previews/motion/`, register in `lib/registry.ts`.

## Author

Saurabh Chauhan · [@saurra3h](https://x.com/saurra3h)

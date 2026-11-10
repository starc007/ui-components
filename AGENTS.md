# beUI v2 — agent guide

React motion component library plus its docs site, distributed as copy-paste source via shadcn-compatible registry endpoints. Stack: TanStack Start (Vite), React 19, Tailwind CSS 4, motion (framer-motion) v12, use-intl, TypeScript strict, Bun, Biome. Hosted on Cloudflare Workers as static assets. Live at beui.dev.

## Commands

```bash
bun install
bun run dev             # local site (vite dev, port 3000)
bun run typecheck       # tsc for the site and for worker/
bun run lint            # biome
bun run check:registry  # every registry component can publish its files
bun run check           # typecheck, lint, registry and message validation
bun test                # accessibility tests only
bun run build           # prerender every page + static files into dist/client (~8 min)
bun run preview         # serve dist/client with the Worker (wrangler dev)
```

Prefer `typecheck` + `lint` for quick verification. Do not start the dev server or run `bun run build` unless explicitly asked; CI runs the build. In `vite dev`, a non-navigation request (plain `curl`) to a path that matches a source folder (`/components/...`, `/lib/...`) gets the source module; send browser navigation headers (`Accept: text/html`, `Sec-Fetch-Dest: document`) or use the browser.

## How the site is built and served

The site is fully static, so pages never run code per request.
- `bun run build` = `scripts/list-pages.ts` (every page path, from `lib/sitemap.ts`, into `.build/pages.json`) → `vite build` (TanStack Start prerenders each page in Node to `dist/client/<path>.html`) → `scripts/build-static.ts` (registry endpoints, Markdown, `llms.txt`, RSS, `sitemap.xml`, `robots.txt`, `registry.json`, `/{slug}.json` directory items, `theme.css`, social card PNGs, `_redirects`, `_headers`).
- Page data comes from **static server functions** (`createServerFn` + `staticFunctionMiddleware`). They run at build time, their result is embedded in the HTML, and client navigation fetches it as static JSON from `/__tsr/staticServerFnCache/`. Anything that needs the repository, Shiki (`lib/highlight.ts`), the props extractor or SEO-only messages runs inside a server function handler. Components are plain synchronous React that renders on both server and client.
- Cloudflare serves `dist/client` as static assets (`wrangler.jsonc`), which never invokes the Worker. `worker/index.ts` runs only for `run_worker_first` paths: `/r`, `/r/*`, `/native/r`, `/native/r/*` (bodies and exact headers from `dist/client/__worker/`, plus Tracwell crawler tracking) and `/api/*` (`/api/github-stars`, and `/api/og?…`, which redirects old social card URLs to the static PNG). Keep it that way: a page that needs per-request code costs money on every view.
- Redirects live in `lib/redirects.ts` (Cloudflare `_redirects` syntax). Unknown paths get the prerendered `404.html`.

## Testing policy

- Keep the automated test suite accessibility-only. Do not add or restore general unit, interaction, calculation, snapshot, styling, or animation-timing tests unless the user explicitly requests them.
- Keep accessibility audits in `tests/a11y.test.tsx` or focused `tests/*.a11y.test.tsx` files, using `tests/setup.ts`. Add coverage for meaningful accessible states, including open overlays where relevant; avoid duplicate cases.
- Run `bun run check` and `bun test` before committing. TypeScript, lint, and registry validation remain required and are separate from the accessibility suite.
- Verify changed interactions and visual behavior in the browser, including keyboard/focus behavior, touch where applicable, responsive layout, and reduced motion. Automated axe checks do not establish animation quality or complete accessibility. Report what was checked and any verification limits; the dev-server restriction above still applies.

## Layout

- `components/motion/`, `components/charts/`, and `components/agents/` — the library. One file per component; multi-file widgets get a folder (`swap/`, `button/`, `loading-states/`).
- `components/previews/` — demo per component, registered in `components/previews/index.tsx`. Previews ship through the registry too. When an interactive preview uses internal demo helpers, set the registry entry's `usageFile` to a separate public composition so the Usage tab stays copyable.
- `components/app/` — site chrome (header, hero, dock, code blocks). Not part of the library.
- `lib/registry.ts` — component catalog (slugs, files, examples). Five categories: `motion` (display name "Components", primitives), `agents` (AI and agent interface primitives), `charts` (data visualizations at `/charts`, with detail pages at `/charts/<slug>`), `casino` (games at `/casino`, with detail pages at `/casino/<slug>`), and `blocks` (composed widgets: swap, dynamic island, command palette, expandable action bar). Top-level sections are listed in `TOP_LEVEL_CATEGORIES` (`lib/component-paths.ts`). Blocks and casino emit `registry:block` shadcn items. Preview files live under `components/previews/<category>/`. `lib/registry-server.ts` builds registry items by following each file's `@/` and relative imports and bundling everything it finds. Internal imports are therefore safe and encouraged; a component that imports `@/lib/ease` ships `lib/ease.ts` with it.
- `src/routes/_site/` — every site page (TanStack file routes under a pathless `_site` layout, so URLs have no prefix). The site is English only. Routes are thin (`loader` → static server fn, `head` → `metadataToHead`, `component`); larger pages keep their server function and component in `src/routes/-pages/` (a `-` prefix hides a file from the router). `src/routes/_site/route.tsx` is the layout: client messages, providers, site chrome and the 404. Machine endpoints (`/r`, `/native/r`, `*.json`, `*.md`, `llms.txt`, `/changelog/rss.xml`) come from `scripts/build-static.ts`, not routes.
- `messages/en/<area>.json` — site copy, one file per use-intl namespace (registered in `i18n/messages.ts`). Client components get the subset in `clientMessages()` (`i18n/server.ts`); long `Pages.*` prose stays in server functions. Component names, descriptions and guides come straight from `lib/registry.ts` and `lib/agent-guides.ts`, SEO titles from `lib/component-seo.ts`. `bun run check:messages` (`scripts/check-messages.ts`, part of `bun run check`) checks the files are registered and valid ICU.
- `/r/*` — registry endpoints (shadcn items, raw source, index), generated by `scripts/build-static.ts` from `lib/registry-server.ts` and served by the Worker. beUI is listed in shadcn's official registry directory as the `@beui` namespace with URL template `https://beui.dev/r/{name}.json` — that path shape and existing install slugs are public contract; never break or rename them.
- `lib/ease.ts` — all motion tokens.
- `scripts/check-registry.ts` — validates the catalog.
- `lib/native/catalog.json` — beUI Native (React Native) components and source, synced from the `beui-native` repo by `bun scripts/sync-native.ts` (never edit by hand). The same script uploads the showcase clips and posters to the `beui-native` R2 bucket, served from `media.beui.dev` with content-hashed names; don't add clips to `public/`. Native components have their own pages for search: `/react-native` lists them by group and `/react-native/[slug]` shows one (clip, Expo Go QR, CLI and manual install, its README, related native components), with its own metadata, JSON-LD, OG card (`ogImagePath("native", slug)`; every card is a PNG built from `lib/og-cards.tsx`) and sitemap entries (`lib/native-seo.ts`). A web component page with a native version links to it. The Web/React Native switch (`components/app/docs/native/platform-switch.tsx`), at the top of the right sidebar and inline below `xl`, navigates between a page's two URLs, falling back to the other platform's list; on `/react-native` pages the left sidebar lists native components by group (`lib/native/nav.json`). Agents read `/native/r` and `/native/r/{slug}` (`lib/native-registry.ts`), the `llms.txt` native section, and the MCP `list_native_components` and `get_native_component` tools.

## Finding components

`lib/registry.ts` is the catalog and the only list of components; don't copy it into docs. Before building something, search it (`grep -n 'slug: "' lib/registry.ts`, or grep for a word from the name or description) and import what exists.

- An entry (`ComponentEntry`) has `slug`, `name`, `description`, `file`, `extraFiles`, an optional `usageFile`, and `examples` (`ComponentExample`), one per variant shown on the page. A variant with its own `installSlug` installs separately.
- A page slug is not always an install slug. A page whose variants all carry an `installSlug` installs only by those (`button` → `button-base`, `button-stateful`, `button-magnetic`, `button-metallic`); `INSTALL_SLUGS` in `lib/registry.ts` lists every installable slug. Install slugs are public contract: when you split an existing page into variants, keep the old slug as one variant's `installSlug` so `/r/<slug>.json` still resolves.
- A component's API lives in its own file (exported props types, `<name>Messages`), and its preview in `components/previews/<category>/` shows real usage.
- Reuse the shared building blocks instead of writing new ones:
  - Motion tokens: `lib/ease.ts`.
  - Hooks in `lib/hooks/`: dismissal (`use-dismiss`), focus trap and modal scope (`use-focus-trap`, `use-modal-scope`), list cursors (`use-row-cursor`, `use-listbox`), open sessions (`use-on-open`), sliders (`use-slider`), hover and touch capability and gestures.
  - Overlays: `PresenceGate` (`lib/presence-gate.tsx`), `lib/focusable.ts`, pointer capture in `lib/touch.ts`.
  - Strings: `useMessages` and `LocaleProvider` (`lib/i18n.tsx`).
  - Charts: `components/charts/xy/` (scales, paths, axis, legend, inspector, tooltip content, data table, `useElementWidth`, `useInspection`).
  - Casino games: `components/motion/casino/game-parts.tsx`, with sound from `lib/game-sounds.ts` and `lib/tick-sound.ts`.
  - Tooltips: `components/motion/tooltip.tsx`, which charts and games already use.
- Site chrome (`components/app/`, not part of the library): `components/app/docs/copy-button.tsx` for copy buttons, `components/app/docs/code-block.tsx` for code (takes a `HighlightedCode` from `highlight()` in `lib/highlight.ts`, which must run in the page's server function), and `components/app/press-link.tsx` for CTA links.

## Motion conventions

- Use tokens from `lib/ease.ts`: `EASE_OUT`, `EASE_OUT_CSS`, `EASE_IN` (falls only), `EASE_IN_OUT`, `EASE_DRAWER`, `SPRING_PRESS`, `SPRING_SWAP`, `SPRING_PANEL`, `SPRING_LAYOUT`, `SPRING_MOUSE`. No inline `cubic-bezier` or one-off spring configs; if tuning is genuinely component-specific, keep it a named local const with a comment saying why.
- Gate transform-based motion behind `useReducedMotion()` (from `motion/react`). Reduced motion keeps opacity/color transitions, drops movement. The global CSS media query cannot stop JS springs, so the hook is required.
- Gate decorative hover effects (magnetic pull, tilt) behind `useHoverCapable()` from `lib/hooks/use-hover-capable` — touch devices get sticky phantom hover otherwise.
- Animate `transform` and `opacity` only; never layout properties. Keep blur ≤ 10px. Exits faster than entrances. UI animations under ~300ms; press feedback ~100-160ms.
- Site CTAs use `PressLink` (`components/app/press-link.tsx`), which matches the library Button's `SPRING_PRESS` feel. Don't reach for the CSS `.press` utility on primary CTAs.
- Unmount overlays while closed: wrap the chrome in `AnimatePresence`. A transparent full-viewport fixed layer is costly on iOS Safari. If an overlay must stay mounted, hide it on the close path only. Flip the hidden state from the exit animation's completion callback, not from a duration constant. Open instantly: focus and measurement effects fail against a hidden element. Re-test the open path after you change show/hide code.
- Gate overlay interaction on presence, not on `open`. During the exit, `open` is already false but the chrome is still the topmost element on the page. Spread the `gate` from `PresenceGate` (`lib/presence-gate.tsx`) onto every layer that takes pointer events. The gate removes pointer events, focus order, and accessibility exposure (through `inert`) in the same commit that starts the exit; the visual exit continues. Put `inert={!isPresent}` alone on a wrapper that never takes pointer events. An always-mounted overlay gates on its own open state instead; that state flips on the same render.
- Every `position: fixed` overlay layer must paint a colour, or have no children, or stay off the viewport edges. Check every overlay in each state in the browser, and copy the layer shapes from an existing overlay rather than inventing new ones. When you move padding between layers, keep the panel's content box unchanged at every viewport. Render the backdrop and the dialog as separate top-level layers; never put the backdrop inside the dialog's scroll container (iOS Safari positions `fixed` elements against an ancestor scroller, so a nested backdrop stops covering the viewport).

## Code conventions

- Named exports only. Every component accepts `className` merged via `cn()` from `lib/utils`. Interactive components are `"use client"`.
- Resolve which row of a list is active — highlighted, or the owner of a roving `tabIndex` — **during render**, never in a passive effect. A passive effect runs after the commit, so the component holds a wrong or absent active row for a window of milliseconds: a key pressed in that window acts on the wrong row, and a roving `tabIndex` chosen in an effect leaves the list untabbable in its first commit and in server-rendered markup. `lib/hooks/use-row-cursor.ts` is the ordinary case; `components/motion/combobox/use-active-option.ts` is the same model with wrap-around stepping, `first`/`last`, a disabled-row filter and a not-yet-opened state.
  - Hold the cursor as the row's **identity**, not its position — a position cannot tell a list that shrank from one that swapped its rows for a different set of the same length.
  - Clear a stale cursor rather than ignoring it, so rows that come back cannot revive it.
  - Step the cursor through a functional update, so two keys in one batch move two rows.
  - Give the returned callbacks an identity stable for the component's life. The exhaustive-deps rule will put them in a caller's effect dependencies, and one rebuilt per keystroke re-runs that effect per keystroke. Keep any value a stable callback reads in a ref written from a layout effect, never during render.
  - Start a fresh session in the render that opens (`lib/hooks/use-on-open.ts`), and set only the component's own state there: a consumer's callback, a DOM write or a focus move is a side effect and belongs in an effect keyed to `open`.
- User-facing strings in library components, including `aria-label`, `title` and screen-reader text, go through `useMessages` from `lib/i18n.tsx`. Export the English defaults from the component file as `<name>Messages` (plain strings, `{name}` placeholders), and add a `labels?: Partial<...>` prop so apps can pass translations (directly or through `LocaleProvider`). `bun run check:messages` fails on hardcoded English in `aria-label`, `title`, `placeholder`, `aria-valuetext` and `aria-roledescription` (literals, or English string literals inside `{...}`) across `components/motion`, `components/agents` and `components/charts`.
- Site pages and `components/app/` keep copy in `messages/en`: use `useTranslations` from `use-intl` (or `getTranslations(namespace)` from `@/i18n/server` inside a server function), and `Link`/`usePathname`/`useRouter`/`useSearchParams` from `@/lib/navigation` (not TanStack's `Link` directly). A page route builds a `Metadata` object (`lib/head.ts`) in its server function with `alternates: { canonical: path }` and returns it through `head: ({ loaderData }) => metadataToHead(loaderData.metadata)`. OG images are static: `ogImagePath(kind, slug)` from `lib/og-paths.ts`, with the card listed in `lib/og-cards.tsx`. Server function results must be plain JSON. Site component tests render through `withIntl` from `tests/intl.tsx`.
- Larger components support controlled + uncontrolled (`value`/`defaultValue`/`onChange`); simple toggles are controlled-only.
- Biome a11y rules are strict: no redundant ARIA roles on divs/spans; use real elements (`<button>`) for interactive things. `DockItem` renders a `<button>` when given `onClick` and a plain div wrapper when children carry their own link/button — never nest interactive elements.
- New component = source file + preview + `lib/registry.ts` entry in the same change. `bun run check:registry` must pass.
- A `new` component's registry entry must set `launchedAt` to the ship date (`YYYY-MM-DD`). The landing "Recently launched" section sorts by it newest-first, so the just-added component leads.
- Credit a community contributor with `credit` on what they built, referencing the shared `contributors` const in `lib/registry.ts` (add them there once; avatars use the `avatars.githubusercontent.com` URL, not `github.com/<user>.png`, which redirects). A page without `examples` takes `credit` on its entry; a page with `examples` credits each example instead, and `check:registry` rejects an entry-level credit there. When every example shares one contributor, the page shows one byline under the title; otherwise each credited example shows its own and the title reads "Includes designs by …". Credit only designs a person built, not fixes, and only with their own link. Credit is website-only: it never reaches registry JSON or installed source.
- A user-facing `feat:` or `fix:` (a new component or variant, a visible behavior change, an accessibility or reduced-motion fix) adds one line to `lib/changelog/entries.ts`, in the entry dated with the ship date (`YYYY-MM-DD`; create it at the top if missing, one entry per date, newest first). Write it for someone using beUI, set `component` to the registry slug when it is about one component, and leave out internal work. `bun run check:registry` validates the file; the page is `/changelog` with an RSS feed at `/changelog/rss.xml`.
- A change to a component's public behavior or docs must bump `updatedAt` in `lib/component-dates.ts` to the ship date (`YYYY-MM-DD`) for every registry item that bundles a changed file, not just the one you were editing. A shared file usually ships in several entries, and the category slug is not the directory, so resolve the set from the entries' file lists rather than by path. Site-wide maintenance must not refresh every component's date.

## Commits

Conventional lowercase prefixes (`feat:`, `fix:`, `refactor:`, `docs:`), imperative subject. No AI attribution or Co-Authored-By lines.

---
name: beui-pro
description: Choose, inspect, install, and compose licensed beUI Pro premium React blocks from the authenticated shadcn registry. Use when building or improving landing pages with beUI Pro, installing @beui-pro items, selecting premium heroes, features, pricing, social proof, CTAs, navigation, footers, or other page sections, or adapting installed Pro source inside a React or Next.js project.
---

# beUI Pro

Use the customer's licensed beUI Pro registry as the source of truth. Discover current items at runtime, install only the blocks the project needs, then compose and adapt the generated source.

## Protect access

- Require `BEUI_PRO_TOKEN` in the environment before accessing the registry.
- Never print, paste, commit, or write the token into source files.
- Never accept a token copied into the user's prompt when an environment variable can be used.
- Stop and ask the user to configure their token when it is unavailable. Do not replace a requested Pro block with an approximation.
- If the live catalog cannot be fetched, do not present remembered, documented, or locally inferred slugs as the current catalog.
- Treat `401` as a missing, invalid, or expired token. Treat `404` as a stale or incorrect install slug and refresh the catalog.

Check access without revealing the value:

```bash
test -n "$BEUI_PRO_TOKEN" && echo "beUI Pro token is configured"
```

## Configure the registries

Inspect the project's existing `components.json` before editing it. Preserve its aliases and settings. Ensure both namespaces exist because Pro blocks can depend on public beUI primitives:

```jsonc
{
  "registries": {
    "@beui": "https://beui.dev/r/{name}.json",
    "@beui-pro": {
      "url": "https://pro.beui.dev/r/{name}.json",
      "headers": {
        "Authorization": "Bearer ${BEUI_PRO_TOKEN}"
      }
    }
  }
}
```

Merge this into the existing file rather than replacing it. Do not create or modify a secret file unless the user explicitly asks.

## Workflow

### 1. Understand the project

Read the existing app before choosing blocks. Identify:

- framework and package manager
- requested page or section
- existing typography, theme tokens, spacing, and layout shell
- blocks already installed
- required states, data, and interactions

Prefer a coherent page composition over selecting blocks independently.

### 2. Fetch the live catalog

Fetch the authenticated registry every time instead of relying on remembered slugs:

```bash
curl -fsS \
  -H "Authorization: Bearer ${BEUI_PRO_TOKEN}" \
  https://pro.beui.dev/r/registry.json
```

Choose only from `items[].name`. This endpoint is the complete list of currently installable Pro blocks and components.

Use the grouped index when the request needs broader discovery:

```bash
curl -fsS \
  -H "Authorization: Bearer ${BEUI_PRO_TOKEN}" \
  https://pro.beui.dev/r
```

Use names and descriptions to match the user's intent. Do not invent or shorten install slugs.

### 3. Select intentionally

Map the page brief to the smallest useful set of sections. A typical landing page may need one item from each relevant family:

1. navbar
2. hero
3. trust or social proof
4. features or content
5. pricing when applicable
6. CTA
7. footer

Do not install the whole catalog unless the user explicitly requests it. Avoid combining blocks with conflicting visual directions. Preserve the strongest aesthetic of each selected block while aligning shared typography, spacing, and theme tokens across the page.

Only entries returned by `/r/registry.json` are shadcn-installable. Full standalone templates use a separate purchase and download entitlement; do not fabricate an `@beui-pro` template command.

### 4. Inspect before installing

Inspect each selected item so the agent understands its files, dependencies, props, and named exports:

```bash
npx shadcn@latest view @beui-pro/<slug>
```

Use the project's package runner when appropriate:

```bash
pnpm dlx shadcn@latest view @beui-pro/<slug>
bunx --bun shadcn@latest view @beui-pro/<slug>
```

Re-fetch the live catalog if inspection returns `404`. Resolve authentication or registry configuration if it returns `401`; do not bypass the private registry.

### 5. Install the selected source

Install through the configured namespace:

```bash
npx shadcn@latest add @beui-pro/<slug>
```

The registry can install public `@beui` dependencies automatically. Keep those generated dependencies and helpers instead of copying or rebuilding them.

### 6. Compose and adapt

Read every generated file before using it. Then:

- import its named exports from the installed paths
- connect real copy, links, images, and data
- preserve accessibility and reduced-motion behavior
- use existing semantic theme tokens
- make layout-level changes with `className` and composition first
- change block internals only when the product requirement needs it
- keep all work inside the user's project

Do not recreate a low-level motion primitive when the installed block already depends on a public beUI primitive.

### 7. Verify

Run the project's relevant typecheck and lint commands. Render the changed route at desktop and mobile widths, check interaction and reduced-motion behavior, and confirm there is no overflow or hydration error.

Report which Pro slugs were installed and which files were adapted.

## Common requests

- For “build a landing page,” select a complete but restrained section sequence, install each exact slug, and compose it in the existing route.
- For “add a pricing section,” search pricing entries, inspect the closest variants, install one, and connect the real plans.
- For “use beUI Pro components,” inspect the current UI first and prefer relevant Pro blocks over custom replacements.
- For “show me what Pro has,” fetch the live registry and summarize matching items without exposing source or the token.

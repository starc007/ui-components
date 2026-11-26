import { SITE_URL } from "@/lib/site";
import { THEME_CSS } from "@/lib/theme-css";

/**
 * The `theme` registry item: the tokens, animations and utilities beUI adds on
 * top of shadcn's, as a shadcn registry item. Components that use any of them
 * list it in `registryDependencies`, so `shadcn add @beui/<slug>` brings them
 * along instead of leaving classes like `border-border-strong` silently unset.
 *
 * It is parsed from THEME_CSS, the stylesheet people paste by hand, so the
 * two cannot drift. It never sets shadcn's base colors (background, primary,
 * border...): installing it into a shadcn project adds to its theme and
 * changes nothing that is already there.
 */

export const THEME_SLUG = "theme";
export const THEME_ITEM_URL = `${SITE_URL}/r/${THEME_SLUG}.json`;

/** beUI's own CSS variables; shadcn defines every other token it uses. */
const EXTRA_VARS = [
  "border-strong",
  "neon",
  "success",
  "warning",
  "glass-bg",
  "glass-border",
  "glass-strong-bg",
  "glass-thin-bg",
];

/** `@theme` entries beUI adds or retunes (the ease curves). */
const EXTRA_THEME = [
  "ease-out",
  "ease-in-out",
  "ease-drawer",
  "color-border-strong",
  "color-neon",
  "color-success",
  "color-warning",
];

type CssTree = { [key: string]: string | CssTree };

/** The body of the first `header { ... }` block, matching nested braces. */
function blockBody(css: string, header: string): string {
  const start = css.indexOf(`${header} {`);
  if (start === -1) throw new Error(`theme-registry: no "${header}" block in THEME_CSS`);
  let depth = 0;
  const open = css.indexOf("{", start);
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`theme-registry: unclosed "${header}" block`);
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Top-level `name { body }` rules of a block, skipping plain declarations. */
function rules(body: string): Array<{ selector: string; body: string }> {
  const out: Array<{ selector: string; body: string }> = [];
  let depth = 0;
  let selectorStart = 0;
  let bodyStart = 0;
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === "{") {
      if (depth === 0) bodyStart = i + 1;
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        const head = body.slice(selectorStart, bodyStart - 1);
        // Drop any declarations that sat before the selector.
        const selector = head.slice(head.lastIndexOf(";") + 1).trim();
        out.push({ selector, body: body.slice(bodyStart, i) });
        selectorStart = i + 1;
      }
    } else if (char === ";" && depth === 0) {
      selectorStart = i + 1;
    }
  }
  return out;
}

/** `prop: value;` pairs at the top level of a block, whitespace collapsed. */
function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  let depth = 0;
  let current = "";
  for (const char of body) {
    if (char === "{") depth++;
    if (char === "}") depth--;
    if (depth > 0 || char === "}" || char === "{") {
      if (depth === 0 && char === "}") current = "";
      continue;
    }
    if (char === ";") {
      const colon = current.indexOf(":");
      if (colon > 0) {
        out[current.slice(0, colon).trim()] = current.slice(colon + 1).trim().replace(/\s+/g, " ");
      }
      current = "";
    } else current += char;
  }
  return out;
}

function pick(vars: Record<string, string>, names: string[]) {
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = vars[`--${name}`];
    if (value !== undefined) out[name] = value;
  }
  return out;
}

export function buildThemeItem() {
  const css = stripComments(THEME_CSS);
  const light = declarations(blockBody(css, ":root"));
  const dark = declarations(blockBody(css, ".dark"));
  const inline = declarations(blockBody(css, "@theme inline"));
  const themeBody = blockBody(css, "@theme");
  const animations = declarations(themeBody);

  const cssRules: CssTree = {};
  for (const { selector, body } of rules(themeBody)) {
    if (!selector.startsWith("@keyframes")) continue;
    const frames: CssTree = {};
    for (const frame of rules(body)) frames[frame.selector] = declarations(frame.body);
    cssRules[selector] = frames;
  }
  // `.glass` and `.scrollbar-hide::-webkit-scrollbar` become Tailwind v4
  // utilities, the pseudo-element part nested under its utility.
  for (const { selector, body } of rules(blockBody(css, "@layer utilities"))) {
    const match = selector.match(/^\.([\w-]+)(.*)$/);
    if (!match) continue;
    const [, name, pseudo] = match;
    const key = `@utility ${name}`;
    const utility = (cssRules[key] ?? {}) as CssTree;
    if (pseudo) utility[`&${pseudo}`] = declarations(body);
    else Object.assign(utility, declarations(body));
    cssRules[key] = utility;
  }

  const theme = {
    ...pick(inline, EXTRA_THEME),
    ...Object.fromEntries(
      Object.entries(animations)
        .filter(([name]) => name.startsWith("--animate-"))
        .map(([name, value]) => [name.slice(2), value]),
    ),
  };

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json" as const,
    name: THEME_SLUG,
    type: "registry:theme" as const,
    title: "beUI theme",
    description:
      "The tokens, animations and utilities beUI components use on top of shadcn's: border-strong, success, warning and neon colors, the glass surfaces, ease curves and marquee and shimmer animations. Adds to your theme without changing existing colors.",
    author: "Saurabh <saurabh10102@gmail.com>",
    cssVars: {
      theme,
      light: pick(light, EXTRA_VARS),
      dark: pick({ ...light, ...dark }, EXTRA_VARS),
    },
    css: cssRules,
  };
}

/**
 * Whether bundled source uses anything the theme item provides: one of its
 * colors as a utility or variable, a glass, scrollbar or mask utility, the
 * marquee or shimmer animation, or the drawer ease.
 */
const THEME_USE_RE = new RegExp(
  [
    String.raw`(?:^|[\s"'\x60:(!])(?:[a-z-]+:)*(?:text|bg|border|fill|stroke|ring|from|to|via|outline|decoration|shadow|divide|caret|accent)-(?:success|warning|neon|border-strong)\b`,
    String.raw`--color-(?:success|warning|neon|border-strong)\b`,
    String.raw`var\(--(?:success|warning|neon|border-strong|glass-[a-z-]+)\)`,
    String.raw`(?:^|[\s"'\x60:])(?:[a-z-]+:)*(?:glass(?:-strong|-thin)?|scrollbar-hide|mask-radial-fade|mask-b-fade|animate-marquee(?:-vertical)?|animate-shimmer|ease-drawer)(?=[\s"'\x60]|$)`,
  ].join("|"),
  "m",
);

export function usesTheme(sources: string[]) {
  return sources.some((source) => THEME_USE_RE.test(source));
}

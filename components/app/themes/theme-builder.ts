// Builds a beUI theme from two choices: a primary color and a base gray. The
// output is the token layer of src/styles/globals.css, so a theme drops in
// over the beUI defaults. Graphite on neutral is exactly those defaults.

export const THEME_COLORS = [
  "graphite",
  "blue",
  "sky",
  "teal",
  "green",
  "amber",
  "orange",
  "red",
  "rose",
] as const;
export type ThemeColor = (typeof THEME_COLORS)[number];

export const THEME_BASES = ["neutral", "warm", "cool"] as const;
export type ThemeBase = (typeof THEME_BASES)[number];

export interface ThemeChoice {
  color: ThemeColor;
  base: ThemeBase;
}

export const DEFAULT_THEME: ThemeChoice = { color: "graphite", base: "neutral" };

type Tokens = Record<string, string>;

// Lightness and chroma per mode, tuned by eye so each hue reads as itself and
// holds its text. Hues stay clear of purple.
const COLOR_SPECS: Record<
  Exclude<ThemeColor, "graphite">,
  { hue: number; light: [number, number]; dark: [number, number] }
> = {
  blue: { hue: 255, light: [0.55, 0.2], dark: [0.68, 0.17] },
  sky: { hue: 235, light: [0.62, 0.15], dark: [0.74, 0.13] },
  teal: { hue: 185, light: [0.6, 0.11], dark: [0.75, 0.12] },
  green: { hue: 150, light: [0.6, 0.16], dark: [0.74, 0.17] },
  amber: { hue: 75, light: [0.76, 0.16], dark: [0.8, 0.16] },
  orange: { hue: 48, light: [0.66, 0.2], dark: [0.73, 0.18] },
  red: { hue: 25, light: [0.6, 0.22], dark: [0.67, 0.2] },
  rose: { hue: 8, light: [0.62, 0.2], dark: [0.71, 0.17] },
};

/** Swatch color for each choice, shown in the picker. Graphite is the page's
 * ink, so it reads in both modes: near-black in light, near-white in dark. */
export const COLOR_SWATCH: Record<ThemeColor, string> = {
  graphite: "var(--foreground)",
  ...(Object.fromEntries(
    Object.entries(COLOR_SPECS).map(([key, spec]) => [
      key,
      okl(spec.light[0], spec.light[1], spec.hue),
    ]),
  ) as Record<Exclude<ThemeColor, "graphite">, string>),
};

// The base tint: hue and how much of it the grays carry.
const BASE_TINT: Record<Exclude<ThemeBase, "neutral">, number> = { warm: 70, cool: 250 };

function okl(l: number, c: number, h: number, alpha?: number) {
  const value = `oklch(${round(l * 100)}% ${round(c, 3)} ${h}`;
  return alpha === undefined ? `${value})` : `${value} / ${alpha})`;
}

function round(value: number, digits = 1) {
  const f = 10 ** digits;
  return String(Math.round(value * f) / f);
}

// beUI's own neutral tokens, copied from globals.css so the default theme
// exports exactly what ships.
const NEUTRAL_LIGHT: Tokens = {
  "--background": "oklch(99% 0 0)",
  "--foreground": "oklch(15% 0 0)",
  "--card": "oklch(97% 0 0)",
  "--muted-foreground": "oklch(50% 0 0)",
  "--border": "oklch(15% 0 0 / 0.06)",
  "--border-strong": "oklch(15% 0 0 / 0.12)",
};
const NEUTRAL_DARK: Tokens = {
  "--background": "#151515",
  "--foreground": "oklch(96% 0 0)",
  "--card": "#1c1c1c",
  "--muted-foreground": "oklch(62% 0 0)",
  "--border": "rgb(255 255 255 / 0.05)",
  "--border-strong": "rgb(255 255 255 / 0.1)",
};

function baseTokens(base: ThemeBase, mode: "light" | "dark"): Tokens {
  if (base === "neutral") return mode === "light" ? NEUTRAL_LIGHT : NEUTRAL_DARK;
  const h = BASE_TINT[base];
  return mode === "light"
    ? {
        "--background": okl(0.99, 0.004, h),
        "--foreground": okl(0.16, 0.012, h),
        "--card": okl(0.968, 0.007, h),
        "--muted-foreground": okl(0.5, 0.016, h),
        "--border": okl(0.16, 0.012, h, 0.07),
        "--border-strong": okl(0.16, 0.012, h, 0.13),
      }
    : {
        "--background": okl(0.195, 0.008, h),
        "--foreground": okl(0.96, 0.006, h),
        "--card": okl(0.225, 0.01, h),
        "--muted-foreground": okl(0.64, 0.014, h),
        "--border": okl(0.96, 0.01, h, 0.06),
        "--border-strong": okl(0.96, 0.01, h, 0.11),
      };
}

function colorTokens(choice: ThemeChoice, mode: "light" | "dark", base: Tokens): Tokens {
  if (choice.color === "graphite") {
    if (choice.base === "neutral") {
      return mode === "light"
        ? {
            "--primary": "#171717",
            "--primary-foreground": "#fafafa",
            "--accent": "oklch(72% 0.18 195)",
            "--accent-fg": "oklch(15% 0 0)",
          }
        : {
            "--primary": "#f5f5f5",
            "--primary-foreground": "#151515",
            "--accent": "oklch(80% 0.18 195)",
            "--accent-fg": "#151515",
          };
    }
    // Graphite on a tinted base: the ink of that base.
    return {
      "--primary": base["--foreground"],
      "--primary-foreground": base["--background"],
      "--accent": base["--foreground"],
      "--accent-fg": base["--background"],
    };
  }

  const spec = COLOR_SPECS[choice.color];
  const [l, c] = spec[mode];
  const primary = okl(l, c, spec.hue);
  // Light hues carry dark text; the rest carry white. Dark mode raises every
  // hue, so it switches to dark text sooner.
  const darkText = l >= (mode === "light" ? 0.7 : 0.66);
  const onPrimary = darkText ? okl(0.18, 0.02, spec.hue) : "oklch(99% 0 0)";
  return {
    "--primary": primary,
    "--primary-foreground": onPrimary,
    "--accent": primary,
    "--accent-fg": onPrimary,
    "--ring": okl(l, c, spec.hue, 0.5),
  };
}

export interface ThemeTokens {
  light: Tokens;
  dark: Tokens;
}

export function buildTheme(choice: ThemeChoice): ThemeTokens {
  const build = (mode: "light" | "dark") => {
    const base = baseTokens(choice.base, mode);
    return { ...base, ...colorTokens(choice, mode, base) };
  };
  return { light: build("light"), dark: build("dark") };
}

function block(selector: string, tokens: Tokens) {
  const lines = Object.entries(tokens).map(([name, value]) => `    ${name}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** The CSS to paste into globals.css, below the beUI theme. */
export function themeCss(choice: ThemeChoice, title: string) {
  const { light, dark } = buildTheme(choice);
  return `/* ${title} */\n${block(":root", light)}\n\n${block(".dark", dark)}\n`;
}

/**
 * The same tokens for a live preview of the whole page. The doubled `:root`
 * outranks globals.css in both modes, and the dark block comes last.
 */
export function previewCss(choice: ThemeChoice) {
  const { light, dark } = buildTheme(choice);
  return `${block(":root:root", light)}\n${block(":root.dark", dark)}`;
}

export function parseTheme(params: URLSearchParams): ThemeChoice {
  const color = params.get("color");
  const base = params.get("base");
  return {
    color: THEME_COLORS.find((value) => value === color) ?? DEFAULT_THEME.color,
    base: THEME_BASES.find((value) => value === base) ?? DEFAULT_THEME.base,
  };
}

/** Query string for a choice; the default theme has none. */
export function themeQuery(choice: ThemeChoice) {
  const params = new URLSearchParams();
  if (choice.color !== DEFAULT_THEME.color) params.set("color", choice.color);
  if (choice.base !== DEFAULT_THEME.base) params.set("base", choice.base);
  const query = params.toString();
  return query ? `?${query}` : "";
}

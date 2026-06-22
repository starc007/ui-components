export type ColorTheme =
  | "default"
  | "violet"
  | "blue"
  | "green"
  | "amber"
  | "blood-orange"
  | "rose"
  | "red"
  | "teal"
  | "indigo"
  | "lime";

type Vars = Record<string, string>;
type Theme = { name: string; swatch: string; light: Vars; dark: Vars };

// Full neutral token set. Colored themes start here and override the brand
// tokens, so every theme exports a complete, drop-in palette.
const BASE_LIGHT: Vars = {
  "--background": "oklch(99% 0 0)",
  "--foreground": "oklch(15% 0 0)",
  "--card": "oklch(97% 0 0)",
  "--card-foreground": "oklch(15% 0 0)",
  "--popover": "oklch(97% 0 0)",
  "--popover-foreground": "oklch(15% 0 0)",
  "--primary": "oklch(15% 0 0)",
  "--primary-foreground": "oklch(99% 0 0)",
  "--secondary": "oklch(97% 0 0)",
  "--secondary-foreground": "oklch(15% 0 0)",
  "--muted": "oklch(97% 0 0)",
  "--muted-foreground": "oklch(50% 0 0)",
  "--accent": "oklch(72% 0.18 195)",
  "--accent-foreground": "oklch(15% 0 0)",
  "--destructive": "oklch(62% 0.22 25)",
  "--border": "oklch(15% 0 0 / 0.06)",
  "--input": "oklch(15% 0 0 / 0.06)",
  "--ring": "oklch(15% 0 0 / 0.12)",
};

const BASE_DARK: Vars = {
  "--background": "#151515",
  "--foreground": "oklch(96% 0 0)",
  "--card": "#1c1c1c",
  "--card-foreground": "oklch(96% 0 0)",
  "--popover": "#1c1c1c",
  "--popover-foreground": "oklch(96% 0 0)",
  "--primary": "oklch(96% 0 0)",
  "--primary-foreground": "#151515",
  "--secondary": "#1c1c1c",
  "--secondary-foreground": "oklch(96% 0 0)",
  "--muted": "#1c1c1c",
  "--muted-foreground": "oklch(62% 0 0)",
  "--accent": "oklch(80% 0.18 195)",
  "--accent-foreground": "#151515",
  "--destructive": "oklch(62% 0.22 25)",
  "--border": "rgb(255 255 255 / 0.05)",
  "--input": "rgb(255 255 255 / 0.05)",
  "--ring": "rgb(255 255 255 / 0.1)",
};

/** Build a colored theme: neutral surfaces + a hue-tinted brand ramp. */
function brand(opts: {
  light: { hue: string; onHue: string };
  dark: { hue: string; onHue: string };
  tintL?: string;
  tintD?: string;
}): { light: Vars; dark: Vars } {
  const lHue = opts.light.hue;
  const dHue = opts.dark.hue;
  return {
    light: {
      ...BASE_LIGHT,
      "--primary": lHue,
      "--primary-foreground": opts.light.onHue,
      "--accent": lHue,
      "--accent-foreground": opts.light.onHue,
      "--ring": opts.tintL ?? lHue,
    },
    dark: {
      ...BASE_DARK,
      "--primary": dHue,
      "--primary-foreground": opts.dark.onHue,
      "--accent": dHue,
      "--accent-foreground": opts.dark.onHue,
      "--ring": opts.tintD ?? dHue,
    },
  };
}

export const THEMES: Record<ColorTheme, Theme> = {
  default: {
    name: "Mono",
    swatch: "oklch(40% 0 0)",
    light: BASE_LIGHT,
    dark: BASE_DARK,
  },
  violet: {
    name: "Violet",
    swatch: "oklch(55% 0.2 290)",
    ...brand({
      light: { hue: "oklch(55% 0.2 290)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(72% 0.16 290)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(55% 0.2 290 / 0.5)",
      tintD: "oklch(72% 0.16 290 / 0.55)",
    }),
  },
  blue: {
    name: "Blue",
    swatch: "oklch(55% 0.18 255)",
    ...brand({
      light: { hue: "oklch(55% 0.18 255)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(70% 0.15 255)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(55% 0.18 255 / 0.5)",
      tintD: "oklch(70% 0.15 255 / 0.55)",
    }),
  },
  green: {
    name: "Green",
    swatch: "oklch(56% 0.14 150)",
    ...brand({
      light: { hue: "oklch(56% 0.14 150)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(72% 0.15 150)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(56% 0.14 150 / 0.5)",
      tintD: "oklch(72% 0.15 150 / 0.55)",
    }),
  },
  amber: {
    name: "Amber",
    swatch: "oklch(74% 0.15 70)",
    ...brand({
      light: { hue: "oklch(74% 0.15 70)", onHue: "oklch(20% 0.02 70)" },
      dark: { hue: "oklch(80% 0.15 75)", onHue: "oklch(18% 0.02 75)" },
      tintL: "oklch(74% 0.15 70 / 0.5)",
      tintD: "oklch(80% 0.15 75 / 0.55)",
    }),
  },
  "blood-orange": {
    name: "Blood Orange",
    swatch: "oklch(60% 0.19 40)",
    ...brand({
      light: { hue: "oklch(60% 0.19 40)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(72% 0.17 42)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(60% 0.19 40 / 0.5)",
      tintD: "oklch(72% 0.17 42 / 0.55)",
    }),
  },
  rose: {
    name: "Rose",
    swatch: "oklch(58% 0.2 12)",
    ...brand({
      light: { hue: "oklch(58% 0.2 12)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(70% 0.17 12)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(58% 0.2 12 / 0.5)",
      tintD: "oklch(70% 0.17 12 / 0.55)",
    }),
  },
  red: {
    name: "Red",
    swatch: "oklch(55% 0.22 25)",
    ...brand({
      light: { hue: "oklch(55% 0.22 25)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(68% 0.19 25)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(55% 0.22 25 / 0.5)",
      tintD: "oklch(68% 0.19 25 / 0.55)",
    }),
  },
  teal: {
    name: "Teal",
    swatch: "oklch(55% 0.12 185)",
    ...brand({
      light: { hue: "oklch(55% 0.12 185)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(72% 0.13 185)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(55% 0.12 185 / 0.5)",
      tintD: "oklch(72% 0.13 185 / 0.55)",
    }),
  },
  indigo: {
    name: "Indigo",
    swatch: "oklch(50% 0.2 275)",
    ...brand({
      light: { hue: "oklch(50% 0.2 275)", onHue: "oklch(99% 0 0)" },
      dark: { hue: "oklch(70% 0.16 275)", onHue: "oklch(15% 0 0)" },
      tintL: "oklch(50% 0.2 275 / 0.5)",
      tintD: "oklch(70% 0.16 275 / 0.55)",
    }),
  },
  lime: {
    name: "Lime",
    swatch: "oklch(72% 0.18 130)",
    ...brand({
      light: { hue: "oklch(72% 0.18 130)", onHue: "oklch(20% 0.04 130)" },
      dark: { hue: "oklch(80% 0.18 130)", onHue: "oklch(18% 0.04 130)" },
      tintL: "oklch(72% 0.18 130 / 0.5)",
      tintD: "oklch(80% 0.18 130 / 0.55)",
    }),
  },
};

export const THEME_LIST = Object.entries(THEMES).map(([id, t]) => ({
  id: id as ColorTheme,
  name: t.name,
  swatch: t.swatch,
}));

function block(selector: string, vars: Vars): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/** Stylesheet injected once: full token sets keyed by data-theme. */
export function themesStylesheet(): string {
  return (Object.entries(THEMES) as [ColorTheme, Theme][])
    .filter(([id]) => id !== "default")
    .map(
      ([id, t]) =>
        `${block(`[data-theme="${id}"]`, t.light)}\n${block(
          `.dark[data-theme="${id}"]`,
          t.dark,
        )}`,
    )
    .join("\n\n");
}

/** Copyable theme for a user's globals.css: standard :root / .dark blocks. */
export function themeExportCss(id: ColorTheme): string {
  const t = THEMES[id];
  return `${block(":root", t.light)}\n\n${block(".dark", t.dark)}`;
}

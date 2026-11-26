// Color math for the color picker: HSV for the picker's own state, RGB and hex
// for input and output, HSL for the HSL channel fields.

/** Hue 0-360, saturation and value 0-100, alpha 0-1. */
export type Hsva = { h: number; s: number; v: number; a: number };
/** Channels 0-255, alpha 0-1. */
export type Rgba = { r: number; g: number; b: number; a: number };

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, places = 0) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const sat = s / 100;
  const val = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return val - val * sat * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a };
}

/** `previous` keeps hue for greys and saturation for black, which RGB cannot carry. */
export function rgbaToHsva({ r, g, b, a }: Rgba, previous?: Hsva): Hsva {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  let h = previous?.h ?? 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const v = max * 100;
  const s = max ? (d / max) * 100 : (previous?.s ?? 0);
  return { h, s, v, a };
}

const HEX_PATTERN = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parses #rgb, #rgba, #rrggbb and #rrggbbaa. Returns null for anything else. */
export function parseHex(input: string): Rgba | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
  const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? round(n(6) / 255, 2) : 1 };
}

/** Lowercase #rrggbb, or #rrggbbaa when the color is translucent. */
export function formatHex({ r, g, b, a }: Rgba): string {
  const pair = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${pair(r)}${pair(g)}${pair(b)}${a < 1 ? pair(a * 255) : ""}`;
}

export function hsvToHsl({ h, s, v }: Hsva) {
  const sv = s / 100;
  const vv = v / 100;
  const l = vv * (1 - sv / 2);
  const sl = l === 0 || l === 1 ? 0 : (vv - l) / Math.min(l, 1 - l);
  return { h, s: sl * 100, l: l * 100 };
}

export function hslToHsv(h: number, s: number, l: number, previous: Hsva, a: number): Hsva {
  const sl = s / 100;
  const ll = l / 100;
  const v = ll + sl * Math.min(ll, 1 - ll);
  return { h, s: v ? 2 * (1 - ll / v) * 100 : previous.s, v: v * 100, a };
}

export const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

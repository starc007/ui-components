import { readFile } from "node:fs/promises";
import path from "node:path";
import { crc32, deflateSync } from "node:zlib";
import { Resvg } from "@resvg/resvg-js";
import type { ReactElement } from "react";
import type { BlogProduct } from "@/lib/blog";
import { CARD_TEXT_FONT, CARD_TITLE_FONT, loadCardFonts } from "@/lib/og-fonts";
import satori from "satori";

/**
 * Blog banners: a soft shader-like gradient field, seeded from the post slug so
 * every post gets its own shape, quantized to a few tones with a fine ordered
 * (Bayer) dither. Drawn pixel by pixel in Node, so it needs no GPU and the
 * same slug always gives the same image. Build scripts only.
 *
 * Each post gets two images: the 1200x630 social card and a 2000x840 cover
 * (dev.to's 1000x420 at 2x, also used on the post page and on Medium).
 */

type Rgb = [number, number, number];

// Off-white into beUI blue.
const STOPS: Rgb[] = [
  [246, 246, 248],
  [196, 222, 252],
  [64, 156, 248],
  [2, 110, 214],
];
const TEXT = "#101116";
const MUTED = "#636777";

/** Tones the stops are interpolated into. Close tones make the dither read as fine grain. */
const TONES = 10;

// 4x4 Bayer matrix, normalized to 0..1 thresholds.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export const BANNER_SIZES = {
  og: { width: 1200, height: 630 },
  cover: { width: 2000, height: 840 },
} as const;

function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Smooth value noise on a seeded lattice. */
function makeNoise(seed: number) {
  const random = rng(seed);
  const size = 256;
  const table = Float32Array.from({ length: size * size }, () => random());
  const at = (x: number, y: number) =>
    table[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    sum += amp * noise(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return sum / 0.9375;
}

function expandStops(stops: Rgb[], count: number): Rgb[] {
  return Array.from({ length: count }, (_, index) => {
    const t = (index / (count - 1)) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(t));
    const f = t - i;
    return stops[i].map((c, k) => Math.round(c + (stops[i + 1][k] - c) * f)) as Rgb;
  });
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The background as a PNG. Intensity comes from a domain-warped fbm field
 * around a seeded centre in the right half, faded out on the left so the
 * title sits on a calm area, then each cell picks a tone with a Bayer threshold.
 * The field works in relative units, so both sizes show the same shape.
 */
function bannerFieldPng(width: number, height: number, seed: string, cell: number) {
  const noise = makeNoise(hashSeed(seed));
  const random = rng(hashSeed(`${seed}:layout`));
  const cx = 0.68 + random() * 0.18;
  const cy = 0.25 + random() * 0.5;
  const stops = expandStops(STOPS, TONES);
  const levels = stops.length - 1;
  // Noise coordinates relative to height, so the 1200x630 card and the wider
  // cover sample the same field around the same centre.
  const scale = 2.4 / (height * 1.905);
  const aspect = width / height;

  const rows = Math.ceil(height / cell);
  const cols = Math.ceil(width / cell);
  const stride = width * 3 + 1;
  const pixels = Buffer.alloc(stride * height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * cell + cell / 2;
      const py = row * cell + cell / 2;
      const nx = px * scale;
      const ny = py * scale;
      // Domain warp: bend the lookup by another noise sample for liquid shapes.
      const wx = fbm(noise, nx + 3.1, ny + 7.7);
      const wy = fbm(noise, nx + 11.3, ny + 2.9);
      const field = fbm(noise, nx + wx * 3, ny + wy * 3);
      const dx = (px / width - cx + (wx - 0.5) * 0.35) * aspect;
      const dy = py / height - cy + (wy - 0.5) * 0.35;
      const glow = 1 - smoothstep(0.05, 0.9, Math.hypot(dx, dy));
      const quiet = smoothstep(0.12, 0.62, px / width + (wy - 0.5) * 0.2);
      const raw = (glow * 0.9 + (field - 0.5) * 0.8 * glow) * quiet;
      const intensity = Math.min(1, Math.max(0, raw));

      const scaled = intensity * levels;
      const base = Math.floor(scaled);
      const threshold = BAYER[(row % 4) * 4 + (col % 4)];
      const tone = stops[Math.min(levels, base + (scaled - base > threshold ? 1 : 0))];

      for (let y = row * cell; y < Math.min(height, (row + 1) * cell); y++) {
        const offset = y * stride + 1;
        for (let x = col * cell; x < Math.min(width, (col + 1) * cell); x++) {
          const i = offset + x * 3;
          pixels[i] = tone[0];
          pixels[i + 1] = tone[1];
          pixels[i + 2] = tone[2];
        }
      }
    }
  }
  return encodePng(width, height, pixels);
}

/** A minimal RGB PNG encoder. `rows` already has a 0 filter byte per row. */
function encodePng(width: number, height: number, rows: Buffer) {
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Satori layout over the field: mark top left, label and title bottom left. */
function bannerElement({
  width,
  height,
  title,
  label,
  backgroundSrc,
  logoSrc,
}: {
  width: number;
  height: number;
  title: string;
  label: string;
  backgroundSrc: string;
  logoSrc: string;
}): ReactElement {
  const unit = height / 630;
  const pad = Math.round(72 * unit);
  return (
    <div style={{ width, height, display: "flex", position: "relative", fontFamily: CARD_TEXT_FONT, color: TEXT }}>
      <img src={backgroundSrc} alt="" width={width} height={height} style={{ position: "absolute", inset: 0 }} />
      <img
        src={logoSrc}
        alt=""
        width={Math.round(48 * unit)}
        height={Math.round(48 * unit)}
        style={{ position: "absolute", left: pad, top: pad, borderRadius: Math.round(12 * unit) }}
      />
      <div
        style={{
          position: "absolute",
          left: pad,
          bottom: pad,
          width: Math.round(660 * unit),
          display: "flex",
          flexDirection: "column",
          gap: Math.round(16 * unit),
        }}
      >
        <div style={{ display: "flex", fontSize: Math.round(20 * unit), color: MUTED }}>{label}</div>
        <div
          style={{
            display: "flex",
            fontSize: Math.round((title.length > 40 ? 50 : 60) * unit),
            fontFamily: CARD_TITLE_FONT,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            wordSpacing: "0.08em",
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

export type BannerAssets = Awaited<ReturnType<typeof loadBannerAssets>>;

export async function loadBannerAssets() {
  const read = (file: string) => readFile(path.join("public", file));
  const [fonts, logo] = await Promise.all([loadCardFonts(), read("beui-mark.png")]);
  return {
    fonts,
    logoSrc: `data:image/png;base64,${logo.toString("base64")}`,
  };
}

/** Both banners for one post, as PNG buffers. */
export async function renderBlogBanners(
  post: { slug: string; title: string; product: BlogProduct },
  assets: BannerAssets,
) {
  const label = { beui: "beUI blog", pro: "beUI Pro", native: "beUI Native" }[post.product];
  const render = async (size: { width: number; height: number }) => {
    const cell = Math.max(3, Math.round((3 * size.height) / 630));
    const background = bannerFieldPng(size.width, size.height, post.slug, cell);
    const svg = await satori(
      bannerElement({
        ...size,
        title: post.title,
        label,
        backgroundSrc: `data:image/png;base64,${background.toString("base64")}`,
        logoSrc: assets.logoSrc,
      }),
      { ...size, fonts: assets.fonts },
    );
    return new Resvg(svg).render().asPng();
  };
  const [og, cover] = await Promise.all([render(BANNER_SIZES.og), render(BANNER_SIZES.cover)]);
  return { og, cover };
}

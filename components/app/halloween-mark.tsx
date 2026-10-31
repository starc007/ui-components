"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useId } from "react";
import { SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

// Seasonal beUI mark. At rest it is the original dark ring; on hover it turns
// pumpkin orange and springs into a lobed pumpkin, a stem sprouts, the square hole morphs
// into a carved grin, eyes cut in, candlelight flickers and two bats escape.
// Every shape is a fixed-length point list, so one progress value `t` lerps
// them all and a spring overshoot exaggerates the pumpkin instead of breaking it.

type Point = readonly [number, number];

const OUTER_POINTS = 96;
const HOLE_POINTS = 64;

// Distance from the centre to a rounded square's edge along angle `theta`.
function roundedSquareRadius(theta: number, half: number, radius: number) {
  const ax = Math.abs(Math.cos(theta));
  const ay = Math.abs(Math.sin(theta));
  const flat = half - radius;
  const major = Math.max(ax, ay);
  const minor = Math.min(ax, ay);
  const toSide = half / major;
  if (toSide * minor <= flat) return toSide;
  const dot = (ax + ay) * flat;
  return dot + Math.sqrt(dot * dot - 2 * flat * flat + radius * radius);
}

function polar(
  count: number,
  start: number,
  center: Point,
  radiusAt: (theta: number) => readonly [number, number],
): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const theta = start + (i / count) * Math.PI * 2;
    const [rx, ry] = radiusAt(theta);
    return [center[0] + rx * Math.cos(theta), center[1] + ry * Math.sin(theta)];
  });
}

// Evenly spaced points by arc length around a closed polygon.
function resample(points: Point[], count: number): Point[] {
  const lengths = [0];
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    lengths.push(lengths[i] + Math.hypot(x2 - x1, y2 - y1));
  }
  const total = lengths[points.length];
  const out: Point[] = [];
  let segment = 0;
  for (let i = 0; i < count; i++) {
    const target = (i / count) * total;
    while (lengths[segment + 1] < target) segment++;
    const span = lengths[segment + 1] - lengths[segment] || 1;
    const k = (target - lengths[segment]) / span;
    const [x1, y1] = points[segment];
    const [x2, y2] = points[(segment + 1) % points.length];
    out.push([x1 + (x2 - x1) * k, y1 + (y2 - y1) * k]);
  }
  return out;
}

// Both outlines start at the top and run clockwise, so index i matches.
const RING_REST = polar(OUTER_POINTS, -Math.PI / 2, [50, 50], (theta) => {
  const r = roundedSquareRadius(theta, 33, 22);
  return [r, r];
});
const RING_PUMPKIN = polar(OUTER_POINTS, -Math.PI / 2, [50, 54], (theta) => {
  // Six lobes with sharp creases; a crease lands at the top for the stem.
  const lobe = 0.86 + 0.14 * Math.sqrt(Math.abs(Math.cos(3 * theta)));
  return [39 * lobe, 33 * lobe];
});

// Both holes start at their left edge and run clockwise.
const HOLE_REST = resample(
  polar(256, Math.PI, [50, 50], (theta) => {
    const r = roundedSquareRadius(theta, 16.7, 8.2);
    return [r, r];
  }),
  HOLE_POINTS,
);
const HOLE_GRIN = resample(
  [
    [31, 59],
    [37, 61.5],
    [40, 66],
    [43.5, 62.5],
    [50, 63.5],
    [56.5, 62.5],
    [60, 66],
    [63, 61.5],
    [69, 59],
    [66, 67],
    [60, 72.5],
    [54, 74.5],
    [50, 70],
    [46, 74.5],
    [40, 72.5],
    [34, 67],
  ],
  HOLE_POINTS,
);

const EYES: Point[][] = [
  [
    [32, 51],
    [45, 51],
    [40, 39],
  ],
  [
    [55, 51],
    [68, 51],
    [60, 39],
  ],
  [
    [47.5, 58],
    [52.5, 58],
    [50, 54],
  ],
];

const toFixed = (n: number) => Math.round(n * 100) / 100;

function lerpPath(from: Point[], to: Point[], t: number) {
  let d = "";
  for (let i = 0; i < from.length; i++) {
    const x = from[i][0] + (to[i][0] - from[i][0]) * t;
    const y = from[i][1] + (to[i][1] - from[i][1]) * t;
    d += `${i === 0 ? "M" : "L"}${toFixed(x)} ${toFixed(y)}`;
  }
  return `${d}Z`;
}

function scaledPath(points: Point[], scale: number) {
  const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return `${points
    .map(
      ([x, y], i) =>
        `${i === 0 ? "M" : "L"}${toFixed(cx + (x - cx) * scale)} ${toFixed(cy + (y - cy) * scale)}`,
    )
    .join("")}Z`;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Deliberately underdamped so the pumpkin swells past its shape and settles,
// which reads as the mark coming alive. Only used on the way in.
const SPRING_CARVE = {
  type: "spring",
  stiffness: 240,
  damping: 13,
  mass: 0.7,
} as const;

const FLICKER = [1, 0.72, 0.95, 0.8, 1, 0.62, 0.9, 1];

const BAT_PATH =
  "M0 0C-1.6-2.6-4.6-3-7-1.2C-5.2-1.1-4.4-.2-4.3 1C-3.1.1-1.4.3 0 2C1.4.3 3.1.1 4.3 1C4.4-.2 5.2-1.1 7-1.2C4.6-3 1.6-2.6 0 0Z";

const BATS = [
  { to: { x: 120, y: -40 }, delay: 0.08, scale: 1.8 },
  { to: { x: 64, y: -72 }, delay: 0.18, scale: 1.4 },
] as const;

export function HalloweenMark({
  hovered,
  className,
}: {
  hovered: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();
  const t = useMotionValue(0);
  const flicker = useMotionValue(1);

  useEffect(() => {
    const target = hovered ? 1 : 0;
    const controls = reduceMotion
      ? animate(t, target, { duration: 0.2 })
      : animate(t, target, hovered ? SPRING_CARVE : SPRING_SWAP);
    return () => controls.stop();
  }, [hovered, reduceMotion, t]);

  useEffect(() => {
    if (!hovered || reduceMotion) {
      flicker.set(1);
      return;
    }
    const controls = animate(flicker, FLICKER, {
      duration: 1.4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    });
    return () => controls.stop();
  }, [hovered, reduceMotion, flicker]);

  const ring = useTransform(
    t,
    (v) => `${lerpPath(RING_REST, RING_PUMPKIN, v)}${lerpPath(HOLE_REST, HOLE_GRIN, v)}`,
  );
  const eyes = useTransform(t, (v) =>
    EYES.map((eye) => scaledPath(eye, clamp01(v))).join(""),
  );
  const glow = useTransform([t, flicker], ([v, f]) => clamp01(v as number) * (f as number));
  const tile = useTransform(t, [0, 1], ["#fafafa", "#1e1b4b"]);
  const stemY = useTransform(t, [0, 1], [0, 9]);
  const stemScale = useTransform(t, [0, 1], [0, 1.2]);
  const ringFill = useTransform(t, [0, 0.6], ["#171717", "#f97316"]);
  const stemRotate = useTransform(t, [0, 1], [0, 14]);

  const moving = hovered && !reduceMotion;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      overflow="visible"
      className={cn("shrink-0", className)}
      animate={moving ? { rotate: [0, -12, 9, -5, 2, 0] } : { rotate: 0 }}
      transition={{ duration: 0.65 }}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      <motion.rect width="100" height="100" rx="32" style={{ fill: tile }} />
      <motion.rect
        x="26"
        y="30"
        width="48"
        height="50"
        fill={`url(#${gradientId})`}
        style={{ opacity: glow }}
      />
      <motion.g
        style={{
          y: stemY,
          scale: stemScale,
          rotate: stemRotate,
          transformBox: "fill-box",
          transformOrigin: "50% 100%",
        }}
      >
        <path d="M46.5 20.5C46 15 47 11 50.5 9.5C52.5 9 54 10 53.5 12C52 14 52.5 17 53.5 20.5Z" fill="#4d7c0f" />
      </motion.g>
      <motion.path d={ring} fillRule="evenodd" style={{ fill: ringFill }} />
      <motion.path d={eyes} fill="#facc15" style={{ opacity: glow }} />
      {BATS.map((bat) => (
        <motion.g
          key={bat.delay}
          className="text-foreground"
          initial={false}
          animate={
            moving
              ? {
                  x: [50, 50 + bat.to.x],
                  y: [52, 52 + bat.to.y],
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.6, bat.scale * 1.6],
                }
              : { x: 50, y: 52, opacity: 0, scale: 0.2 }
          }
          transition={
            moving
              ? { duration: 0.9, delay: bat.delay, ease: "easeOut" }
              : { duration: 0 }
          }
        >
          <motion.path
            d={BAT_PATH}
            fill="currentColor"
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            animate={moving ? { scaleY: [1, -0.4, 1] } : { scaleY: 1 }}
            transition={
              moving
                ? { duration: 0.18, repeat: Number.POSITIVE_INFINITY }
                : { duration: 0 }
            }
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}

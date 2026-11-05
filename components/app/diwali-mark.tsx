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

// Seasonal beUI mark. At rest it is the original dark ring; on hover it melts
// into a clay diya, the square hole becomes a pool of glowing oil, a flame
// lights at the spout and gold sparks burst from it while the pointer stays.
// Every outline is a fixed-length point list, so one progress value `t` lerps
// them all and a spring overshoot swells the lamp instead of breaking it.

type Point = readonly [number, number];

const OUTER_POINTS = 120;
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

function roundedSquare(start: number, half: number, radius: number): Point[] {
  return Array.from({ length: 512 }, (_, i) => {
    const theta = start + (i / 512) * Math.PI * 2;
    const r = roundedSquareRadius(theta, half, radius);
    return [50 + r * Math.cos(theta), 50 + r * Math.sin(theta)];
  });
}

function ellipse(cx: number, cy: number, rx: number, ry: number): Point[] {
  return Array.from({ length: 256 }, (_, i) => {
    const theta = Math.PI + (i / 256) * Math.PI * 2;
    return [cx + rx * Math.cos(theta), cy + ry * Math.sin(theta)];
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

// Diya in profile: a flat lip, a spout rising to the right, a round clay bowl.
function diya(): Point[] {
  const bowl: Point[] = [];
  for (let i = 0; i <= 40; i++) {
    const theta = ((5 + (175 * i) / 40) * Math.PI) / 180;
    bowl.push([44 + 28 * Math.cos(theta), 57 + 22 * Math.sin(theta)]);
  }
  return [
    [44, 55],
    [70, 55],
    [86, 44],
    [80, 53],
    ...bowl,
    [13, 52],
    [22, 55],
  ];
}

// The lamp is drawn on a 100 grid, then grown about the centre to fill the tile.
const LAMP_SCALE = 1.12;
const grow = ([x, y]: Point): Point => [
  50 + (x - 50) * LAMP_SCALE,
  50 + (y - 50) * LAMP_SCALE,
];

// Both outlines start at the top centre and run clockwise, so index i matches.
const RING_REST = resample(roundedSquare(-Math.PI / 2, 33, 22), OUTER_POINTS);
const RING_DIYA = resample(diya().map(grow), OUTER_POINTS);
// Both holes start at their left edge and run clockwise.
const HOLE_REST = resample(roundedSquare(Math.PI, 16.7, 8.2), HOLE_POINTS);
const HOLE_OIL = resample(ellipse(44, 59, 22, 3.5).map(grow), HOLE_POINTS);

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

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Underdamped so the lamp swells past its shape and settles as it lights.
// Only used on the way in; leaving uses the critically damped SPRING_SWAP.
const SPRING_LIGHT = {
  type: "spring",
  stiffness: 260,
  damping: 16,
  mass: 0.7,
} as const;

const FLAME_BASE = grow([85, 45]);
const FLAME_TIP = grow([85, 19]);
const FLAME_PATH =
  "M0 0C-7 0-8.5-8-4.5-14C-2.5-17.5-.5-21.5 0-26C3-21 8.5-15 7.5-8C7-3 4 0 0 0Z";
const FLAME_CORE_PATH =
  "M0 0C-3.5 0-4.5-4-2.5-8C-1.5-10-.5-12 0-14C2-11 4.5-7 4-3.5C3.5-1 2 0 0 0Z";

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + (i % 2 ? 0.18 : 0);
  const distance = i % 3 === 0 ? 70 : i % 3 === 1 ? 56 : 44;
  return {
    x: Math.cos(angle) * distance,
    // A little gravity pulls every spark down as it fades.
    y: Math.sin(angle) * distance + 14,
    delay: 0.22 + (i % 4) * 0.025,
    color: i % 3 === 0 ? "#fde68a" : "#f59e0b",
  };
});

const DOTS = (
  [
    [30, 66],
    [44, 71],
    [58, 66],
  ] as Point[]
).map(grow);

export function DiwaliMark({
  hovered,
  className,
}: {
  hovered: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const oilId = useId();
  const haloId = useId();
  const t = useMotionValue(0);

  useEffect(() => {
    const target = hovered ? 1 : 0;
    const controls = reduceMotion
      ? animate(t, target, { duration: 0.2 })
      : animate(t, target, hovered ? SPRING_LIGHT : SPRING_SWAP);
    return () => controls.stop();
  }, [hovered, reduceMotion, t]);

  const shape = useTransform(
    t,
    (v) =>
      `${lerpPath(RING_REST, RING_DIYA, v)}${lerpPath(HOLE_REST, HOLE_OIL, v)}`,
  );
  const oil = useTransform(t, (v) => lerpPath(HOLE_REST, HOLE_OIL, v));
  const glow = useTransform(t, (v) => clamp01(v));
  const flame = useTransform(t, [0.35, 1], [0, 1]);
  const halo = useTransform(t, [0.35, 1], [0, 0.55]);
  const tile = useTransform(t, [0, 1], ["#fafafa", "#451a03"]);
  const clay = useTransform(t, [0, 0.6], ["#171717", "#c2410c"]);

  const moving = hovered && !reduceMotion;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      overflow="visible"
      className={cn("shrink-0", className)}
      animate={moving ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
    >
      <defs>
        <linearGradient id={oilId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={haloId}>
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.rect width="100" height="100" rx="32" style={{ fill: tile }} />
      <motion.circle
        cx={FLAME_BASE[0]}
        cy={FLAME_BASE[1] - 12}
        r="22"
        fill={`url(#${haloId})`}
        style={{ opacity: halo }}
      />
      <motion.path d={shape} fillRule="evenodd" style={{ fill: clay }} />
      <motion.path d={oil} fill={`url(#${oilId})`} style={{ opacity: glow }} />
      {DOTS.map(([cx, cy]) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={cy}
          r="2.6"
          fill="#fcd34d"
          style={{ opacity: glow }}
        />
      ))}
      <g
        transform={`translate(${FLAME_BASE[0]} ${FLAME_BASE[1]}) scale(${LAMP_SCALE})`}
      >
        <motion.g
          style={{
            opacity: flame,
            scale: reduceMotion ? 1 : flame,
            transformBox: "fill-box",
            transformOrigin: "50% 100%",
          }}
        >
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            animate={
              moving
                ? { scaleY: [1, 1.12, 0.94, 1.06, 1], rotate: [0, -4, 3, -2, 0] }
                : { scaleY: 1, rotate: 0 }
            }
            transition={
              moving
                ? { duration: 0.9, repeat: Number.POSITIVE_INFINITY }
                : { duration: 0 }
            }
          >
            <path d={FLAME_PATH} fill="#f59e0b" />
            <path d={FLAME_CORE_PATH} fill="#fffbeb" />
          </motion.g>
        </motion.g>
      </g>
      {SPARKS.map((spark) => (
        <motion.circle
          key={`${spark.x}-${spark.y}`}
          cx={FLAME_TIP[0]}
          cy={FLAME_TIP[1]}
          r="4.5"
          fill={spark.color}
          initial={false}
          animate={
            moving
              ? {
                  x: [0, spark.x],
                  y: [0, spark.y],
                  opacity: [0, 1, 1, 0],
                  scale: [1.2, 0.4],
                }
              : { x: 0, y: 0, opacity: 0, scale: 1 }
          }
          transition={
            moving
              ? {
                  duration: 0.9,
                  delay: spark.delay,
                  ease: "easeOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.6,
                }
              : { duration: 0 }
          }
        />
      ))}
    </motion.svg>
  );
}

"use client";

import { useReducedMotion } from "motion/react";
import { arr, num, type PlaygroundItem, type Values } from "../core";
import { TravelPreview } from "./travel-preview";

const FALLBACK = [0, 0, 0.58, 1];

/** cubic-bezier(x1,y1,x2,y2) as an easing fn: linear time (0..1) -> eased progress. */
function bezierEasing([x1, y1, x2, y2]: number[]) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    // Newton-Raphson to invert x(t), then read y(t)
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sampleY(t);
  };
}

// nine equal time slices — the box's eased position at each
const SLICES = Array.from({ length: 9 }, (_, i) => (i + 1) / 10);

// Named curves and what they feel like, matched to the current handles.
const NAMED: { curve: number[]; title: string; text: string }[] = [
  { curve: [0, 0, 1, 1], title: "linear", text: "Constant speed the whole way. Mechanical, no acceleration." },
  { curve: [0.42, 0, 1, 1], title: "easeIn", text: "Starts slow, speeds up into the end. Good for things leaving." },
  { curve: [0, 0, 0.58, 1], title: "easeOut", text: "Starts fast, slows into the end. Good for things arriving." },
  { curve: [0.42, 0, 0.58, 1], title: "easeInOut", text: "Slow start and finish, fast through the middle. Smooth and natural." },
];

const matchCaption = (c: number[]) => {
  const hit = NAMED.find((n) => n.curve.every((v, i) => Math.abs(v - c[i]) < 0.02));
  return (
    hit ?? {
      title: "custom",
      text: "Your own pacing. Steeper parts of the curve move faster.",
    }
  );
};

function TweenPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
  const curve = arr(values, "curve", FALLBACK);
  const ease = bezierEasing(curve);
  return (
    <TravelPreview
      replayKey={replayKey}
      strobe={reduce ? undefined : SLICES.map(ease)}
      caption={matchCaption(curve)}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: num(values, "duration", 0.6), ease: curve }
      }
    />
  );
}

const fmt = (e: number[]) => `[${e.map((n) => +n.toFixed(3)).join(", ")}]`;

export const tweenItem: PlaygroundItem = {
  slug: "tween",
  label: "Tween / Ease",
  blurb:
    "Time-based motion. Duration sets how long; the cubic-bezier curve sets the pacing. Drag the handles to shape it.",
  controls: [
    {
      kind: "slider",
      key: "duration",
      label: "Duration",
      hint: "How long the animation takes, start to finish.",
      min: 0.1,
      max: 3,
      step: 0.05,
      unit: "s",
    },
    {
      kind: "curve",
      key: "curve",
      label: "Easing curve",
      hint: "Pacing over time. Drag the handles — steep = fast, flat = slow.",
    },
  ],
  defaults: { duration: 0.6, curve: [0, 0, 0.58, 1] },
  presets: [
    { name: "linear", values: { curve: [0, 0, 1, 1] } },
    { name: "easeIn", values: { curve: [0.42, 0, 1, 1] } },
    { name: "easeOut", values: { curve: [0, 0, 0.58, 1] } },
    { name: "easeInOut", values: { curve: [0.42, 0, 0.58, 1] } },
  ],
  Preview: TweenPreview,
  explain: (v) => {
    const dur = num(v, "duration", 0.6);
    const curve = arr(v, "curve", FALLBACK);
    const cap = matchCaption(curve);
    return [
      {
        code: `duration: ${dur}`,
        text: `A fixed time, in seconds. The whole move always takes ${dur}s, no matter the distance. (Springs don't have this — tweens do.)`,
      },
      {
        code: `ease: [${curve.map((n) => +n.toFixed(2)).join(", ")}]`,
        text: "The easing curve, written as a cubic-bezier. The four numbers are two control handles (x1, y1, x2, y2) that bend how speed changes over time. You rarely type these by hand — drag the curve handles instead.",
      },
      {
        code: cap.title,
        text: `This curve reads as "${cap.title}": ${cap.text} The dots in the preview are the box's position at equal time slices, so spacing shows speed.`,
      },
    ];
  },
  toCode: (v) => `import { motion } from "motion/react";

export function Demo() {
  return (
    <motion.div
      animate={{ x: 120 }}
      transition={{
        duration: ${num(v, "duration", 0.6)},
        ease: ${fmt(arr(v, "curve", FALLBACK))},
      }}
    />
  );
}`,
};

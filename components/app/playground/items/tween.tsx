"use client";

import { useReducedMotion } from "motion/react";
import { arr, num, type PlaygroundItem, type Values } from "../core";
import { TravelPreview } from "./travel-preview";

const FALLBACK = [0, 0, 0.58, 1];

function TweenPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
  return (
    <TravelPreview
      replayKey={replayKey}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: num(values, "duration", 0.6), ease: arr(values, "curve", FALLBACK) }
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

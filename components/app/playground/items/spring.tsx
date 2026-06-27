"use client";

import { useReducedMotion } from "motion/react";
import { num, type PlaygroundItem, type Values } from "../core";
import { TravelPreview } from "./travel-preview";

function SpringPreview({
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
          : {
              type: "spring",
              stiffness: num(values, "stiffness", 500),
              damping: num(values, "damping", 30),
              mass: num(values, "mass", 0.6),
            }
      }
    />
  );
}

export const springItem: PlaygroundItem = {
  slug: "spring",
  label: "Spring",
  blurb:
    "Physics-based motion. Stiffness pulls toward the target, damping resists, mass adds weight. Lower damping overshoots.",
  controls: [
    {
      kind: "slider",
      key: "stiffness",
      label: "Stiffness",
      hint: "Pull toward the target. Higher = faster, snappier.",
      min: 1,
      max: 1000,
      step: 1,
    },
    {
      kind: "slider",
      key: "damping",
      label: "Damping",
      hint: "Resistance / friction. Lower = more bounce and overshoot.",
      min: 1,
      max: 100,
      step: 1,
    },
    {
      kind: "slider",
      key: "mass",
      label: "Mass",
      hint: "Weight of the object. Heavier = slower, more sluggish.",
      min: 0.1,
      max: 5,
      step: 0.1,
    },
  ],
  defaults: { stiffness: 500, damping: 30, mass: 0.6 },
  presets: [
    { name: "Gentle", values: { stiffness: 120, damping: 14, mass: 1 } },
    { name: "Wobbly", values: { stiffness: 180, damping: 8, mass: 1 } },
    { name: "Stiff", values: { stiffness: 700, damping: 40, mass: 0.8 } },
    { name: "Slow", values: { stiffness: 80, damping: 20, mass: 1.5 } },
  ],
  Preview: SpringPreview,
  toCode: (v) => `import { motion } from "motion/react";

export function Demo() {
  return (
    <motion.div
      animate={{ x: 120 }}
      transition={{
        type: "spring",
        stiffness: ${num(v, "stiffness", 500)},
        damping: ${num(v, "damping", 30)},
        mass: ${num(v, "mass", 0.6)},
      }}
    />
  );
}`,
};

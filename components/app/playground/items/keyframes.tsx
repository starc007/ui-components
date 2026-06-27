"use client";

import { motion, type Transition, useReducedMotion } from "motion/react";
import { arr, num, type PlaygroundItem, str, type Values } from "../core";

// Sensible starting values per property — used as defaults and when the
// animated property switches (so a scale list doesn't linger on a rotate).
const SEQ: Record<string, number[]> = {
  x: [0, 150, 40, 150, 0],
  scale: [1, 1.5, 0.7, 1.2, 1],
  rotate: [0, 90, 180, 270, 360],
  opacity: [1, 0.2, 1, 0.4, 1],
};

// Slider range + step for each property's checkpoint values.
const BOUNDS: Record<string, { min: number; max: number; step: number }> = {
  x: { min: -200, max: 200, step: 5 },
  scale: { min: 0, max: 2, step: 0.05 },
  rotate: { min: -360, max: 360, step: 5 },
  opacity: { min: 0, max: 1, step: 0.05 },
};

// What a single value means, in plain English, for the chosen property.
function describeValue(n: number, prop: string) {
  if (prop === "scale")
    return `${Math.round(n * 100)}% size${n > 1 ? ", bigger" : n < 1 ? ", smaller" : ", normal"}`;
  if (prop === "opacity")
    return `${Math.round(n * 100)}% visible${n === 0 ? ", invisible" : n === 1 ? ", solid" : ""}`;
  if (prop === "rotate")
    return `rotated ${n}°${n === 0 ? ", upright" : ""}`;
  return `${n}px ${n > 0 ? "right of" : n < 0 ? "left of" : "at"} start`;
}

function repeatOf(rep: string): Transition {
  if (rep === "loop") return { repeat: Number.POSITIVE_INFINITY, repeatType: "loop" };
  if (rep === "mirror") return { repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" };
  return { repeat: 0 };
}

function KeyframesPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
  const prop = str(values, "property", "scale");
  const dur = num(values, "duration", 2);
  const rep = str(values, "repeat", "loop");
  const frames = arr(values, "frames", SEQ.scale);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <motion.div
        // restart whenever any input that shapes the animation changes
        key={`${replayKey}-${prop}-${dur}-${rep}-${frames.join(",")}`}
        animate={reduce ? undefined : { [prop]: frames }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: dur, ease: "easeInOut", ...repeatOf(rep) }
        }
        className="h-14 w-14 rounded-2xl bg-primary"
      />
    </div>
  );
}

function repeatCode(rep: string) {
  if (rep === "loop") return ",\n        repeat: Infinity";
  if (rep === "mirror")
    return ',\n        repeat: Infinity,\n        repeatType: "mirror"';
  return "";
}

export const keyframesItem: PlaygroundItem = {
  slug: "keyframes",
  label: "Keyframes",
  blurb:
    "A property steps through a list of values in order, evenly spaced across the duration. Edit the list to change where it goes.",
  controls: [
    {
      kind: "select",
      key: "property",
      label: "Property",
      hint: "Which property the keyframes drive. Switching it resets the values.",
      options: [
        { label: "x", value: "x" },
        { label: "scale", value: "scale" },
        { label: "rotate", value: "rotate" },
        { label: "opacity", value: "opacity" },
      ],
    },
    {
      kind: "numberlist",
      key: "frames",
      label: "Keyframe values",
      hint: "Each slider is a checkpoint the box passes through, in order. Drag one, or add/remove checkpoints.",
      minItems: 2,
      maxItems: 8,
      bounds: (v) => BOUNDS[str(v, "property", "scale")] ?? BOUNDS.scale,
      describe: (n, v) => describeValue(n, str(v, "property", "scale")),
    },
    {
      kind: "slider",
      key: "duration",
      label: "Duration",
      hint: "Time for one pass through all the values.",
      min: 0.4,
      max: 4,
      step: 0.1,
      unit: "s",
    },
    {
      kind: "select",
      key: "repeat",
      label: "Repeat",
      hint: "Once, loop from the start, or mirror back and forth.",
      options: [
        { label: "Once", value: "once" },
        { label: "Loop", value: "loop" },
        { label: "Mirror", value: "mirror" },
      ],
    },
  ],
  defaults: { property: "scale", frames: SEQ.scale, duration: 2, repeat: "loop" },
  // switching property loads that property's starting checkpoints
  coerce: (key, next) =>
    key === "property"
      ? { ...next, frames: SEQ[str(next, "property", "scale")] ?? SEQ.scale }
      : next,
  presets: [
    { name: "Pulse", values: { property: "scale", frames: [1, 1.4, 1], duration: 1.4, repeat: "mirror" } },
    { name: "Spin", values: { property: "rotate", frames: [0, 360], duration: 2, repeat: "loop" } },
    { name: "Blink", values: { property: "opacity", frames: [1, 0.2, 1], duration: 1.2, repeat: "mirror" } },
  ],
  Preview: KeyframesPreview,
  explain: (v) => {
    const prop = str(v, "property", "scale");
    const dur = num(v, "duration", 2);
    const rep = str(v, "repeat", "loop");
    const seq = arr(v, "frames", SEQ.scale);

    const read = (n: number) => {
      if (prop === "scale")
        return `${n} (${Math.round(n * 100)}% size${n > 1 ? ", bigger" : n < 1 ? ", smaller" : ", normal"})`;
      if (prop === "opacity") return `${n} (${Math.round(n * 100)}% visible)`;
      if (prop === "rotate") return `${n}°`;
      return `${n}px`;
    };

    return [
      {
        code: `${prop}: [${seq.join(", ")}]`,
        text: `This array is a list of values the box passes through, in order: ${seq.map(read).join(" → ")}. It's not "from A to B" — it hits every value as a checkpoint.`,
      },
      {
        code: `${seq.length} keyframes over ${dur}s`,
        text: `The values are spaced evenly across the duration. ${seq.length} values over ${dur}s means each leg takes about ${seq.length > 1 ? +(dur / (seq.length - 1)).toFixed(2) : dur}s. Add or remove values to change the path.`,
      },
      {
        code: `repeat: ${rep}`,
        text:
          rep === "loop"
            ? "Loop: when it reaches the last value it jumps back to the first and runs again — so it can snap at the seam."
            : rep === "mirror"
              ? "Mirror: it plays forward, then backward, then forward — smooth, no snap, like a pulse."
              : "Once: it runs a single time and stops on the last value.",
      },
    ];
  },
  toCode: (v) => {
    const prop = str(v, "property", "scale");
    const seq = arr(v, "frames", SEQ.scale);
    return `import { motion } from "motion/react";

export function Demo() {
  return (
    <motion.div
      animate={{ ${prop}: [${seq.join(", ")}] }}
      transition={{
        duration: ${num(v, "duration", 2)},
        ease: "easeInOut"${repeatCode(str(v, "repeat", "loop"))},
      }}
    />
  );
}`;
  },
};

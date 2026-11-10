"use client";

import { motion, type Transition, useReducedMotion } from "motion/react";
import { arr, num, type PlaygroundItem, type PlaygroundT, str, type Values } from "../core";

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
const trend = (n: number) => (n > 1 ? "bigger" : n < 1 ? "smaller" : "normal");

function describeValue(n: number, prop: string, t: PlaygroundT) {
  const percent = String(Math.round(n * 100));
  if (prop === "scale")
    return t("keyframes.describe.scale", { percent, trend: trend(n) });
  if (prop === "opacity")
    return t("keyframes.describe.opacity", {
      percent,
      state: n === 0 ? "invisible" : n === 1 ? "solid" : "partial",
    });
  if (prop === "rotate")
    return t("keyframes.describe.rotate", {
      value: String(n),
      upright: n === 0 ? "yes" : "no",
    });
  return t("keyframes.describe.x", {
    value: String(n),
    side: n > 0 ? "right" : n < 0 ? "left" : "at",
  });
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

export const keyframesItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "keyframes",
  label: t("keyframes.label"),
  blurb: t("keyframes.blurb"),
  controls: [
    {
      kind: "select",
      key: "property",
      label: t("keyframes.controls.property.label"),
      hint: t("keyframes.controls.property.hint"),
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
      label: t("keyframes.controls.frames.label"),
      hint: t("keyframes.controls.frames.hint"),
      minItems: 2,
      maxItems: 8,
      bounds: (v) => BOUNDS[str(v, "property", "scale")] ?? BOUNDS.scale,
      describe: (n, v) => describeValue(n, str(v, "property", "scale"), t),
    },
    {
      kind: "slider",
      key: "duration",
      label: t("keyframes.controls.duration.label"),
      hint: t("keyframes.controls.duration.hint"),
      min: 0.4,
      max: 4,
      step: 0.1,
      unit: "s",
    },
    {
      kind: "select",
      key: "repeat",
      label: t("keyframes.controls.repeat.label"),
      hint: t("keyframes.controls.repeat.hint"),
      options: [
        { label: t("keyframes.controls.repeat.once"), value: "once" },
        { label: t("keyframes.controls.repeat.loop"), value: "loop" },
        { label: t("keyframes.controls.repeat.mirror"), value: "mirror" },
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
    { name: t("keyframes.presets.pulse"), values: { property: "scale", frames: [1, 1.4, 1], duration: 1.4, repeat: "mirror" } },
    { name: t("keyframes.presets.spin"), values: { property: "rotate", frames: [0, 360], duration: 2, repeat: "loop" } },
    { name: t("keyframes.presets.blink"), values: { property: "opacity", frames: [1, 0.2, 1], duration: 1.2, repeat: "mirror" } },
  ],
  Preview: KeyframesPreview,
  explain: (v) => {
    const prop = str(v, "property", "scale");
    const dur = num(v, "duration", 2);
    const rep = str(v, "repeat", "loop");
    const seq = arr(v, "frames", SEQ.scale);

    const read = (n: number) => {
      const percent = String(Math.round(n * 100));
      if (prop === "scale")
        return t("keyframes.read.scale", { value: String(n), percent, trend: trend(n) });
      if (prop === "opacity")
        return t("keyframes.read.opacity", { value: String(n), percent });
      if (prop === "rotate") return `${n}°`;
      return `${n}px`;
    };

    return [
      {
        code: `${prop}: [${seq.join(", ")}]`,
        text: t("keyframes.explain.sequence", { sequence: seq.map(read).join(" → ") }),
      },
      {
        code: t("keyframes.explain.countCode", {
          count: String(seq.length),
          duration: String(dur),
        }),
        text: t("keyframes.explain.spacing", {
          count: String(seq.length),
          duration: String(dur),
          leg: String(seq.length > 1 ? +(dur / (seq.length - 1)).toFixed(2) : dur),
        }),
      },
      {
        code: `repeat: ${rep}`,
        text:
          rep === "loop"
            ? t("keyframes.explain.loop")
            : rep === "mirror"
              ? t("keyframes.explain.mirror")
              : t("keyframes.explain.once"),
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
});

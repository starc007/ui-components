"use client";

import { useReducedMotion } from "motion/react";
import { num, type PlaygroundItem, type PlaygroundT, type Values } from "../core";
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

export const springItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "spring",
  label: t("spring.label"),
  blurb: t("spring.blurb"),
  controls: [
    {
      kind: "slider",
      key: "stiffness",
      label: t("spring.controls.stiffness.label"),
      hint: t("spring.controls.stiffness.hint"),
      min: 1,
      max: 1000,
      step: 1,
    },
    {
      kind: "slider",
      key: "damping",
      label: t("spring.controls.damping.label"),
      hint: t("spring.controls.damping.hint"),
      min: 1,
      max: 100,
      step: 1,
    },
    {
      kind: "slider",
      key: "mass",
      label: t("spring.controls.mass.label"),
      hint: t("spring.controls.mass.hint"),
      min: 0.1,
      max: 5,
      step: 0.1,
    },
  ],
  defaults: { stiffness: 500, damping: 30, mass: 0.6 },
  presets: [
    { name: t("spring.presets.gentle"), values: { stiffness: 120, damping: 14, mass: 1 } },
    { name: t("spring.presets.wobbly"), values: { stiffness: 180, damping: 8, mass: 1 } },
    { name: t("spring.presets.stiff"), values: { stiffness: 700, damping: 40, mass: 0.8 } },
    { name: t("spring.presets.slow"), values: { stiffness: 80, damping: 20, mass: 1.5 } },
  ],
  Preview: SpringPreview,
  explain: (v) => {
    const s = num(v, "stiffness", 500);
    const d = num(v, "damping", 30);
    const m = num(v, "mass", 0.6);
    // values go in as strings so ICU prints them exactly as the code does
    return [
      {
        code: 'type: "spring"',
        text: t("spring.explain.type"),
      },
      {
        code: `stiffness: ${s}`,
        text: t("spring.explain.stiffness", {
          value: String(s),
          level: s < 200 ? "soft" : s < 500 ? "medium" : "strong",
        }),
      },
      {
        code: `damping: ${d}`,
        text: t("spring.explain.damping", {
          value: String(d),
          level: d < 18 ? "low" : d < 35 ? "medium" : "high",
        }),
      },
      {
        code: `mass: ${m}`,
        text: t("spring.explain.mass", {
          value: String(m),
          level: m < 0.6 ? "light" : m > 1.2 ? "heavy" : "medium",
        }),
      },
    ];
  },
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
});

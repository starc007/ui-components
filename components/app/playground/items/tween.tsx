"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "use-intl";
import { arr, num, type PlaygroundItem, type PlaygroundT, type Values } from "../core";
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

// Named curves (titles are the Motion easing names), matched to the current handles.
const NAMED = [
  { curve: [0, 0, 1, 1], title: "linear" },
  { curve: [0.42, 0, 1, 1], title: "easeIn" },
  { curve: [0, 0, 0.58, 1], title: "easeOut" },
  { curve: [0.42, 0, 0.58, 1], title: "easeInOut" },
] as const;

const matchCaption = (c: number[], t: PlaygroundT) => {
  const hit = NAMED.find((n) => n.curve.every((v, i) => Math.abs(v - c[i]) < 0.02));
  return hit
    ? { title: hit.title, text: t(`tween.curves.${hit.title}`) }
    : { title: t("tween.curves.customTitle"), text: t("tween.curves.custom") };
};

function TweenPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
  const t = useTranslations("Pages.playground");
  const curve = arr(values, "curve", FALLBACK);
  const ease = bezierEasing(curve);
  return (
    <TravelPreview
      replayKey={replayKey}
      strobe={reduce ? undefined : SLICES.map(ease)}
      caption={matchCaption(curve, t)}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: num(values, "duration", 0.6),
              // The curve editor always stores four control values.
              ease: curve as [number, number, number, number],
            }
      }
    />
  );
}

const fmt = (e: number[]) => `[${e.map((n) => +n.toFixed(3)).join(", ")}]`;

export const tweenItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "tween",
  label: t("tween.label"),
  blurb: t("tween.blurb"),
  controls: [
    {
      kind: "slider",
      key: "duration",
      label: t("tween.controls.duration.label"),
      hint: t("tween.controls.duration.hint"),
      min: 0.1,
      max: 3,
      step: 0.05,
      unit: "s",
    },
    {
      kind: "curve",
      key: "curve",
      label: t("tween.controls.curve.label"),
      hint: t("tween.controls.curve.hint"),
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
    const cap = matchCaption(curve, t);
    return [
      {
        code: `duration: ${dur}`,
        text: t("tween.explain.duration", { value: String(dur) }),
      },
      {
        code: `ease: [${curve.map((n) => +n.toFixed(2)).join(", ")}]`,
        text: t("tween.explain.ease"),
      },
      {
        code: cap.title,
        text: t("tween.explain.curve", { title: cap.title, text: cap.text }),
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
});

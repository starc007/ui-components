"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { num, type PlaygroundItem, type PlaygroundT, str, type Values } from "../core";

function GesturesPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
  const t = useTranslations("Pages.playground.gestures");
  const ref = useRef<HTMLDivElement>(null);
  const hover = num(values, "hover", 1.2);
  const tap = num(values, "tap", 0.9);
  const mode = str(values, "drag", "x");
  const drag = mode === "off" ? false : mode === "free" ? true : (mode as "x" | "y");

  return (
    <div
      ref={ref}
      className="relative flex min-h-[200px] w-full items-center justify-center"
    >
      <motion.div
        key={replayKey}
        drag={drag}
        dragConstraints={ref}
        dragElastic={0.2}
        whileHover={reduce ? undefined : { scale: hover }}
        whileTap={reduce ? undefined : { scale: tap }}
        className="flex h-16 w-16 cursor-grab touch-none items-center justify-center rounded-2xl bg-primary text-xs font-medium text-primary-foreground active:cursor-grabbing"
      >
        {t("box")}
      </motion.div>
    </div>
  );
}

export const gesturesItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "gestures",
  label: t("gestures.label"),
  blurb: t("gestures.blurb"),
  controls: [
    {
      kind: "slider",
      key: "hover",
      label: t("gestures.controls.hover.label"),
      hint: t("gestures.controls.hover.hint"),
      min: 1,
      max: 1.6,
      step: 0.05,
    },
    {
      kind: "slider",
      key: "tap",
      label: t("gestures.controls.tap.label"),
      hint: t("gestures.controls.tap.hint"),
      min: 0.6,
      max: 1,
      step: 0.05,
    },
    {
      kind: "select",
      key: "drag",
      label: t("gestures.controls.drag.label"),
      hint: t("gestures.controls.drag.hint"),
      options: [
        { label: t("gestures.controls.drag.off"), value: "off" },
        { label: t("gestures.controls.drag.x"), value: "x" },
        { label: t("gestures.controls.drag.y"), value: "y" },
        { label: t("gestures.controls.drag.free"), value: "free" },
      ],
    },
  ],
  defaults: { hover: 1.2, tap: 0.9, drag: "x" },
  presets: [
    { name: t("gestures.presets.subtle"), values: { hover: 1.1, tap: 0.95 } },
    { name: t("gestures.presets.pop"), values: { hover: 1.4, tap: 0.85 } },
  ],
  Preview: GesturesPreview,
  explain: (v) => {
    const hover = num(v, "hover", 1.2);
    const tap = num(v, "tap", 0.9);
    const mode = str(v, "drag", "x");
    return [
      {
        code: `whileHover={{ scale: ${hover} }}`,
        text: t("gestures.explain.hover", {
          value: String(hover),
          percent: String(Math.round(hover * 100)),
        }),
      },
      {
        code: `whileTap={{ scale: ${tap} }}`,
        text: t("gestures.explain.tap", {
          value: String(tap),
          pressIn: tap < 1 ? "yes" : "no",
        }),
      },
      {
        code: mode === "off" ? "drag={false}" : mode === "free" ? "drag" : `drag="${mode}"`,
        text:
          mode === "off"
            ? t("gestures.explain.dragOff")
            : t("gestures.explain.drag", { mode }),
      },
    ];
  },
  toCode: (v) => {
    const mode = str(v, "drag", "x");
    const dragAttr =
      mode === "off"
        ? ""
        : mode === "free"
          ? "\n      drag"
          : `\n      drag="${mode}"`;
    return `import { motion } from "motion/react";

export function Demo() {
  return (
    <motion.div${dragAttr}
      whileHover={{ scale: ${num(v, "hover", 1.2)} }}
      whileTap={{ scale: ${num(v, "tap", 0.9)} }}
    />
  );
}`;
  },
});

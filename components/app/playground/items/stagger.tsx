"use client";

import { motion, useReducedMotion } from "motion/react";
import { num, type PlaygroundItem, type PlaygroundT, str, type Values } from "../core";

function StaggerPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
  const count = Math.round(num(values, "count", 6));
  const stagger = num(values, "stagger", 0.06);
  const delayChildren = num(values, "delayChildren", 0);
  const direction = str(values, "direction", "forward") === "reverse" ? -1 : 1;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.div
        key={replayKey}
        initial="hidden"
        animate="show"
        variants={{
          show: {
            transition: reduce
              ? { duration: 0 }
              : {
                  staggerChildren: stagger,
                  delayChildren,
                  staggerDirection: direction,
                },
          },
        }}
        className="flex gap-2.5"
      >
        {Array.from({ length: count }, (_, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-order primitive dots
            key={i}
            variants={{
              hidden: { opacity: 0, scale: 0.4, y: 12 },
              show: { opacity: 1, scale: 1, y: 0 },
            }}
            transition={reduce ? { duration: 0 } : { duration: 0.35 }}
            className="h-10 w-10 rounded-xl bg-primary"
          />
        ))}
      </motion.div>
    </div>
  );
}

export const staggerItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "stagger",
  label: t("stagger.label"),
  blurb: t("stagger.blurb"),
  controls: [
    {
      kind: "slider",
      key: "count",
      label: t("stagger.controls.count.label"),
      hint: t("stagger.controls.count.hint"),
      min: 3,
      max: 12,
      step: 1,
    },
    {
      kind: "slider",
      key: "stagger",
      label: t("stagger.controls.stagger.label"),
      hint: t("stagger.controls.stagger.hint"),
      min: 0,
      max: 0.2,
      step: 0.01,
      unit: "s",
    },
    {
      kind: "slider",
      key: "delayChildren",
      label: t("stagger.controls.delayChildren.label"),
      hint: t("stagger.controls.delayChildren.hint"),
      min: 0,
      max: 0.6,
      step: 0.05,
      unit: "s",
    },
    {
      kind: "select",
      key: "direction",
      label: t("stagger.controls.direction.label"),
      hint: t("stagger.controls.direction.hint"),
      options: [
        { label: t("stagger.controls.direction.forward"), value: "forward" },
        { label: t("stagger.controls.direction.reverse"), value: "reverse" },
      ],
    },
  ],
  defaults: { count: 6, stagger: 0.06, delayChildren: 0, direction: "forward" },
  presets: [
    { name: t("stagger.presets.tight"), values: { stagger: 0.03, delayChildren: 0 } },
    { name: t("stagger.presets.relaxed"), values: { stagger: 0.08, delayChildren: 0.1 } },
    { name: t("stagger.presets.dramatic"), values: { stagger: 0.14, delayChildren: 0.2 } },
  ],
  Preview: StaggerPreview,
  explain: (v) => {
    const count = Math.round(num(v, "count", 6));
    const st = num(v, "stagger", 0.06);
    const dc = num(v, "delayChildren", 0);
    const dir = str(v, "direction", "forward");
    const last = +(dc + (count - 1) * st).toFixed(2);
    return [
      {
        code: "variants={ hidden, show }",
        text: t("stagger.explain.variants"),
      },
      {
        code: `staggerChildren: ${st}`,
        text: t("stagger.explain.staggerChildren", { value: String(st) }),
      },
      {
        code: `delayChildren: ${dc}`,
        text: t("stagger.explain.delayChildren", {
          value: String(dc),
          immediate: dc === 0 ? "yes" : "no",
        }),
      },
      {
        code: t("stagger.explain.summaryCode", {
          count: String(count),
          direction: dir,
        }),
        text: t("stagger.explain.summary", {
          count: String(count),
          stagger: String(st),
          delayed: dc ? "yes" : "no",
          delay: String(dc),
          last: String(last),
          direction: dir,
        }),
      },
    ];
  },
  toCode: (v) => {
    const dir = str(v, "direction", "forward") === "reverse" ? -1 : 1;
    return `import { motion } from "motion/react";

const container = {
  show: {
    transition: {
      staggerChildren: ${num(v, "stagger", 0.06)},
      delayChildren: ${num(v, "delayChildren", 0)},
      staggerDirection: ${dir},
    },
  },
};

const child = {
  hidden: { opacity: 0, scale: 0.4, y: 12 },
  show: { opacity: 1, scale: 1, y: 0 },
};

export function Demo() {
  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {items.map((item) => (
        <motion.div key={item} variants={child} />
      ))}
    </motion.div>
  );
}`;
  },
});

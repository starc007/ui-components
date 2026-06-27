"use client";

import { motion, useReducedMotion } from "motion/react";
import { num, type PlaygroundItem, str, type Values } from "../core";

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

export const staggerItem: PlaygroundItem = {
  slug: "stagger",
  label: "Stagger",
  blurb:
    "Children animate in sequence. Stagger sets the gap between each; delay holds the whole group before it starts.",
  controls: [
    {
      kind: "slider",
      key: "count",
      label: "Children",
      hint: "How many items animate in.",
      min: 3,
      max: 12,
      step: 1,
    },
    {
      kind: "slider",
      key: "stagger",
      label: "Stagger",
      hint: "Gap between each child starting. Higher = more of a wave.",
      min: 0,
      max: 0.2,
      step: 0.01,
      unit: "s",
    },
    {
      kind: "slider",
      key: "delayChildren",
      label: "Delay",
      hint: "Pause before the whole group begins.",
      min: 0,
      max: 0.6,
      step: 0.05,
      unit: "s",
    },
    {
      kind: "select",
      key: "direction",
      label: "Direction",
      hint: "Order children fire in.",
      options: [
        { label: "Forward", value: "forward" },
        { label: "Reverse", value: "reverse" },
      ],
    },
  ],
  defaults: { count: 6, stagger: 0.06, delayChildren: 0, direction: "forward" },
  presets: [
    { name: "Tight", values: { stagger: 0.03, delayChildren: 0 } },
    { name: "Relaxed", values: { stagger: 0.08, delayChildren: 0.1 } },
    { name: "Dramatic", values: { stagger: 0.14, delayChildren: 0.2 } },
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
        text: 'Two named states. "hidden" is the start (invisible, small, nudged down), "show" is the end. Every child animates from hidden to show — you describe states, not steps.',
      },
      {
        code: `staggerChildren: ${st}`,
        text: `The gap between each child starting, in seconds. They don't all fire at once — child 2 waits ${st}s after child 1, and so on, making the wave.`,
      },
      {
        code: `delayChildren: ${dc}`,
        text: `How long the whole group waits before the first child starts. ${dc === 0 ? "0 = starts immediately." : `Here, ${dc}s of dead time up front.`}`,
      },
      {
        code: `${count} items, ${dir}`,
        text: `With ${count} children at ${st}s apart${dc ? ` after a ${dc}s delay` : ""}, the last one begins ${last}s in. ${dir === "reverse" ? "Reverse means the last child fires first." : "Forward fires them first-to-last."}`,
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
};

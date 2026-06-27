"use client";

import { motion, type Transition } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type PlaygroundItem, str, type Values } from "../core";

const FEEL: Record<string, Transition> = {
  Snappy: { type: "spring", stiffness: 500, damping: 30 },
  Smooth: { type: "spring", stiffness: 300, damping: 30 },
  Slow: { type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

function LayoutPreview({ values }: { values: Values; replayKey: number }) {
  const feel = FEEL[str(values, "feel", "Snappy")] ?? FEEL.Snappy;
  const [active, setActive] = useState(0);

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
      <div className="flex gap-1 rounded-full border border-border p-1.5">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="relative rounded-full px-5 py-2 text-sm"
          >
            {active === i ? (
              <motion.div
                layoutId="pg-layout-pill"
                transition={feel}
                className="absolute inset-0 rounded-full bg-primary"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 transition-colors",
                active === i ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Tab {i + 1}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">click a tab</p>
    </div>
  );
}

export const layoutItem: PlaygroundItem = {
  slug: "layout",
  label: "Layout",
  blurb:
    "A shared layoutId morphs one element into another when which one is mounted changes, so an indicator glides between positions instead of jumping.",
  controls: [
    {
      kind: "select",
      key: "feel",
      label: "Feel",
      hint: "The transition the pill travels with.",
      options: [
        { label: "Snappy", value: "Snappy" },
        { label: "Smooth", value: "Smooth" },
        { label: "Slow", value: "Slow" },
      ],
    },
  ],
  defaults: { feel: "Snappy" },
  presets: [],
  Preview: LayoutPreview,
  explain: (v) => {
    const feel = str(v, "feel", "Snappy");
    return [
      {
        code: 'layoutId="pill"',
        text: "The key idea. Only one pill is rendered — under the active tab. When you click another tab, React unmounts it here and mounts it there, but the shared layoutId tells Motion they're the same element, so it animates between the two positions instead of popping.",
      },
      {
        code: "active === i && <motion.div />",
        text: "The pill only exists inside the active tab. You don't compute any positions or offsets yourself — Motion measures the old and new spots and tweens the gap automatically.",
      },
      {
        code: `transition (${feel})`,
        text: `Controls how the pill travels. ${feel === "Slow" ? "A timed tween — same duration every move." : `A spring — ${feel === "Snappy" ? "stiff, so it snaps over quickly" : "softer, so it glides"}.`}`,
      },
    ];
  },
  toCode: (v) => {
    const feel = str(v, "feel", "Snappy");
    const t =
      feel === "Slow"
        ? '{ type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] }'
        : feel === "Smooth"
          ? '{ type: "spring", stiffness: 300, damping: 30 }'
          : '{ type: "spring", stiffness: 500, damping: 30 }';
    return `import { motion } from "motion/react";

export function Tabs({ active, setActive }) {
  return tabs.map((tab, i) => (
    <button key={tab} onClick={() => setActive(i)} className="relative">
      {active === i && (
        <motion.div
          layoutId="pill"
          transition={${t}}
          className="absolute inset-0 rounded-full bg-primary"
        />
      )}
      <span className="relative z-10">{tab}</span>
    </button>
  ));
}`;
  },
};

"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { num, type PlaygroundItem, str, type Values } from "../core";

function GesturesPreview({
  values,
  replayKey,
}: {
  values: Values;
  replayKey: number;
}) {
  const reduce = useReducedMotion();
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
        drag
      </motion.div>
    </div>
  );
}

export const gesturesItem: PlaygroundItem = {
  slug: "gestures",
  label: "Gestures",
  blurb:
    "Motion responds to pointer input. whileHover and whileTap animate to a state during the gesture; drag makes an element throwable.",
  controls: [
    {
      kind: "slider",
      key: "hover",
      label: "Hover scale",
      hint: "Size while the pointer is over it.",
      min: 1,
      max: 1.6,
      step: 0.05,
    },
    {
      kind: "slider",
      key: "tap",
      label: "Tap scale",
      hint: "Size while pressed. Under 1 = a press-in.",
      min: 0.6,
      max: 1,
      step: 0.05,
    },
    {
      kind: "select",
      key: "drag",
      label: "Drag",
      hint: "Constrain dragging to an axis, free, or off.",
      options: [
        { label: "Off", value: "off" },
        { label: "X only", value: "x" },
        { label: "Y only", value: "y" },
        { label: "Free", value: "free" },
      ],
    },
  ],
  defaults: { hover: 1.2, tap: 0.9, drag: "x" },
  presets: [
    { name: "Subtle", values: { hover: 1.1, tap: 0.95 } },
    { name: "Pop", values: { hover: 1.4, tap: 0.85 } },
  ],
  Preview: GesturesPreview,
  explain: (v) => {
    const hover = num(v, "hover", 1.2);
    const tap = num(v, "tap", 0.9);
    const mode = str(v, "drag", "x");
    return [
      {
        code: `whileHover={{ scale: ${hover} }}`,
        text: `While the pointer is over the box, animate to ${hover}× size (${Math.round(hover * 100)}%). It springs back to normal when the pointer leaves — no state or handlers needed.`,
      },
      {
        code: `whileTap={{ scale: ${tap} }}`,
        text: `While it's being pressed, go to ${tap}× size. ${tap < 1 ? "Under 1 = a press-in, the tactile feel of a real button." : "At 1 it stays put on press."}`,
      },
      {
        code: mode === "off" ? "drag={false}" : mode === "free" ? "drag" : `drag="${mode}"`,
        text:
          mode === "off"
            ? "Dragging is off."
            : `Makes the box draggable${mode === "free" ? " in any direction" : ` on the ${mode}-axis only`}. dragConstraints keeps it inside its parent, and it springs back if thrown past the edge.`,
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
};

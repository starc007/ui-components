"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { type PlaygroundItem, str, type Values } from "../core";

function ScrollPreview({ values }: { values: Values; replayKey: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const effect = str(values, "effect", "fade");

  // all mapped unconditionally (hooks rule); only the picked one is applied
  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [-70, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  const style = reduce
    ? undefined
    : effect === "scale"
      ? { scale }
      : effect === "slide"
        ? { x }
        : effect === "rotate"
          ? { rotate }
          : { opacity };

  return (
    <div className="min-h-[200px] w-full">
      <div
        ref={ref}
        className="relative h-52 overflow-y-auto rounded-xl border border-border"
      >
        <div className="h-[560px] px-4 pt-3">
          <p className="text-xs text-muted-foreground">scroll down ↓</p>
          <div className="sticky top-20 flex justify-center">
            <motion.div style={style} className="h-16 w-16 rounded-2xl bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const scrollItem: PlaygroundItem = {
  slug: "scroll",
  label: "Scroll",
  blurb:
    "Scroll-linked motion ties a value to scroll position. useScroll reports 0→1 progress; useTransform maps that range onto a transform.",
  controls: [
    {
      kind: "select",
      key: "effect",
      label: "Effect",
      hint: "What the box does as the panel scrolls.",
      options: [
        { label: "Fade", value: "fade" },
        { label: "Scale", value: "scale" },
        { label: "Slide", value: "slide" },
        { label: "Rotate", value: "rotate" },
      ],
    },
  ],
  defaults: { effect: "fade" },
  presets: [],
  Preview: ScrollPreview,
  explain: (v) => {
    const effect = str(v, "effect", "fade");
    const map: Record<string, { prop: string; range: string; start: string; end: string }> = {
      fade: { prop: "opacity", range: "[0.15, 1]", start: "15% visible", end: "fully visible" },
      scale: { prop: "scale", range: "[0.6, 1]", start: "60% size", end: "full size" },
      slide: { prop: "x", range: "[-70, 0]", start: "70px left", end: "in place" },
      rotate: { prop: "rotate", range: "[0, 180]", start: "0°", end: "180°" },
    };
    const m = map[effect] ?? map.fade;
    return [
      {
        code: "useScroll({ container: ref })",
        text: "Watches how far the panel is scrolled and gives back scrollYProgress: a number from 0 (scrolled to top) to 1 (scrolled to bottom). It updates on every scroll frame.",
      },
      {
        code: `useTransform(p, [0, 1], ${m.range})`,
        text: `Remaps that 0→1 progress onto a real value range. As progress goes 0→1, ${m.prop} goes ${m.range.replace(/[[\]]/g, "")} — so at the top it's ${m.start}, at the bottom ${m.end}.`,
      },
      {
        code: `style={{ ${m.prop} }}`,
        text: "The mapped value is a live motion value wired straight into the box's style, so it tracks your scroll exactly — scroll up and it runs in reverse.",
      },
    ];
  },
  toCode: (v) => {
    const effect = str(v, "effect", "fade");
    const map: Record<string, { prop: string; range: string }> = {
      fade: { prop: "opacity", range: "[0.15, 1]" },
      scale: { prop: "scale", range: "[0.6, 1]" },
      slide: { prop: "x", range: "[-70, 0]" },
      rotate: { prop: "rotate", range: "[0, 180]" },
    };
    const m = map[effect] ?? map.fade;
    return `import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function Demo() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const ${m.prop} = useTransform(scrollYProgress, [0, 1], ${m.range});

  return (
    <div ref={ref} className="overflow-y-auto">
      <motion.div style={{ ${m.prop} }} />
    </div>
  );
}`;
  },
};

"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { type PlaygroundItem, type PlaygroundT, str, type Values } from "../core";

function ScrollPreview({ values }: { values: Values; replayKey: number }) {
  const reduce = useReducedMotion();
  const t = useTranslations("Pages.playground.scroll");
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
          <p className="text-xs text-muted-foreground">{t("scrollDown")}</p>
          <div className="sticky top-20 flex justify-center">
            <motion.div style={style} className="h-16 w-16 rounded-2xl bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const scrollItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "scroll",
  label: t("scroll.label"),
  blurb: t("scroll.blurb"),
  controls: [
    {
      kind: "select",
      key: "effect",
      label: t("scroll.controls.effect.label"),
      hint: t("scroll.controls.effect.hint"),
      options: [
        { label: t("scroll.controls.effect.fade"), value: "fade" },
        { label: t("scroll.controls.effect.scale"), value: "scale" },
        { label: t("scroll.controls.effect.slide"), value: "slide" },
        { label: t("scroll.controls.effect.rotate"), value: "rotate" },
      ],
    },
  ],
  defaults: { effect: "fade" },
  presets: [],
  Preview: ScrollPreview,
  explain: (v) => {
    const effect = str(v, "effect", "fade");
    const map: Record<string, { prop: string; range: string; start: string; end: string }> = {
      fade: { prop: "opacity", range: "[0.15, 1]", start: t("scroll.range.fadeStart"), end: t("scroll.range.fadeEnd") },
      scale: { prop: "scale", range: "[0.6, 1]", start: t("scroll.range.scaleStart"), end: t("scroll.range.scaleEnd") },
      slide: { prop: "x", range: "[-70, 0]", start: t("scroll.range.slideStart"), end: t("scroll.range.slideEnd") },
      rotate: { prop: "rotate", range: "[0, 180]", start: t("scroll.range.rotateStart"), end: t("scroll.range.rotateEnd") },
    };
    const m = map[effect] ?? map.fade;
    return [
      {
        code: "useScroll({ container: ref })",
        text: t("scroll.explain.useScroll"),
      },
      {
        code: `useTransform(p, [0, 1], ${m.range})`,
        text: t("scroll.explain.useTransform", {
          prop: m.prop,
          range: m.range.replace(/[[\]]/g, ""),
          start: m.start,
          end: m.end,
        }),
      },
      {
        code: `style={{ ${m.prop} }}`,
        text: t("scroll.explain.style"),
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
});

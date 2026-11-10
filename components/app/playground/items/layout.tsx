"use client";

import { motion, type Transition } from "motion/react";
import { useTranslations } from "use-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type PlaygroundItem, type PlaygroundT, str, type Values } from "../core";

const FEEL: Record<string, Transition> = {
  Snappy: { type: "spring", stiffness: 500, damping: 30 },
  Smooth: { type: "spring", stiffness: 300, damping: 30 },
  Slow: { type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

function LayoutPreview({ values }: { values: Values; replayKey: number }) {
  const feel = FEEL[str(values, "feel", "Snappy")] ?? FEEL.Snappy;
  const [active, setActive] = useState(0);
  const t = useTranslations("Pages.playground.layout");

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
              {t("tab", { index: i + 1 })}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t("clickTab")}</p>
    </div>
  );
}

export const layoutItem = (t: PlaygroundT): PlaygroundItem => ({
  slug: "layout",
  label: t("layout.label"),
  blurb: t("layout.blurb"),
  controls: [
    {
      kind: "select",
      key: "feel",
      label: t("layout.controls.feel.label"),
      hint: t("layout.controls.feel.hint"),
      options: [
        { label: t("layout.controls.feel.snappy"), value: "Snappy" },
        { label: t("layout.controls.feel.smooth"), value: "Smooth" },
        { label: t("layout.controls.feel.slow"), value: "Slow" },
      ],
    },
  ],
  defaults: { feel: "Snappy" },
  presets: [],
  Preview: LayoutPreview,
  explain: (v) => {
    const feel = str(v, "feel", "Snappy");
    const feelLabel =
      feel === "Slow"
        ? t("layout.controls.feel.slow")
        : feel === "Smooth"
          ? t("layout.controls.feel.smooth")
          : t("layout.controls.feel.snappy");
    return [
      {
        code: 'layoutId="pill"',
        text: t("layout.explain.layoutId"),
      },
      {
        code: "active === i && <motion.div />",
        text: t("layout.explain.conditional"),
      },
      {
        code: t("layout.explain.transitionCode", { feel: feelLabel }),
        text: t("layout.explain.transition", { feel }),
      },
    ];
  },
  toCode: (v) => {
    const feel = str(v, "feel", "Snappy");
    const transition =
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
          transition={${transition}}
          className="absolute inset-0 rounded-full bg-primary"
        />
      )}
      <span className="relative z-10">{tab}</span>
    </button>
  ));
}`;
  },
});

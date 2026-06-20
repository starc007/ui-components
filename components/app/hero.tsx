"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { GithubIcon } from "@/components/app/icons";
import { PressLink } from "@/components/app/press-link";
import { TextReveal } from "@/components/motion/text-reveal";
import { DynamicIslandPreview } from "@/components/previews/blocks/dynamic-island.preview";
import { OverflowActionsPreview } from "@/components/previews/blocks/overflow-actions.preview";
import { ExpandableTabsPreview } from "@/components/previews/blocks/expandable-tabs.preview";

const HEADLINE = ["Motion", "components", "for React."];
const HEADLINE_WORDS = HEADLINE.reduce((n, l) => n + l.split(" ").length, 0);
const STAGGER = 0.09;
const START = 0.12;

export function Hero() {
  const headlineEnd = START + HEADLINE_WORDS * STAGGER;
  const subDelay = headlineEnd + 0.05;
  const ctaDelay = subDelay + 0.25;
  const demoDelay = ctaDelay + 0.1;

  return (
    <div className="mx-auto max-w-5xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.05 }}
        className="flex justify-center"
      >
        <PressLink
          href="https://github.com/starc007/ui-components"
          target="_blank"
          rel="noreferrer noopener"
          className="group mb-7 inline-flex min-h-9 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 text-xs font-medium text-(--color-fg) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-(--color-accent)" />
          Tailwind 4 + React 19
          <ArrowUpRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </PressLink>
      </motion.div>

      <TextReveal
        as="h1"
        text={HEADLINE}
        delay={START}
        stagger={STAGGER}
        className="mx-auto font-pixel text-5xl font-medium leading-[0.9] text-(--color-fg) sm:text-6xl md:text-7xl"
      />

      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: subDelay }}
        className="mx-auto mt-6 max-w-sm text-pretty text-base leading-7 text-(--color-fg-muted)"
      >
        Copy-ready components with clean motion.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: ctaDelay }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <PressLink
          href="/components/motion"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-(--color-fg) px-6 text-sm font-medium text-(--color-bg) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
        >
          Browse components
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </PressLink>
        <PressLink
          href="https://github.com/starc007/ui-components"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-6 text-sm font-medium text-(--color-fg) hover:border-(--color-border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
        >
          <GithubIcon className="h-4 w-4" />
          GitHub
        </PressLink>
      </motion.div>

      {/* Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE_OUT, delay: demoDelay }}
        className="mt-14 overflow-hidden rounded-2xl border border-(--color-border)"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 10% 50%, color-mix(in srgb, #7c3aed 18%, transparent), transparent 70%), radial-gradient(ellipse 50% 70% at 90% 20%, color-mix(in srgb, #0ea5e9 14%, transparent), transparent 65%), radial-gradient(ellipse 40% 60% at 60% 90%, color-mix(in srgb, #f59e0b 10%, transparent), transparent 60%), var(--color-bg)",
        }}
      >
        {/* Top row: Dynamic Island (wide) + Overflow Actions */}
        <div className="grid h-[260px] grid-cols-[1fr_260px] border-b border-(--color-border)">
          <div className="overflow-hidden border-r border-(--color-border) p-6">
            <DynamicIslandPreview />
          </div>
          <div className="flex items-center justify-center overflow-hidden p-6">
            <OverflowActionsPreview />
          </div>
        </div>

        {/* Bottom row: Expandable Tabs full width */}
        <div className="relative h-[200px] overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0">
            <ExpandableTabsPreview />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

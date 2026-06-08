"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { GithubIcon } from "@/components/app/icons";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { StatefulButton } from "@/components/motion/button";
import { Switch } from "@/components/motion/switch";
import { TextReveal } from "@/components/motion/text-reveal";

const HEADLINE = ["Motion", "components", "for React."];
const HEADLINE_WORDS = HEADLINE.reduce((n, l) => n + l.split(" ").length, 0);
const STAGGER = 0.09;
const START = 0.12;
const SAMPLE_INTERVAL_MS = 2600;

export function Hero() {
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const headlineEnd = START + HEADLINE_WORDS * STAGGER;
  const subDelay = headlineEnd + 0.05;
  const ctaDelay = subDelay + 0.25;
  const samples = [
    {
      id: "button",
      file: "motion/button.tsx",
      code: `<StatefulButton state="success">
  Save changes
</StatefulButton>`,
      label: "Stateful button",
      detail: "Success state",
      preview: (
        <StatefulButton state="success" size="md" successText="Saved">
          Save
        </StatefulButton>
      ),
    },
    {
      id: "switch",
      file: "motion/switch.tsx",
      code: `<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
/>`,
      label: "Switch",
      detail: "Spring thumb",
      preview: (
        <Switch checked={motionEnabled} onCheckedChange={setMotionEnabled} />
      ),
    },
    {
      id: "badge",
      file: "motion/badge.tsx",
      code: `<AnimatedBadge status="success">
  Ready
</AnimatedBadge>`,
      label: "Animated badge",
      detail: "Registry install",
      preview: (
        <AnimatedBadge status="success" size="md" pulse={false}>
          Ready
        </AnimatedBadge>
      ),
    },
  ];
  const activeSample = samples[activeSampleIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSampleIndex((index) => (index + 1) % samples.length);
    }, SAMPLE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [samples.length]);

  return (
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="group mb-7 inline-flex min-h-10 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 text-xs font-medium text-(--color-fg) press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-accent)" />
            Tailwind 4 + React 19
            <ArrowUpRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        <TextReveal
          as="h1"
          text={HEADLINE}
          delay={START}
          stagger={STAGGER}
          className="max-w-5xl font-pixel text-[3.2rem] font-medium leading-[0.86] text-(--color-fg) sm:text-7xl md:text-8xl lg:text-[8.5rem]"
        />

        <motion.p
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: subDelay }}
          className="mt-7 max-w-md text-pretty text-base leading-7 text-(--color-fg-muted)"
        >
          Copy-ready components with clean motion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: ctaDelay }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/components/motion"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-(--color-fg) px-6 text-sm font-medium text-(--color-bg) press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
          >
            Browse components
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-6 text-sm font-medium text-(--color-fg) press hover:border-(--color-border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: ctaDelay + 0.1 }}
        className="hidden h-[400px] overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-elev) lg:block"
      >
        <div className="flex h-12 items-center justify-between border-b border-(--color-border) bg-(--color-bg) px-4">
          <p className="font-pixel text-[11px] font-medium text-(--color-fg-muted)">
            Component asset
          </p>
          <AnimatedBadge status="neutral" size="sm" pulse={false}>
            {String(activeSampleIndex + 1).padStart(2, "0")} / {samples.length}
          </AnimatedBadge>
        </div>

        <div className="h-32 border-b border-(--color-border) bg-(--color-bg) p-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeSample.id}-code`}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mb-2 font-mono text-[11px] text-(--color-fg-muted)">
                {activeSample.file}
              </p>
              <pre className="overflow-hidden font-mono text-[11px] leading-4 text-(--color-fg-muted)">
                <code>{activeSample.code}</code>
              </pre>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="h-40 p-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeSample.id}-preview`}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-[136px] items-center justify-between rounded-md border border-(--color-border) bg-(--color-bg) p-4"
            >
              <div>
                <p className="font-mono text-[11px] text-(--color-fg-muted)">
                  {activeSample.id}.tsx
                </p>
                <p className="mt-1 font-pixel text-sm font-medium text-(--color-fg)">
                  {activeSample.label}
                </p>
                <p className="mt-1 text-xs text-(--color-fg-muted)">
                  {activeSample.detail}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-end">
                {activeSample.preview}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid h-16 grid-cols-3 gap-px border-t border-(--color-border) bg-(--color-border)">
          {samples.map((sample, index) => (
            <div
              key={sample.id}
              className={
                index === activeSampleIndex
                  ? "bg-(--color-bg) px-3 py-2"
                  : "bg-(--color-bg-elev) px-3 py-2"
              }
            >
              <p className="font-mono text-[10px] text-(--color-fg-muted)">
                asset
              </p>
              <p className="mt-1 truncate text-xs font-medium text-(--color-fg)">
                {sample.id}.tsx
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

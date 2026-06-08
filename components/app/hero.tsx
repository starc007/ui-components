"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { GithubIcon } from "@/components/app/icons";
import { TextReveal } from "@/components/motion/text-reveal";

const HEADLINE = ["Motion", "components", "for React."];
const HEADLINE_WORDS = HEADLINE.reduce((n, l) => n + l.split(" ").length, 0);
const STAGGER = 0.09;
const START = 0.12;

export function Hero() {
  const headlineEnd = START + HEADLINE_WORDS * STAGGER;
  const subDelay = headlineEnd + 0.05;
  const ctaDelay = subDelay + 0.25;

  return (
    <div className="mx-auto max-w-7xl">
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
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { GithubIcon } from "@/components/app/icons";
import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";

const HEADLINE = ["Motion components", "that don't suck."];
const HEADLINE_WORDS = HEADLINE.reduce((n, l) => n + l.split(" ").length, 0);
const STAGGER = 0.09;
const START = 0.12;

export function Hero() {
  const headlineEnd = START + HEADLINE_WORDS * STAGGER;
  const subDelay = headlineEnd + 0.05;
  const ctaDelay = subDelay + 0.25;

  return (
    <div className="mx-auto max-w-5xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="https://github.com/starc007/ui-components"
          target="_blank"
          rel="noreferrer noopener"
          className="group mb-7 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg) press"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-(--color-fg)" />
          v2 is live. Built on Tailwind 4, React 19
          <ArrowUpRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </motion.div>

      <TextReveal
        as="h1"
        text={HEADLINE}
        delay={START}
        stagger={STAGGER}
        className="text-balance text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.045em] text-(--color-fg) sm:text-6xl md:text-6xl lg:text-[4.5rem]"
      />

      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: subDelay }}
        className="mx-auto mt-7 max-w-2xl text-pretty text-base text-(--color-fg-muted) md:text-lg"
      >
        Interactions worth shipping.{" "}
        <span className="text-(--color-fg)">No Radix, no shadcn. Just motion.</span>{" "}
        Copy, paste, done.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: ctaDelay }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <Magnetic strength={0.2}>
          <Link
            href="/components/motion"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-(--color-fg) px-6 text-sm font-medium text-(--color-bg) press"
          >
            Browse components
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Magnetic>
        <Link
          href="https://github.com/starc007/ui-components"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-6 text-sm font-medium text-(--color-fg) press hover:border-(--color-border-strong)"
        >
          <GithubIcon className="h-4 w-4" />
          Star on GitHub
        </Link>
      </motion.div>
    </div>
  );
}

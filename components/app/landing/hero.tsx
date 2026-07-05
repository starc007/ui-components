"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";
import { PressLink } from "@/components/app/press-link";
import { TextReveal } from "@/components/motion/text-reveal";
import { INSTALLABLE_COUNT } from "@/lib/registry";

const HEADLINE = ["The motion toolkit", "for React & Next.js"];
const HEADLINE_WORDS = HEADLINE.reduce((n, l) => n + l.split(" ").length, 0);
const STAGGER = 0.09;
const START = 0.12;

export function Hero() {
  const headlineEnd = START + HEADLINE_WORDS * STAGGER;
  const subDelay = headlineEnd + 0.05;
  const ctaDelay = subDelay + 0.25;

  return (
    <div className="mx-auto max-w-7xl text-center">
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
          className="group mb-7 inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {INSTALLABLE_COUNT} components · Tailwind 4 + React 19
          <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </PressLink>
      </motion.div>

      <TextReveal
        as="h1"
        text={HEADLINE}
        delay={START}
        stagger={STAGGER}
        className="mx-auto font-pixel text-5xl font-medium leading-[0.9] text-foreground sm:text-6xl md:text-7xl"
      />

      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: subDelay }}
        className="mx-auto mt-6 max-w-md text-pretty text-base leading-7 text-muted-foreground"
      >
        Copy-paste animated components built on Framer Motion and Tailwind. Free
        and open source.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: ctaDelay }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <PressLink
          href="/components/motion"
          className="group inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Browse components
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </PressLink>
        <PressLink
          href="https://pro.beui.dev"
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex h-10 items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-accent hover:border-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Explore Pro
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </PressLink>
      </motion.div>
    </div>
  );
}

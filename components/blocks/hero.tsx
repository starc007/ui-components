"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface HeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

export function Hero({
  eyebrow = "v2 is live",
  title,
  highlight,
  description,
  primaryCta,
  secondaryCta,
  className,
}: HeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden px-4 py-24 md:py-32", className)}>
      <div className="absolute inset-0 -z-10 grid-noise mask-radial-fade opacity-60" />
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-accent) 60%, transparent), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg-muted)"
          >
            <Sparkles className="h-3 w-3 text-(--color-accent)" />
            {eyebrow}
          </motion.div>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-balance text-4xl font-semibold tracking-tight text-(--color-fg) md:text-6xl lg:text-7xl"
        >
          {title}{" "}
          {highlight ? (
            <span className="bg-gradient-to-br from-(--color-accent) via-(--color-violet) to-(--color-neon) bg-clip-text text-transparent">
              {highlight}
            </span>
          ) : null}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base text-(--color-fg-muted) md:text-lg"
        >
          {description}
        </motion.p>

        {primaryCta || secondaryCta ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            {primaryCta ? (
              <Link
                href={primaryCta.href}
                className="group inline-flex h-11 items-center gap-2 rounded-lg bg-(--color-fg) px-5 text-sm font-medium text-(--color-bg) transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex h-11 items-center rounded-lg border border-(--color-border) bg-(--color-bg-elev) px-5 text-sm font-medium text-(--color-fg) transition-colors hover:border-(--color-border-strong)"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

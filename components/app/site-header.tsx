"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { GithubIcon } from "@/components/app/icons";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 8);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-(--color-border) bg-(--color-bg)/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-(--color-fg)"
        >
          <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-lg border border-(--color-border-strong) bg-(--color-fg) shadow-[0_1px_0_0_rgb(255_255_255/0.08)_inset]">
            <motion.span
              aria-hidden
              className="absolute inset-1 rounded-md bg-(--color-bg)"
              animate={{ opacity: [0.95, 0.7, 0.95] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-2 rounded-sm bg-(--color-fg)"
              animate={{ scale: [0.85, 1, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          <span>beUI</span>
          <span className="hidden rounded-full border border-(--color-border) bg-(--color-bg-elev) px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-(--color-fg-muted) sm:inline-block">
            v2
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/docs/ai-agents"
            className="group hidden items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg) press hover:border-(--color-border-strong) sm:inline-flex"
          >
            <Sparkles className="h-3 w-3 text-(--color-fg-muted) transition-colors group-hover:text-(--color-fg)" />
            For AI agents
            <ArrowUpRight className="h-3 w-3 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href="/llms.txt"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono text-(--color-fg-muted) hover:text-(--color-fg) md:inline-flex"
          >
            llms.txt
          </Link>

          <a
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-bg-elev) px-3 py-1 text-xs font-medium text-(--color-fg) press hover:border-(--color-border-strong)"
            aria-label="Star on GitHub"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Star</span>
            <span className="inline-flex items-center gap-0.5 text-(--color-fg-muted)">
              <Star className="h-3 w-3" />
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { GithubIcon } from "@/components/app/icons";
import { MobileNav } from "@/components/app/mobile-nav";
import { PressLink } from "@/components/app/press-link";
import { cn } from "@/lib/utils";

function formatStarCount(count: number) {
  return new Intl.NumberFormat("en-US", {
    notation: count >= 1000 ? "compact" : "standard",
    maximumFractionDigits: count >= 1000 && count < 10000 ? 1 : 0,
  }).format(count);
}

export function SiteHeader({
  githubStarCount,
}: {
  githubStarCount: number | null;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const formattedStarCount =
    typeof githubStarCount === "number"
      ? formatStarCount(githubStarCount)
      : null;

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
        <div className="flex items-center gap-1.5">
          <MobileNav />
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-(--color-fg)"
          >
            <Image
              src="/beui-mark.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              className="h-6 w-6 rounded-lg"
            />
            <span>beUI</span>
            <span className="hidden rounded-full border border-(--color-border) bg-(--color-bg-elev) px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-(--color-fg-muted) sm:inline-block">
              v2
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          <PressLink
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1.5 rounded-2xl border border-(--color-border) bg-(--color-bg-elev)/20 px-3 py-2 text-xs font-medium text-(--color-fg) hover:border-(--color-border-strong)"
            aria-label={
              formattedStarCount
                ? `Star on GitHub, ${formattedStarCount} stars`
                : "Star on GitHub"
            }
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Star</span>
            <span className="inline-flex items-center gap-0.5 text-(--color-fg-muted)">
              <Star className="h-3 w-3" />
              {formattedStarCount ? <span>{formattedStarCount}</span> : null}
            </span>
          </PressLink>

          <PressLink
            href="/components/motion"
            className="group inline-flex items-center gap-1.5 rounded-2xl bg-(--color-fg) px-3 py-2 text-xs font-medium text-(--color-bg) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
          >
            Browse
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </PressLink>
        </nav>
      </div>
    </header>
  );
}

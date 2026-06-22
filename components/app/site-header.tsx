"use client";

import Link from "next/link";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Star } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { GithubIcon } from "@/components/app/icons";
import { MobileNav } from "@/components/app/mobile-nav";
import { PressLink } from "@/components/app/press-link";
import { SiteSearch } from "@/components/app/site-search";
import { cn } from "@/lib/utils";

function formatStarCount(count: number) {
  if (count >= 1000) {
    const val = Math.round(count / 100) / 10;
    return `${val}k`;
  }
  return String(count);
}

export function SiteHeader({
  githubStarCount,
}: {
  githubStarCount: number | null;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isComponents =
    pathname.startsWith("/components/motion") ||
    (pathname.startsWith("/components") &&
      !pathname.startsWith("/components/blocks"));
  const isBlocks = pathname.startsWith("/components/blocks");
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
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
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
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            <Link
              href="/components/motion"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isComponents
                  ? "text-(--color-fg)"
                  : "text-(--color-fg-muted) hover:text-(--color-fg)",
              )}
            >
              Components
            </Link>
            <Link
              href="/components/blocks"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isBlocks
                  ? "text-(--color-fg)"
                  : "text-(--color-fg-muted) hover:text-(--color-fg)",
              )}
            >
              Blocks
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-2">
          <SiteSearch className="w-9 justify-center px-0 sm:w-44 sm:justify-start sm:px-3 lg:w-56" />
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
            <span className="hidden sm:inline">Github</span>
            <span className="inline-flex items-center gap-0.5 text-(--color-fg-muted)">
              <Star className="h-3 w-3" />
              {formattedStarCount ? <span>{formattedStarCount}</span> : null}
            </span>
          </PressLink>
        </nav>
      </div>
    </header>
  );
}

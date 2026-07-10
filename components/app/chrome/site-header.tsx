"use client";

import { ArrowUpRight, Star, SwatchBook } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GithubIcon } from "@/components/app/icons";
import { MobileNav } from "@/components/app/chrome/mobile-nav";
import { usePreferences } from "@/components/app/preferences/preferences-provider";
import { PressLink } from "@/components/app/press-link";
import { RainbowCta } from "@/components/app/rainbow-cta";
import { SiteSearch } from "@/components/app/chrome/site-search";
import { Tooltip } from "@/components/motion/tooltip";
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
  const { setPanelOpen } = usePreferences();
  const pathname = usePathname();
  const isComponents =
    pathname.startsWith("/components/motion") ||
    (pathname.startsWith("/components") &&
      !pathname.startsWith("/components/blocks"));
  const isBlocks = pathname.startsWith("/components/blocks");
  const isComponentsRoute = pathname.startsWith("/components");
  const isPlayground = pathname.startsWith("/playground");
  const isSponsors = pathname.startsWith("/sponsors");
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
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "relative flex h-14 items-center justify-between gap-4",
          isComponentsRoute
            ? "w-full px-4 md:px-6 xl:px-8"
            : "mx-auto max-w-7xl px-4",
        )}
      >
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground"
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
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Components
            </Link>
            <Link
              href="/components/blocks"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isBlocks
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Blocks
            </Link>
            <Link
              href="/playground"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isPlayground
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Playground
            </Link>
            <Link
              href="/sponsors"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isSponsors
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sponsors
            </Link>
            <RainbowCta
              href="https://pro.beui.dev"
              target="_blank"
              rel="noreferrer noopener"
              shape="pill"
              className="ml-1 min-h-8 text-xs"
              innerClassName="bg-background px-3 text-foreground group-hover:bg-card"
            >
              Pro
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </RainbowCta>
          </nav>
        </div>

        <nav className="flex items-center gap-2">
          <SiteSearch className="w-9 justify-center px-0 sm:w-44 sm:justify-start sm:px-3 lg:w-56" />
          <RainbowCta
            href="https://pro.beui.dev"
            target="_blank"
            rel="noreferrer noopener"
            shape="pill"
            className="min-h-9 text-xs md:hidden"
            innerClassName="bg-background px-3 text-foreground group-hover:bg-card"
          >
            Pro
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </RainbowCta>
          <Tooltip content="Customize" side="bottom">
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              aria-label="Customize theme"
              className="hidden h-9 w-9 items-center justify-center rounded-2xl border border-border bg-card/20 text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <SwatchBook className="h-4 w-4" />
            </button>
          </Tooltip>
          <PressLink
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card/20 px-3 py-2 text-xs font-medium text-foreground hover:border-(--color-border-strong)"
            aria-label={
              formattedStarCount
                ? `Star on GitHub, ${formattedStarCount} stars`
                : "Star on GitHub"
            }
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Github</span>
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <Star className="h-3 w-3" />
              {formattedStarCount ? <span>{formattedStarCount}</span> : null}
            </span>
          </PressLink>
        </nav>
      </div>
    </header>
  );
}

"use client";

import { ArrowUpRight } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useTranslations } from "use-intl";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/app/chrome/mobile-nav";
import { SiteSearch } from "@/components/app/chrome/site-search";
import { ThemeToggle } from "@/components/app/chrome/theme-toggle";
import { DiwaliMark } from "@/components/app/diwali-mark";
import { DiwaliRockets } from "@/components/app/diwali-rockets";
import { GithubIcon } from "@/components/app/icons";
import { PressLink } from "@/components/app/press-link";
import { RainbowCta } from "@/components/app/rainbow-cta";
import { Link, usePathname } from "@/lib/navigation";
import {
  categoryPath,
  hasSiteSidebar,
  isNativePath,
  NATIVE_PATH,
  TOP_LEVEL_CATEGORIES,
  topLevelCategory,
} from "@/lib/component-paths";
import { cn } from "@/lib/utils";

function formatStarCount(count: number) {
  if (count >= 1000) {
    const val = Math.round(count / 100) / 10;
    return `${val}k`;
  }
  return String(count);
}

export function SiteHeader() {
  const t = useTranslations("Chrome.header");
  const [githubStarCount, setGithubStarCount] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github-stars", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (Number.isSafeInteger(data.count) && data.count >= 0) {
          setGithubStarCount(data.count);
        }
      })
      .catch(() => { /* The GitHub link remains usable when the count is unavailable. */ });
    return () => controller.abort();
  }, []);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [markHovered, setMarkHovered] = useState(false);
  const [rocketLaunches, setRocketLaunches] = useState(0);
  const pathname = usePathname();
  const sidebarPage = hasSiteSidebar(pathname);
  const isComponents = pathname.startsWith("/components/motion");
  const isBlocks = pathname.startsWith("/components/blocks");
  const isAgents = pathname.startsWith("/components/agents");
  const section = topLevelCategory(pathname);
  const isNative = isNativePath(pathname);
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
        "sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="relative flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setMarkHovered(true);
            }}
            onPointerLeave={() => setMarkHovered(false)}
            onFocus={(e) => setMarkHovered(e.currentTarget.matches(":focus-visible"))}
            onBlur={() => setMarkHovered(false)}
            onClick={() => setRocketLaunches((n) => n + 1)}
          >
            <DiwaliMark hovered={markHovered} className="h-6 w-6" />
            <span>beUI</span>
          </Link>
          <DiwaliRockets launches={rocketLaunches} />
          <nav className={cn("hidden items-center gap-0.5", sidebarPage ? "md:flex" : "xl:flex")}>
            <Link
              href="/components/motion"
              className={cn(
                "rounded-md px-1.5 py-1.5 text-sm transition-colors lg:px-3",
                section ? "inline-flex" : "hidden xl:inline-flex",
                isComponents
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("components")}
            </Link>
            <Link
              href="/components/blocks"
              className={cn(
                "hidden rounded-md px-1.5 py-1.5 text-sm transition-colors lg:px-3 xl:inline-flex",
                isBlocks
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("blocks")}
            </Link>
            <Link
              href="/components/agents"
              className={cn(
                "hidden rounded-md px-1.5 py-1.5 text-sm transition-colors lg:px-3 xl:inline-flex",
                isAgents
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("agents")}
            </Link>
            {/* Each section's link hides below xl on its own pages, where
                Components takes its place, so the other section stays one click away. */}
            {TOP_LEVEL_CATEGORIES.map((slug) => (
              <Link
                key={slug}
                href={categoryPath(slug)}
                className={cn(
                  "rounded-md px-1.5 py-1.5 text-sm transition-colors lg:px-3",
                  section === slug ? "hidden xl:inline-flex" : "inline-flex",
                  section === slug
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(slug as "charts" | "casino")}
              </Link>
            ))}
            <Link
              href={NATIVE_PATH}
              className={cn(
                "inline-flex rounded-md px-1.5 py-1.5 text-sm whitespace-nowrap transition-colors lg:px-3",
                isNative
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              React Native
            </Link>
            <Link
              href="/playground"
              className={cn(
                "rounded-md px-1.5 py-1.5 text-sm transition-colors lg:px-3",
                isPlayground
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("playground")}
            </Link>
            <Link
              href="/sponsors"
              // From 2xl only, to leave room for Charts and Casino; the footer links it too.
              className={cn(
                "hidden rounded-md px-1.5 py-1.5 text-sm transition-colors lg:px-3 2xl:inline-flex",
                isSponsors
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("sponsors")}
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-2">
          <SiteSearch className="w-9 shrink-0 justify-center px-0 lg:w-48 lg:justify-start lg:px-3 xl:w-60 [&>span]:hidden lg:[&>span]:block [&>kbd]:hidden lg:[&>kbd]:inline-block" />
          <ThemeToggle />
          <PressLink
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            className="group hidden items-center gap-1.5 rounded-full lg:inline-flex border border-border bg-card/20 px-3 py-2 text-xs font-medium text-foreground hover:border-(--color-border-strong)"
            aria-label={
              formattedStarCount
                ? t("starOnGithubCount", { count: formattedStarCount })
                : t("starOnGithub")
            }
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              {formattedStarCount ? <span>{formattedStarCount}</span> : null}
            </span>
          </PressLink>
          <RainbowCta
            href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=navbar"
            target="_blank"
            rel="noreferrer noopener"
            shape="pill"
            className="hidden min-h-9 text-xs sm:inline-flex"
            innerClassName="whitespace-nowrap bg-foreground px-3 text-background sm:px-3.5"
          >
            {t("getPro")}
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </RainbowCta>
        </nav>
      </div>
    </header>
  );
}

"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useTranslations } from "use-intl";
import { useEffect, useState } from "react";
import { HeaderNav } from "@/components/app/chrome/header-nav";
import { MobileNav } from "@/components/app/chrome/mobile-nav";
import { SiteSearch } from "@/components/app/chrome/site-search";
import { SoundToggle } from "@/components/app/chrome/sound-toggle";
import { ThemeToggle } from "@/components/app/chrome/theme-toggle";
import { GithubIcon } from "@/components/app/icons";
import { PressLink } from "@/components/app/press-link";
import { ProCta } from "@/components/app/pro-cta";
import { GITHUB_STARS_PATH } from "@/lib/github";
import { Link, usePathname } from "@/lib/navigation";
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
    // A static file from the build, so a page view never runs the Worker.
    fetch(GITHUB_STARS_PATH, { signal: controller.signal })
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
  const pathname = usePathname();
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
            className="group flex items-center gap-2.5 text-sm font-medium tracking-tight text-foreground"
          >
            <img
              src="/beui-mark.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-lg"
            />
            <span>beUI</span>
          </Link>
          <HeaderNav pathname={pathname} />
        </div>

        <nav className="flex items-center gap-2">
          <SiteSearch className="w-9 shrink-0 justify-center px-0 lg:w-48 lg:justify-start lg:pr-[5px] lg:pl-3 xl:w-60 [&>span]:hidden lg:[&>span]:block [&>kbd]:hidden lg:[&>kbd]:inline-flex" />
          <SoundToggle />
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
          <ProCta
            href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=navbar"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden min-h-9 whitespace-nowrap text-xs sm:inline-flex"
          >
            {t("getPro")}
          </ProCta>
        </nav>
      </div>
    </header>
  );
}

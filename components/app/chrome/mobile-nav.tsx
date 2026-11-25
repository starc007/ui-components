"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "use-intl";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { SidebarNav } from "@/components/app/chrome/site-sidebar";
import { Button } from "@/components/motion/button";
import { Drawer } from "@/components/motion/drawer";
import { Tooltip } from "@/components/motion/tooltip";
import {
  categoryPath,
  hasPlatformSwitch,
  hasSiteSidebar,
  isNativePath,
  NATIVE_PATH,
  TOP_LEVEL_CATEGORIES,
  topLevelCategory,
} from "@/lib/component-paths";
import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Section = { href: string; label: string; active: boolean };

/** Mobile nav: a header hamburger that opens the site navigation in a drawer from the left. */
export function MobileNav() {
  const t = useTranslations("Chrome");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const sidebarPage = hasSiteSidebar(pathname);
  const platformSwitch = hasPlatformSwitch(pathname);

  useEffect(() => setMounted(true), []);

  // Covers navigation that doesn't go through a drawer link (back/forward).
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger — close the drawer on any route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia(sidebarPage ? "(min-width: 768px)" : "(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open, sidebarPage]);

  const sections: Section[] = [
    {
      href: "/components/motion",
      label: t("header.components"),
      active: pathname.startsWith("/components/motion"),
    },
    {
      href: "/components/blocks",
      label: t("header.blocks"),
      active: pathname.startsWith("/components/blocks"),
    },
    {
      href: "/components/agents",
      label: t("header.agents"),
      active: pathname.startsWith("/components/agents"),
    },
    ...TOP_LEVEL_CATEGORIES.map((slug) => ({
      href: categoryPath(slug),
      label: t(`header.${slug as "charts" | "casino" | "micro-interactions" | "sounds"}`),
      active: topLevelCategory(pathname) === slug,
    })),
    // The platform switch above the list already leads there.
    ...(platformSwitch
      ? []
      : [{ href: NATIVE_PATH, label: "React Native", active: isNativePath(pathname) }]),
    { href: "/playground", label: t("header.playground"), active: pathname.startsWith("/playground") },
    { href: "/themes", label: t("header.themes"), active: pathname.startsWith("/themes") },
    { href: "/sponsors", label: t("header.sponsors"), active: pathname.startsWith("/sponsors") },
  ];

  const close = () => setOpen(false);

  return (
    <div className={sidebarPage ? "md:hidden" : "xl:hidden"}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen(true)}
        aria-label={t("mobileNav.open")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {/* Portalled: the scrolled header's backdrop blur would otherwise
          become the containing block of the drawer's fixed layers. */}
      {mounted
        ? createPortal(
            <Drawer
              side="left"
              open={open}
              onOpenChange={setOpen}
              ariaLabel={t("mobileNav.title")}
              className="w-72 shadow-none"
            >
              <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
                <Link
                  href="/"
                  onClick={close}
                  className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-foreground"
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
                <Tooltip content={t("mobileNav.close")} side="bottom">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={close}
                    aria-label={t("mobileNav.close")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-8">
                {/* The list below follows the platform, so pick it here too. */}
                {platformSwitch ? (
                  <PlatformSwitch layout="block" className="mb-3" />
                ) : null}
                <nav aria-label={t("mobileNav.title")} className="grid grid-cols-2 gap-0.5">
                  {sections.map((section) => (
                    <Link
                      key={section.href}
                      href={section.href}
                      onClick={close}
                      aria-current={section.active ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center truncate rounded-lg px-3 text-sm transition-colors",
                        section.active
                          ? "bg-foreground/[0.06] font-medium text-foreground"
                          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                      )}
                    >
                      {section.label}
                    </Link>
                  ))}
                </nav>
                <div className="my-3 h-px bg-border" />
                <SidebarNav onNavigate={close} />
              </div>
            </Drawer>,
            document.body,
          )
        : null}
    </div>
  );
}

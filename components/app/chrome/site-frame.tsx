"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteSidebar } from "@/components/app/chrome/site-sidebar";
import { PageTransition } from "@/components/app/chrome/page-transition";
import { ThreeColumnLayout } from "@/components/app/chrome/three-column-layout";
import { PageNav, type PageNavItem } from "@/components/app/docs/page-nav";

const SIDEBAR_PATHS = ["/components", "/docs", "/charts"];
const EMPTY_NAV_ITEMS: PageNavItem[] = [];

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_PATHS.some((p) => pathname.startsWith(p));
  // Detail pages already render their own right rail with section navigation.
  const hasPageNav = /^\/components\/[^/]+\/[^/]+\/?$/.test(pathname) ||
    /^\/charts\/[^/]+\/?$/.test(pathname);

  if (!showSidebar) {
    return <PageTransition>{children}</PageTransition>;
  }

  return (
    <PageTransition>
      {hasPageNav ? children : (
        <ThreeColumnLayout
          leftSidebar={<SiteSidebar />}
          rightSidebar={<PageNav items={EMPTY_NAV_ITEMS} />}
        >
          {children}
        </ThreeColumnLayout>
      )}
    </PageTransition>
  );
}

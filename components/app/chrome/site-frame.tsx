"use client";

import { usePathname } from "@/lib/navigation";
import type { ReactNode } from "react";
import { SiteSidebar } from "@/components/app/chrome/site-sidebar";
import { PageTransition } from "@/components/app/chrome/page-transition";
import { ThreeColumnLayout } from "@/components/app/chrome/three-column-layout";
import { RightSidebar } from "@/components/app/chrome/right-sidebar";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { categoryPath, hasSiteSidebar } from "@/lib/component-paths";

/** Galleries that drop both sidebars so their content runs the full width. */
const FULL_WIDTH_PAGES = new Set([categoryPath("micro-interactions")]);

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = hasSiteSidebar(pathname);
  const fullWidth = FULL_WIDTH_PAGES.has(pathname);

  if (!showSidebar) {
    return <PageTransition>{children}</PageTransition>;
  }

  // Full-width galleries read as standalone pages, so they end with the
  // landing's footer rather than the docs one.
  if (fullWidth) {
    return (
      <>
        <div className="min-w-0 px-4 pt-4 pb-8 md:px-6 xl:px-8">
          <PageTransition>{children}</PageTransition>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <ThreeColumnLayout leftSidebar={<SiteSidebar />} rightSidebar={<RightSidebar />}>
      <PageTransition>{children}</PageTransition>
    </ThreeColumnLayout>
  );
}

"use client";

import { usePathname } from "@/lib/navigation";
import type { ReactNode } from "react";
import { SiteSidebar } from "@/components/app/chrome/site-sidebar";
import { PageTransition } from "@/components/app/chrome/page-transition";
import { ThreeColumnLayout } from "@/components/app/chrome/three-column-layout";
import { RightSidebar } from "@/components/app/chrome/right-sidebar";
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

  return (
    <ThreeColumnLayout
      leftSidebar={fullWidth ? undefined : <SiteSidebar />}
      rightSidebar={fullWidth ? undefined : <RightSidebar />}
    >
      <PageTransition>{children}</PageTransition>
    </ThreeColumnLayout>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteSidebar } from "@/components/app/chrome/site-sidebar";
import { PageTransition } from "@/components/app/chrome/page-transition";
import { ThreeColumnLayout } from "@/components/app/chrome/three-column-layout";
import { RightSidebar } from "@/components/app/chrome/right-sidebar";
import { hasSiteSidebar } from "@/lib/component-paths";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = hasSiteSidebar(pathname);

  if (!showSidebar) {
    return <PageTransition>{children}</PageTransition>;
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<SiteSidebar />}
      rightSidebar={<RightSidebar />}
    >
      <PageTransition>{children}</PageTransition>
    </ThreeColumnLayout>
  );
}

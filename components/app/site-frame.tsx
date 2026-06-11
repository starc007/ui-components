"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileNav } from "@/components/app/mobile-nav";
import { SiteSidebar } from "@/components/app/site-sidebar";
import { PageTransition } from "@/components/app/page-transition";

const SIDEBAR_PATHS = ["/components", "/docs"];

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_PATHS.some((p) => pathname.startsWith(p));

  if (!showSidebar) {
    return <PageTransition>{children}</PageTransition>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <SiteSidebar />
      <div className="min-w-0 py-8 md:pl-64">
        <MobileNav />
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}

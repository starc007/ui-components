"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteSidebar } from "@/components/app/chrome/site-sidebar";
import { PageTransition } from "@/components/app/chrome/page-transition";
import { cn } from "@/lib/utils";

const SIDEBAR_PATHS = ["/components", "/docs"];

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_PATHS.some((p) => pathname.startsWith(p));
  const isComponentsRoute = pathname.startsWith("/components");

  if (!showSidebar) {
    return <PageTransition>{children}</PageTransition>;
  }

  return (
    <div
      className={cn(
        isComponentsRoute
          ? "w-full px-4 md:px-6 xl:px-8"
          : "mx-auto max-w-7xl px-4",
      )}
    >
      <SiteSidebar />
      <div className="min-w-0 py-8 md:pl-64">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}

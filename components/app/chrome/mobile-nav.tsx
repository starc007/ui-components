"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarNav } from "@/components/app/chrome/site-sidebar";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Button } from "@/components/motion/button";
import { cn } from "@/lib/utils";

/** Mobile nav: a header hamburger that opens the sidebar list in beUI's own bottom sheet. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Covers navigation that doesn't go through a sheet link (back/forward).
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger — close the sheet on any route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Menu"
        snapPoints={[0.85]}
      >
        <div className="flex flex-col gap-5 pt-2">
          <nav className="flex flex-wrap gap-1">
            <Link
              href="/components/motion"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname.startsWith("/components/motion") || (pathname.startsWith("/components") && !pathname.startsWith("/components/blocks"))
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Components
            </Link>
            <Link
              href="/components/blocks"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname.startsWith("/components/blocks")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Blocks
            </Link>
            <Link
              href="/playground"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname.startsWith("/playground")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Playground
            </Link>
            <Link
              href="/sponsors"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname.startsWith("/sponsors")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sponsors
            </Link>
          </nav>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </BottomSheet>
    </div>
  );
}

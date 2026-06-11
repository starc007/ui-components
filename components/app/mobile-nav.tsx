"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Button } from "@/components/motion/button";
import { SidebarNav } from "@/components/app/site-sidebar";

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
        title="Browse"
        snapPoints={[0.85]}
      >
        <div className="pt-2">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </BottomSheet>
    </div>
  );
}

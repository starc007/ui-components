"use client";

import { ChevronsUpDown, Compass } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Button } from "@/components/motion/button";
import { SidebarNav } from "@/components/app/site-sidebar";

/** Mobile replacement for the sidebar: a trigger that opens the nav in beUI's own bottom sheet. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Covers navigation that doesn't go through a sheet link (back/forward).
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger — close the sheet on any route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="mb-6 md:hidden">
      <Button
        variant="outline"
        size="md"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full justify-between rounded-xl"
      >
        <span className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-(--color-fg-muted)" />
          Browse components
        </span>
        <ChevronsUpDown className="h-4 w-4 text-(--color-fg-muted)" />
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

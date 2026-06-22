"use client";

import { useState } from "react";
import { Drawer } from "@/components/motion/drawer";

export function DrawerPreview() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");

  const openWith = (s: "left" | "right") => {
    setSide(s);
    setOpen(true);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => openWith("left")}
        className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-card/70"
      >
        Open left
      </button>
      <button
        type="button"
        onClick={() => openWith("right")}
        className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open right
      </button>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        side={side}
        ariaLabel="Demo drawer"
        className="gap-4 p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Drawer</h2>
        <p className="text-sm text-muted-foreground">
          Slides in from the {side}. Press Esc or click outside to close.
        </p>
      </Drawer>
    </div>
  );
}

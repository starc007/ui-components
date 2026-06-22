"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";

export function BottomSheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground press hover:border-(--color-border-strong)"
      >
        Open bottom sheet
      </button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        snapPoints={[0.4, 0.85]}
        title="Quick actions"
        description="Drag the handle, fling, or swipe down to dismiss."
      >
        <ul className="divide-y divide-border">
          {["Share", "Duplicate", "Move to folder", "Rename", "Archive", "Delete"].map((item) => (
            <li key={item} className="py-3 text-sm text-foreground">{item}</li>
          ))}
        </ul>
        <div className="py-12 text-center text-xs text-muted-foreground">
          Fling up to expand, fling down to dismiss.
        </div>
      </BottomSheet>
    </>
  );
}

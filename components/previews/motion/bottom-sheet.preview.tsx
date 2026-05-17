"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/motion/bottom-sheet";

export function BottomSheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open bottom sheet</Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        snapPoints={[0.4, 0.85]}
        title="Quick actions"
        description="Drag the handle, fling, or swipe down to dismiss."
      >
        <ul className="divide-y divide-border">
          {["Share", "Duplicate", "Move to folder", "Rename", "Archive", "Delete"].map((item) => (
            <li key={item} className="py-3 text-sm">{item}</li>
          ))}
        </ul>
        <div className="py-12 text-center text-xs text-muted-foreground">
          Fling up to expand to the next snap point — fling down to dismiss.
        </div>
      </BottomSheet>
    </>
  );
}

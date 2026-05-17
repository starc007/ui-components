"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function SheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open bottom sheet</Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        snapPoints={[0.4, 0.85]}
        title="Quick actions"
        description="Drag the handle, fling, or swipe down to dismiss."
      >
        <ul className="divide-y divide-(--color-border)">
          {["Share", "Duplicate", "Move to folder", "Rename", "Archive", "Delete"].map((item) => (
            <li key={item} className="py-3 text-sm text-(--color-fg)">{item}</li>
          ))}
        </ul>
        <div className="py-12 text-center text-xs text-(--color-fg-muted)">
          Try flinging the handle up to expand, or down to dismiss.
        </div>
      </Sheet>
    </>
  );
}

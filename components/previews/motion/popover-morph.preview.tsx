"use client";

import { ChevronDown, Copy, Pencil, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";

const ACTIONS = [
  { icon: Pencil, label: "Edit" },
  { icon: Copy, label: "Duplicate" },
  { icon: Share2, label: "Share" },
  { icon: Trash2, label: "Delete" },
];

export function MorphPopoverPreview() {
  const [open, setOpen] = useState(false);

  return (
    <MorphPopover open={open} onOpenChange={setOpen}>
      <MorphPopoverTrigger>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring"
        >
          Options
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </MorphPopoverTrigger>

      <MorphPopoverContent align="start" className="w-48 p-1.5">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label}
          </button>
        ))}
      </MorphPopoverContent>
    </MorphPopover>
  );
}

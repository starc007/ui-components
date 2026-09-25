"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Tooltip } from "@/components/motion/tooltip";

const placements = [
  { side: "top", label: "Top", icon: ArrowUp, position: "col-start-2 row-start-1" },
  { side: "left", label: "Left", icon: ArrowLeft, position: "col-start-1 row-start-2" },
  { side: "right", label: "Right", icon: ArrowRight, position: "col-start-3 row-start-2" },
  { side: "bottom", label: "Bottom", icon: ArrowDown, position: "col-start-2 row-start-3" },
] as const;

export function TooltipPreview() {
  return (
    <div className="flex w-full flex-col items-center gap-8 py-6">
      <div className="grid grid-cols-3 gap-x-3 gap-y-5">
        {placements.map(({ side, label, icon: Icon, position }) => (
          <Tooltip key={side} content="More context" side={side} wrapperClassName={position}>
            <button
              type="button"
              className="inline-flex h-10 w-20 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
              {label}
            </button>
          </Tooltip>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Hover or focus. Press Esc to dismiss.</p>
    </div>
  );
}

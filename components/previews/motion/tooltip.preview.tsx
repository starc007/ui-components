"use client";

import { Heart, Settings, Share, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/motion/tooltip";

export function TooltipPreview() {
  return (
    <div className="flex flex-col items-center gap-12">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Tooltip content="Like this post" side="top">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground press">
            <Heart className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Share" side="bottom">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground press">
            <Share className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Open settings" side="left">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground press">
            <Settings className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Move to trash" side="right">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground press">
            <Trash2 className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
      <p className="text-xs text-muted-foreground">Hover or focus each button. Content fades and un-blurs in.</p>
    </div>
  );
}

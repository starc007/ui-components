"use client";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function TooltipPreview() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip content="On the top" side="top"><Button variant="secondary">Top</Button></Tooltip>
      <Tooltip content="On the right" side="right"><Button variant="secondary">Right</Button></Tooltip>
      <Tooltip content="On the bottom" side="bottom"><Button variant="secondary">Bottom</Button></Tooltip>
      <Tooltip content="On the left" side="left"><Button variant="secondary">Left</Button></Tooltip>
    </div>
  );
}

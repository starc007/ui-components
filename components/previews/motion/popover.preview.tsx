"use client";

import { Button } from "@/components/motion/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";

export function PopoverPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Popover side="bottom" align="start">
        <PopoverTrigger>
          <Button variant="secondary">Edit profile</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <p className="text-sm font-medium text-foreground">Dimensions</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set the width and height for the layer.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Width</span>
              <input
                defaultValue="100%"
                className="h-8 w-32 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Height</span>
              <input
                defaultValue="auto"
                className="h-8 w-32 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              />
            </label>
          </div>
        </PopoverContent>
      </Popover>

      <Popover trigger="hover" side="top">
        <PopoverTrigger>
          <Button variant="outline">Hover me</Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <p className="text-sm text-foreground">
            Opens on hover, with a grace window so you can move into the panel.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

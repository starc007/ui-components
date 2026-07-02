"use client";

import { useState } from "react";
import { Popover } from "@/components/motion/popover";

export function PopoverPreview() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Popover
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        align="start"
        trigger={
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Edit profile
          </button>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Quick actions</p>
            <p className="text-xs text-muted-foreground">
              Keep this profile menu lightweight and keyboard friendly.
            </p>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              Account settings
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              Notification preferences
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

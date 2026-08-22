"use client";

import { Bell, X } from "lucide-react";
import {
  ExpandableButton,
  ExpandableChip,
} from "@/components/motion/expandable-control";

export function ExpandableControlPreview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <ExpandableButton
          icon={<Bell className="size-4" />}
          label="Notifications"
        />
      </div>
      <div className="flex items-center gap-2">
        <ExpandableChip
          label="React"
          actionIcon={<X className="size-3.5" />}
          actionLabel="Remove React"
        />
      </div>
    </div>
  );
}

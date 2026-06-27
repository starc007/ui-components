"use client";

import { CalendarClock, Eye, GitBranch, Pin } from "lucide-react";
import { useState } from "react";
import {
  type OverflowActionItem,
  OverflowActions,
} from "@/components/motion/overflow-actions";

const primaryActions: OverflowActionItem[] = [
  {
    id: "preview",
    label: "Preview",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    id: "pin",
    label: "Pin",
    icon: <Pin className="h-4 w-4" />,
  },
];

const overflowActions: OverflowActionItem[] = [
  {
    id: "branch",
    label: "Branch",
    icon: <GitBranch className="h-4 w-4" />,
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: <CalendarClock className="h-4 w-4" />,
  },
];

export function OverflowActionsPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex w-full items-center justify-center">
      <OverflowActions
        primaryActions={primaryActions}
        overflowActions={overflowActions}
        expanded={expanded}
        onExpandedChange={setExpanded}
        openLabel="Open action rail"
        closeLabel="Collapse action rail"
      />
    </div>
  );
}

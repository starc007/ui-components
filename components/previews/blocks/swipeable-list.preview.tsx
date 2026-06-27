"use client";

import {
  Check,
  Clock3,
  FileText,
  Flag,
  Mail,
  Pin,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import {
  type SwipeAction,
  SwipeableList,
  type SwipeableListItem,
} from "@/components/motion/swipeable-list";

const leftActions: SwipeAction[] = [
  {
    id: "done",
    label: "Done",
    icon: <Check className="h-4 w-4" />,
    tone: "success",
  },
  {
    id: "pin",
    label: "Pin",
    icon: <Pin className="h-4 w-4" />,
    tone: "primary",
  },
];

const rightActions: SwipeAction[] = [
  {
    id: "later",
    label: "Later",
    icon: <Clock3 className="h-4 w-4" />,
    tone: "warning",
  },
  {
    id: "trash",
    label: "Trash",
    icon: <Trash2 className="h-4 w-4" />,
    tone: "danger",
  },
];

const initialItems: SwipeableListItem[] = [
  {
    id: "brief",
    title: "Launch brief",
    description: "Finalize the announcement copy",
    meta: "9:41",
    leading: (
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
        <FileText className="h-4 w-4" />
      </div>
    ),
    leftActions,
    rightActions,
  },
  {
    id: "feedback",
    title: "Client feedback",
    description: "Three comments need a response",
    meta: "11:08",
    leading: (
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
        <Mail className="h-4 w-4" />
      </div>
    ),
    leftActions,
    rightActions,
  },
  {
    id: "review",
    title: "Design review",
    description: "Check spacing before handoff",
    meta: "13:20",
    leading: (
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
        <UserRound className="h-4 w-4" />
      </div>
    ),
    leftActions,
    rightActions,
  },
  {
    id: "incident",
    title: "Flagged run",
    description: "Retry queue has one failed job",
    meta: "Now",
    leading: (
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
        <Flag className="h-4 w-4" />
      </div>
    ),
    leftActions,
    rightActions,
  },
];

export function SwipeableListPreview() {
  const [items, setItems] = useState(initialItems);
  const [lastAction, setLastAction] = useState("Ready");

  return (
    <div className="flex min-h-96 w-full items-center justify-center">
      <div className="w-full max-w-sm rounded-[2rem] border border-border bg-background p-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-semibold text-foreground">Priority queue</p>
            <p className="text-xs text-muted-foreground">{lastAction}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setItems(initialItems);
              setLastAction("Queue restored");
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <SwipeableList
          items={items}
          onAction={({ item, action }) => {
            setLastAction(`${action.label} · ${item.title}`);

            if (action.id === "trash") {
              setItems((current) => current.filter((entry) => entry.id !== item.id));
            }
          }}
        />

        <div className="mt-3 flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground">
          <span>{items.length} open</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

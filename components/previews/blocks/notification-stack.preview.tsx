"use client";

import { RotateCw } from "lucide-react";
import {
  NotificationStack,
  type NotificationStackItem,
} from "@/components/motion/notification-stack";

const notifications: NotificationStackItem[] = [
  {
    id: "import-failed",
    title: "Orders import failed",
    description: "42s · TimeoutError at Step 2",
    trailing: (
      <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400">
        <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
        2
      </span>
    ),
  },
  {
    id: "sla-breach",
    title: "SLA breach",
    description: "2m 11s · Data enrichment",
  },
  {
    id: "sync-fixed",
    title: "Product sync auto-fixed",
    description: "5m · 404 on GET /products",
  },
];

export function NotificationStackPreview() {
  return (
    <div className="flex w-full items-center justify-center pt-52 pb-6">
      <NotificationStack items={notifications} />
    </div>
  );
}

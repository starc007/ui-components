"use client";

import { AvatarStack } from "@/components/motion/avatar-stack";

const TEAM = [
  { id: "maya", name: "Maya Patel", fallback: "MP", className: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  { id: "alex", name: "Alex Kim", fallback: "AK", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { id: "nina", name: "Nina Chen", fallback: "NC", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { id: "omar", name: "Omar Diaz", fallback: "OD", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { id: "zoe", name: "Zoe Hart", fallback: "ZH", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  { id: "liam", name: "Liam Scott", fallback: "LS", className: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" },
];

export function AvatarStackPreview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarStack items={TEAM} />
      <p className="text-center text-xs text-muted-foreground">
        6 collaborators live in this thread
      </p>
    </div>
  );
}

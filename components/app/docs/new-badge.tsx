"use client";

import { useEffect, useState } from "react";
import { getNewBadgeRemainingMs } from "@/lib/component-status";
import { cn } from "@/lib/utils";

export function NewBadge({
  launchedAt,
  className,
}: {
  launchedAt?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const remaining = getNewBadgeRemainingMs(launchedAt);
    setVisible(remaining > 0);

    if (remaining <= 0) return;

    const timeout = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timeout);
  }, [launchedAt]);

  if (!visible) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-(--color-border-strong) bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-accent",
        className,
      )}
    >
      New
    </span>
  );
}

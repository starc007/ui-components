"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ResourceMenuAction({
  icon: Icon,
  onSelect,
  children,
}: {
  icon: LucideIcon;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      // The same row shape as every library menu: rounded-lg inside the
      // panel's p-2 (16 − 8), and a foreground tint for hover and focus.
      className="flex h-8 w-full items-center gap-2 rounded-lg px-3 text-left text-xs text-foreground outline-none transition-colors hover:bg-foreground/[0.07] focus-visible:bg-foreground/[0.07] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}

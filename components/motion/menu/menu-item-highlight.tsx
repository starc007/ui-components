"use client";

import { motion } from "motion/react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** The row shape every menu item shares. Menus add their own gap and states. */
export const MENU_ITEM_CLASS =
  "relative isolate flex w-full select-none items-center rounded-full px-3 py-1.5 text-left text-sm outline-none";

export interface MenuItemHighlightProps {
  /** Shared by every row of one panel, so the highlight glides between them. */
  layoutId: string;
  tone?: "default" | "destructive";
  reduce: boolean;
  /**
   * Jump instead of gliding: the highlight was moved by the keyboard, where a
   * spring only trails behind fast arrowing.
   */
  instant?: boolean;
}

/** The pill behind the active row. Render it only inside the active row. */
export function MenuItemHighlight({
  layoutId,
  tone = "default",
  reduce,
  instant = false,
}: MenuItemHighlightProps) {
  return (
    <motion.span
      aria-hidden="true"
      layoutId={layoutId}
      className={cn(
        "absolute inset-0 -z-10 rounded-full",
        tone === "destructive" ? "bg-destructive/10" : "bg-foreground/[0.07]",
      )}
      transition={reduce || instant ? { duration: 0 } : SPRING_LAYOUT}
    />
  );
}

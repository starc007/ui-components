"use client";

import { useEffect } from "react";
import { useThemeToggle } from "@/components/motion/theme-toggle";

export function KeyboardShortcuts() {
  const { toggle } = useThemeToggle({ variant: "circle", start: "center" });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.shiftKey || e.key !== "D" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;
      toggle();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return null;
}

"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ChatAppExample } from "@/components/previews/agents/chat-app-usage";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { cn } from "@/lib/utils";

export function ChatAppPreview() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  const toggleExpanded = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full bg-background px-0 py-2 sm:p-3",
        expanded &&
          "fixed inset-0 z-[100] h-dvh overscroll-contain p-3 sm:p-4",
      )}
    >
      <button
        type="button"
        onClick={toggleExpanded}
        aria-label={expanded ? "Exit expanded preview" : "Expand preview"}
        title={expanded ? "Exit expanded preview" : "Expand preview"}
        className="absolute top-5 right-24 z-50 grid size-9 place-items-center rounded-full border border-border/80 bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ActionSwapIcon value={expanded ? "minimize" : "maximize"} animation="blur">
          {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </ActionSwapIcon>
      </button>
      <ChatAppExample className={expanded ? "h-full" : undefined} />
    </div>
  );
}

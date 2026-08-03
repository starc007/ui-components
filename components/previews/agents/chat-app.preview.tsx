"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatAppExample } from "@/components/previews/agents/chat-app-usage";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { cn } from "@/lib/utils";

export function ChatAppPreview() {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const container = containerRef.current;
    if (!container) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const isolated: Array<{
      element: HTMLElement;
      inert: boolean;
      ariaHidden: string | null;
    }> = [];
    let branch: HTMLElement = container;
    while (branch.parentElement) {
      const parent = branch.parentElement;
      for (const sibling of Array.from(parent.children)) {
        if (sibling === branch || !(sibling instanceof HTMLElement)) continue;
        isolated.push({
          element: sibling,
          inert: sibling.inert,
          ariaHidden: sibling.getAttribute("aria-hidden"),
        });
        sibling.inert = true;
        sibling.setAttribute("aria-hidden", "true");
      }
      if (parent === document.body) break;
      branch = parent;
    }

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.inert && element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        container.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() =>
      toggleRef.current?.focus({ preventScroll: true }),
    );
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      for (const { element, inert, ariaHidden } of isolated) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      requestAnimationFrame(() =>
        toggleRef.current?.focus({ preventScroll: true }),
      );
    };
  }, [expanded]);

  const toggleExpanded = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal={expanded || undefined}
      aria-label="Chat app preview"
      tabIndex={expanded ? -1 : undefined}
      className={cn(
        "relative w-full bg-background px-0 py-2 sm:p-3",
        expanded &&
          "fixed inset-0 z-[100] h-dvh overscroll-contain p-3 sm:p-4",
      )}
    >
      <button
        ref={toggleRef}
        type="button"
        onClick={toggleExpanded}
        aria-label={expanded ? "Exit expanded preview" : "Expand preview"}
        title={expanded ? "Exit expanded preview" : "Expand preview"}
        className="absolute top-5 right-24 z-50 grid size-10 place-items-center rounded-full border border-border/80 bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ActionSwapIcon
          value={expanded ? "minimize" : "maximize"}
          animation="blur"
        >
          {expanded ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </ActionSwapIcon>
      </button>
      <ChatAppExample className={expanded ? "h-full" : undefined} />
    </div>
  );
}

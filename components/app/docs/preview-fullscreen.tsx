"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type Expand = {
  stageId: string;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
};

const ExpandContext = createContext<Expand | null>(null);

function useExpand() {
  const ctx = useContext(ExpandContext);
  if (!ctx) throw new Error("Preview expand parts must sit inside PreviewExpand");
  return ctx;
}

/**
 * Lets the preview stage expand to fill the app window (not the system full
 * screen). Wraps one Preview / Usage / Code block; the toggle sits in the tab
 * row and the stage inside the Preview panel.
 */
export function PreviewExpand({
  stageId,
  children,
}: {
  stageId: string;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  return (
    <ExpandContext.Provider value={{ stageId, expanded, setExpanded, toggleRef }}>
      {children}
    </ExpandContext.Provider>
  );
}

/** Button at the right of the tab row that expands the preview. */
export function PreviewExpandToggle({ className }: { className?: string }) {
  const { stageId, expanded, setExpanded, toggleRef } = useExpand();
  const open = () => {
    // Inactive tab panels are hidden; show the Preview tab first so the stage
    // being expanded is the one on screen.
    const panel = document
      .getElementById(stageId)
      ?.closest<HTMLElement>("[role=tabpanel]");
    if (!panel?.hidden) {
      setExpanded(true);
      return;
    }
    document
      .querySelector<HTMLElement>(`[role=tab][aria-controls="${panel.id}"]`)
      ?.click();
    // The panel slides in on a transform, and a transformed ancestor would
    // trap the fixed stage inside it: expand once the transform settles.
    const start = performance.now();
    const whenSettled = () => {
      const shown = document
        .getElementById(stageId)
        ?.closest<HTMLElement>("[role=tabpanel]");
      const moving = shown && getComputedStyle(shown).transform !== "none";
      // A timer, not animation frames, so the expand still happens (after
      // the cap) if frames are paused.
      if (moving && performance.now() - start < 500) {
        window.setTimeout(whenSettled, 16);
      } else {
        setExpanded(true);
      }
    };
    window.setTimeout(whenSettled, 16);
  };
  return (
    <button
      ref={toggleRef}
      type="button"
      onClick={open}
      aria-label="Expand preview"
      aria-expanded={expanded}
      aria-controls={stageId}
      title="Expand preview"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      <Maximize2 aria-hidden="true" className="size-4" />
    </button>
  );
}

/**
 * The preview stage. Expanded, it becomes a fixed layer over the whole app
 * window that paints the page background; the demo stays mounted, so it
 * keeps its state either way.
 */
export function PreviewExpandStage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { stageId, expanded, setExpanded, toggleRef } = useExpand();
  const exitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    exitRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      // A demo that used Escape itself (closing its own tooltip or menu)
      // keeps the preview open.
      if (e.key === "Escape" && !e.defaultPrevented) setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      toggle?.focus({ preventScroll: true });
    };
  }, [expanded, setExpanded, toggleRef]);

  return (
    <div
      id={stageId}
      data-expanded={expanded || undefined}
      className={cn(
        className,
        expanded &&
          "fixed inset-0 z-[100] min-h-0 overflow-auto bg-background p-6 py-16",
      )}
    >
      {expanded ? (
        <button
          ref={exitRef}
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Exit expanded preview"
          title="Exit (Esc)"
          className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Minimize2 aria-hidden="true" className="size-4" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

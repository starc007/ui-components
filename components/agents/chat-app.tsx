"use client";

import { type ComponentProps, useEffect, useRef } from "react";
import {
  AnimatedSidebarProvider,
  useAnimatedSidebar,
} from "@/components/motion/animated-sidebar";
import { cn } from "@/lib/utils";

/**
 * Shell width below which a docked sidebar leaves too little room for the
 * conversation. The sidebar's own mobile sheet keys off the viewport, which
 * says nothing about a shell embedded in a column, split view or panel.
 */
const MIN_DOCKED_WIDTH = 600;

export type ChatAppProps = ComponentProps<typeof AnimatedSidebarProvider> & {
  sidebarWidth?: string;
  /** Shell width in px under which the sidebar folds off-canvas. */
  collapseSidebarBelow?: number;
};

/**
 * Folds the sidebar away while the shell is too narrow to carry both panes,
 * and brings it back when it isn't. Only crossings are acted on, so a manual
 * toggle at either size stays put until the shell actually changes shape.
 */
function ShellFit({ minWidth }: { minWidth: number }) {
  const { setOpen } = useAnimatedSidebar();
  const markerRef = useRef<HTMLDivElement>(null);
  const narrowRef = useRef<boolean | null>(null);

  useEffect(() => {
    const shell = markerRef.current?.parentElement;
    if (!shell) return;
    const observer = new ResizeObserver(([entry]) => {
      const narrow = entry.contentRect.width < minWidth;
      if (narrowRef.current === narrow) return;
      narrowRef.current = narrow;
      setOpen(!narrow);
    });
    observer.observe(shell);
    return () => observer.disconnect();
  }, [minWidth, setOpen]);

  return <div ref={markerRef} className="hidden" />;
}

export function ChatApp({
  children,
  className,
  sidebarWidth = "17rem",
  collapseSidebarBelow = MIN_DOCKED_WIDTH,
  style,
  ...props
}: ChatAppProps) {
  return (
    <AnimatedSidebarProvider
      {...props}
      style={{ ...style, "--sidebar-width": sidebarWidth }}
      className={cn(
        "min-h-0 w-full overflow-hidden rounded-2xl border border-border bg-background",
        className,
      )}
    >
      <ShellFit minWidth={collapseSidebarBelow} />
      {children}
    </AnimatedSidebarProvider>
  );
}

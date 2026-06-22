"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ExpandableCode({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const checkHeight = () => {
      if (el.scrollHeight > 320) {
        setCanExpand(true);
      } else {
        setCanExpand(false);
      }
    };

    const observer = new ResizeObserver(checkHeight);
    observer.observe(el);
    checkHeight(); // Initial check

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          "transition-[max-height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          expanded
            ? "max-h-[640px] overflow-auto"
            : canExpand === false
              ? "max-h-none"
              : "max-h-[320px] overflow-hidden",
        )}
      >
        {children}
      </div>
      {!expanded && canExpand && (
        <div className="absolute bottom-0 left-0 right-0 flex h-32 items-end justify-center bg-gradient-to-t from-card to-transparent pb-4">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-full bg-background/80 px-4 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background border border-border"
          >
            Expand Code
          </button>
        </div>
      )}
    </div>
  );
}

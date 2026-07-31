"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  Children,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ThinkingShimmer } from "@/components/agents/loading-states/thinking-shimmer";
import { EASE_OUT, SPRING_PANEL, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type AgentReasoningStatus = "thinking" | "complete";

export interface AgentReasoningProps {
  /** Current reasoning phase. Active reasoning always stays expanded. */
  status?: AgentReasoningStatus;
  /** Elapsed reasoning time, in seconds. */
  duration?: number;
  /** Controlled expanded state used after reasoning completes. */
  open?: boolean;
  /** Initial expanded state used after reasoning completes. */
  defaultOpen?: boolean;
  /** Called when the completed reasoning disclosure changes state. */
  onOpenChange?: (open: boolean) => void;
  /** Collapse the disclosure when status changes from thinking to complete. */
  collapseOnComplete?: boolean;
  /** Label displayed while reasoning is active. */
  thinkingLabel?: ReactNode;
  /** Optional completed summary. Defaults to “Thought for Ns”. */
  summary?: ReactNode;
  /** Maximum visible reasoning height before the content scrolls. */
  maxHeight?: number;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

function formatDuration(duration: number) {
  const seconds = Math.max(0, Math.round(duration));
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

function useControllableOpen({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const currentOpen = open ?? internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  return [currentOpen, setOpen] as const;
}

export function AgentReasoning({
  status = "thinking",
  duration = 0,
  open,
  defaultOpen = false,
  onOpenChange,
  collapseOnComplete = true,
  thinkingLabel = "Thinking…",
  summary,
  maxHeight = 192,
  children,
  className,
  contentClassName,
}: AgentReasoningProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousStatus = useRef(status);
  const childCount = Children.count(children);
  const [contentHeight, setContentHeight] = useState(0);
  const [currentOpen, setOpen] = useControllableOpen({
    open,
    defaultOpen,
    onOpenChange,
  });
  const thinking = status === "thinking";
  const expanded = thinking || currentOpen;
  const cappedHeight = Math.min(contentHeight, Math.max(0, maxHeight));
  const capped = contentHeight > maxHeight;

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => setContentHeight(node.offsetHeight);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (previousStatus.current === "thinking" && status === "complete") {
      setOpen(!collapseOnComplete);
    }
    previousStatus.current = status;
  }, [collapseOnComplete, setOpen, status]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (thinking && viewport && childCount > 0) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [childCount, thinking]);

  const toggle = () => {
    const next = !currentOpen;
    setOpen(next);
    if (next) requestAnimationFrame(() => viewportRef.current?.scrollTo({ top: 0 }));
  };

  const completedSummary = summary ?? (
    <>
      Thought for <span className="tabular-nums">{formatDuration(duration)}</span>
    </>
  );

  return (
    <div
      data-state={thinking ? "thinking" : expanded ? "open" : "closed"}
      aria-busy={thinking}
      className={cn("w-full text-sm", className)}
    >
      {thinking ? (
        <div
          id={triggerId}
          role="status"
          className="flex h-7 items-center text-muted-foreground"
        >
          <ThinkingShimmer>{thinkingLabel}</ThinkingShimmer>
        </div>
      ) : (
        <button
          id={triggerId}
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggle}
          className="group flex h-7 items-center gap-1.5 rounded-md text-left font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>{completedSummary}</span>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : SPRING_SWAP}
            className="inline-flex text-muted-foreground/70 group-hover:text-foreground"
          >
            <ChevronDown className="size-3.5" />
          </motion.span>
        </button>
      )}

      <motion.div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!expanded}
        inert={!expanded}
        initial={false}
        animate={{ height: expanded ? cappedHeight : 0 }}
        transition={reduce ? { duration: 0 } : SPRING_PANEL}
        className="overflow-hidden"
      >
        <div
          ref={viewportRef}
          className={cn(
            "scrollbar-hide",
            capped && expanded && !thinking ? "overflow-y-auto" : "overflow-y-hidden",
          )}
          style={{
            height: cappedHeight,
            maskImage: capped
              ? "linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)"
              : undefined,
          }}
        >
          <div
            ref={contentRef}
            className={cn("space-y-2 py-2 text-muted-foreground", contentClassName)}
          >
            {Children.toArray(children).map((child, index) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: streamed reasoning lines keep their append-only position.
                key={index}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
                className="leading-5"
              >
                {child}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

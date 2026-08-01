"use client";

import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type StreamingResponseStatus = "streaming" | "complete" | "error";
export type StreamingResponseFeedback = "up" | "down" | null;

export interface StreamingResponseProps {
  /** Rendered response content. Pass plain text or the output of a Markdown renderer. */
  children: ReactNode;
  status?: StreamingResponseStatus;
  /** Plain-text value copied by the built-in copy action. */
  copyText?: string;
  /** Overrides the built-in clipboard action. */
  onCopy?: () => void | Promise<void>;
  onRetry?: () => void;
  feedback?: StreamingResponseFeedback;
  defaultFeedback?: StreamingResponseFeedback;
  onFeedbackChange?: (feedback: StreamingResponseFeedback) => void;
  showCursor?: boolean;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
}

function ResponseAction({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={label === "Helpful" || label === "Not helpful" ? active : undefined}
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={SPRING_PRESS}
      className={cn(
        "grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}

export function StreamingResponse({
  children,
  status = "streaming",
  copyText,
  onCopy,
  onRetry,
  feedback,
  defaultFeedback = null,
  onFeedbackChange,
  showCursor = true,
  className,
  contentClassName,
  actionsClassName,
}: StreamingResponseProps) {
  const reduce = useReducedMotion() ?? false;
  const [copied, setCopied] = useState(false);
  const [internalFeedback, setInternalFeedback] =
    useState<StreamingResponseFeedback>(defaultFeedback);
  const copyTimer = useRef<number | undefined>(undefined);
  const currentFeedback = feedback ?? internalFeedback;
  const streaming = status === "streaming";
  const complete = status === "complete";
  const canCopy = Boolean(copyText || onCopy);
  const showActions = !streaming && (canCopy || onRetry || complete);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (onCopy) await onCopy();
    else if (copyText) await navigator.clipboard?.writeText(copyText);

    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }, [copyText, onCopy]);

  const setFeedback = (next: Exclude<StreamingResponseFeedback, null>) => {
    const value = currentFeedback === next ? null : next;
    if (feedback === undefined) setInternalFeedback(value);
    onFeedbackChange?.(value);
  };

  return (
    <div
      data-state={status}
      aria-busy={streaming}
      className={cn("w-full", className)}
    >
      <div
        aria-live="polite"
        className={cn(
          "text-sm leading-6 text-foreground/90 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p+p]:mt-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/45 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
          contentClassName,
        )}
      >
        {children}
        {streaming && showCursor ? (
          <motion.span
            aria-hidden="true"
            className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.16em] bg-current"
            animate={reduce ? { opacity: 0.7 } : { opacity: [0.25, 1, 0.25] }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: EASE_OUT }
            }
          />
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {showActions ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
            className={cn("mt-3 flex items-center gap-0.5", actionsClassName)}
          >
            {canCopy ? (
              <ResponseAction label={copied ? "Copied" : "Copy response"} onClick={handleCopy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </ResponseAction>
            ) : null}
            {onRetry ? (
              <ResponseAction label="Retry response" onClick={onRetry}>
                <RotateCcw className="size-3.5" />
              </ResponseAction>
            ) : null}
            {complete ? (
              <>
                <ResponseAction
                  label="Helpful"
                  active={currentFeedback === "up"}
                  onClick={() => setFeedback("up")}
                >
                  <ThumbsUp className="size-3.5" />
                </ResponseAction>
                <ResponseAction
                  label="Not helpful"
                  active={currentFeedback === "down"}
                  onClick={() => setFeedback("down")}
                >
                  <ThumbsDown className="size-3.5" />
                </ResponseAction>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

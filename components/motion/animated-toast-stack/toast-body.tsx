"use client";

import {
  AlertCircle,
  Bell,
  Check,
  Info,
  LoaderCircle,
  type LucideIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import type { AnimatedToast, ToastClassNames, ToastStatus } from "./types";

const STATUS_ICON: Record<ToastStatus, LucideIcon> = {
  neutral: Bell,
  info: Info,
  loading: LoaderCircle,
  success: Check,
  error: AlertCircle,
};

// The chip stays neutral; only the icon carries the status colour.
const STATUS_COLOR: Record<ToastStatus, string> = {
  neutral: "text-muted-foreground",
  info: "text-primary",
  loading: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-destructive",
};

// A status change (loading to success) morphs the icon and text in place.
const SWAP = { duration: 0.24, ease: EASE_OUT } as const;

function Swap({
  id,
  reduce,
  className = "block min-w-0",
  children,
}: {
  id: string;
  reduce: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={SWAP}
        className={className}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

export interface ToastBodyProps {
  toast: AnimatedToast;
  /** The one-line pill: icon, title and a count of the others. No details. */
  compact?: boolean;
  /** How many other toasts are waiting, shown as +N. */
  others?: number;
  onDismiss?: (id: string) => void;
  dismissLabel: string;
  moreLabel: string;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastStatus, ReactNode>>;
  renderToast?: (toast: AnimatedToast) => ReactNode;
  reduce: boolean;
}

/** One toast's content: the pill, the card, or a row of the open list. */
export function ToastBody({
  toast,
  compact = false,
  others = 0,
  onDismiss,
  dismissLabel,
  moreLabel,
  classNames,
  icons,
  renderToast,
  reduce,
}: ToastBodyProps) {
  if (renderToast) return <>{renderToast(toast)}</>;

  const status = toast.status ?? "neutral";
  const Icon = STATUS_ICON[status];
  const icon = icons?.[status] ?? toast.icon ?? <Icon className="h-3.5 w-3.5" />;
  const canDismiss = toast.dismissible !== false && Boolean(onDismiss);
  const details = !compact && Boolean(toast.description || toast.action);

  const chip = (
    <span
      className={cn(
        // A foreground tint, not bg-muted: muted is the card colour in dark mode.
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06]",
        STATUS_COLOR[status],
        details && "mt-0.5",
        classNames?.iconWrap,
      )}
    >
      {/* A flex box, not a block: a block lines the icon up on the text
          baseline, which leaves it off centre in the chip. */}
      <Swap id={status} reduce={reduce} className="flex items-center justify-center">
        <span className={cn("flex", status === "loading" && "animate-spin")}>{icon}</span>
      </Swap>
    </span>
  );

  const count =
    others > 0 ? (
      <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-foreground/[0.06] px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
        <span aria-hidden="true">+{others}</span>
        <span className="sr-only">{moreLabel}</span>
      </span>
    ) : null;

  if (compact) {
    return (
      <div className="flex h-10 items-center gap-2 pr-3 pl-1.5">
        {chip}
        <span className={cn("relative max-w-[15rem] truncate text-sm font-medium text-foreground", classNames?.title)}>
          <Swap id={`${status}-${String(toast.title)}`} reduce={reduce}>
            {toast.title}
          </Swap>
        </span>
        {count}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 p-3", details ? "items-start" : "items-center")}>
      {chip}
      <div className={cn("relative min-w-0 flex-1", classNames?.content)}>
        {/* The count rides the title line, so the description keeps the full
            width and wraps the same whether the island is open or not. */}
        <div className="relative flex min-w-0 items-center gap-1.5">
          <Swap id={`${status}-${String(toast.title)}`} reduce={reduce}>
            <span className={cn("block truncate text-sm font-medium leading-5 text-foreground", classNames?.title)}>
              {toast.title}
            </span>
          </Swap>
          {count}
        </div>
        {toast.description ? (
          <div className="relative">
            <Swap id={`${status}-${String(toast.description)}`} reduce={reduce}>
              <span
                className={cn(
                  "mt-0.5 line-clamp-2 block text-xs leading-4 text-muted-foreground",
                  classNames?.description,
                )}
              >
                {toast.description}
              </span>
            </Swap>
          </div>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={() => toast.action?.onClick(toast)}
            className={cn(
              "mt-2 inline-flex h-7 items-center rounded-full bg-foreground/[0.06] px-3 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.1]",
              classNames?.action,
            )}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      {canDismiss ? (
        <Tooltip content={dismissLabel} side="top">
          <button
            type="button"
            onClick={() => onDismiss?.(toast.id)}
            aria-label={dismissLabel}
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground",
              classNames?.close,
            )}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}

"use client";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Circle,
  Info,
  LoaderCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type InlineStatusRowStatus =
  | "idle"
  | "queued"
  | "running"
  | "success"
  | "warning"
  | "error";

export type InlineStatusRowClassNames = {
  root?: string;
  button?: string;
  iconWrap?: string;
  content?: string;
  title?: string;
  description?: string;
  meta?: string;
  progressTrack?: string;
  progressBar?: string;
  details?: string;
  chevron?: string;
};

export interface InlineStatusRowProps
  extends Omit<HTMLMotionProps<"div">, "children" | "title"> {
  status?: InlineStatusRowStatus;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  progress?: number;
  details?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  icon?: ReactNode;
  icons?: Partial<Record<InlineStatusRowStatus, ReactNode>>;
  classNames?: InlineStatusRowClassNames;
  renderDetails?: (state: { status: InlineStatusRowStatus; expanded: boolean }) => ReactNode;
}

const STATUS_ICON: Record<InlineStatusRowStatus, LucideIcon> = {
  idle: Circle,
  queued: Info,
  running: LoaderCircle,
  success: Check,
  warning: AlertTriangle,
  error: X,
};

const STATUS_CLASS: Record<InlineStatusRowStatus, string> = {
  idle: "bg-(--color-fg)/[0.05] text-(--color-fg-muted)",
  queued: "bg-(--color-accent)/10 text-(--color-accent)",
  running: "bg-(--color-violet)/10 text-(--color-violet)",
  success: "bg-(--color-success)/10 text-(--color-success)",
  warning: "bg-(--color-warning)/10 text-(--color-warning)",
  error: "bg-(--color-danger)/10 text-(--color-danger)",
};

const BAR_CLASS: Record<InlineStatusRowStatus, string> = {
  idle: "bg-(--color-fg-muted)",
  queued: "bg-(--color-accent)",
  running: "bg-(--color-violet)",
  success: "bg-(--color-success)",
  warning: "bg-(--color-warning)",
  error: "bg-(--color-danger)",
};

const ROW_TRANSITION: Transition = {
  type: "spring",
  stiffness: 430,
  damping: 34,
  mass: 0.72,
};

const CONTENT_TRANSITION = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
} as const;

const ICON_VARIANTS: Variants = {
  initial: { opacity: 0.6, y: 10, scale: 0.86, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: CONTENT_TRANSITION,
  },
  exit: {
    opacity: 0.45,
    y: -10,
    scale: 0.9,
    filter: "blur(6px)",
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

function clampProgress(progress?: number) {
  if (progress == null) return undefined;
  return Math.min(Math.max(progress, 0), 100);
}

function useControllableExpanded({
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? false);
  const value = expanded ?? internalExpanded;
  const isControlled = expanded !== undefined;

  const setValue = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  return [value, setValue] as const;
}

export function InlineStatusRow({
  status = "idle",
  title,
  description,
  meta,
  progress,
  details,
  expanded,
  defaultExpanded,
  onExpandedChange,
  disabled = false,
  icon,
  icons,
  className,
  classNames,
  renderDetails,
  ...rest
}: InlineStatusRowProps) {
  const reduce = useReducedMotion();
  const Icon = STATUS_ICON[status];
  const [isExpanded, setIsExpanded] = useControllableExpanded({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });
  const resolvedProgress = clampProgress(progress);
  const canExpand = Boolean(details || renderDetails);
  const detailsContent = useMemo(
    () => renderDetails?.({ status, expanded: isExpanded }) ?? details,
    [details, isExpanded, renderDetails, status],
  );

  return (
    <motion.div
      layout
      transition={ROW_TRANSITION}
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev)",
        classNames?.root,
        className,
      )}
      {...rest}
    >
      <button
        type="button"
        disabled={disabled || !canExpand}
        aria-expanded={canExpand ? isExpanded : undefined}
        onClick={() => {
          if (canExpand) setIsExpanded(!isExpanded);
        }}
        className={cn(
          "flex w-full items-center gap-3 p-3 text-left outline-none transition-colors",
          canExpand && "cursor-pointer hover:bg-(--color-fg)/[0.025] focus-visible:bg-(--color-fg)/[0.035]",
          disabled && "pointer-events-none opacity-50",
          classNames?.button,
        )}
      >
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
            STATUS_CLASS[status],
            classNames?.iconWrap,
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              variants={ICON_VARIANTS}
              initial={reduce ? false : "initial"}
              animate={reduce ? { opacity: 1 } : "animate"}
              exit={reduce ? undefined : "exit"}
              className="inline-flex"
            >
              {status === "running" && !reduce && !icon && !icons?.running ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-flex"
                >
                  <Icon className="h-4 w-4" />
                </motion.span>
              ) : (
                (icon ?? icons?.[status] ?? <Icon className="h-4 w-4" />)
              )}
            </motion.span>
          </AnimatePresence>
        </span>

        <div className={cn("min-w-0 flex-1", classNames?.content)}>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={`${status}-${String(title)}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={CONTENT_TRANSITION}
                className={cn("truncate text-sm font-medium text-(--color-fg)", classNames?.title)}
              >
                {title}
              </motion.p>
            </AnimatePresence>

            {meta ? (
              <span className={cn("shrink-0 text-xs tabular-nums text-(--color-fg-muted)", classNames?.meta)}>
                {meta}
              </span>
            ) : null}
          </div>

          {description ? (
            <p className={cn("mt-0.5 truncate text-xs text-(--color-fg-muted)", classNames?.description)}>
              {description}
            </p>
          ) : null}

          {resolvedProgress != null ? (
            <div
              className={cn(
                "mt-2 h-1 overflow-hidden rounded-full bg-(--color-fg)/[0.06]",
                classNames?.progressTrack,
              )}
            >
              <motion.span
                initial={false}
                animate={{ width: `${status === "success" ? 100 : resolvedProgress}%` }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                className={cn("block h-full rounded-full", BAR_CLASS[status], classNames?.progressBar)}
              />
            </div>
          ) : null}
        </div>

        {canExpand ? (
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={ROW_TRANSITION}
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--color-fg-muted)",
              classNames?.chevron,
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        ) : null}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && detailsContent ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, filter: "blur(6px)" }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0, filter: "blur(6px)" }}
            transition={ROW_TRANSITION}
            className={cn("overflow-hidden", classNames?.details)}
          >
            <div className="border-t border-(--color-border) px-3 py-3 text-xs leading-5 text-(--color-fg-muted)">
              {detailsContent}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

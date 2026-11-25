"use client";

import {
  Ban,
  Braces,
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  Copy,
  LoaderCircle,
  RotateCcw,
  SquareTerminal,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useLayoutEffect, useRef } from "react";
import {
  AgentCode,
  type AgentCodeLanguage,
} from "@/components/agents/agent-code";
import { AgentDisclosure } from "@/components/agents/agent-disclosure";
import { IconSwap } from "@/components/agents/icon-swap";
import { ActionSwapRollText } from "@/components/motion/action-swap-roll";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useCopy } from "@/lib/hooks/use-copy";
import { useStatusOpen } from "@/lib/hooks/use-status-open";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ToolResultStatus = "running" | "success" | "error" | "cancelled";
export type ToolResultKind = "terminal" | "request" | "custom";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const toolResultMessages = {
  running: "Running",
  success: "Completed",
  error: "Failed",
  cancelled: "Cancelled",
  copy: "Copy result",
  copied: "Copied",
  retry: "Run again",
};

export type ToolResultMessages = typeof toolResultMessages;

export interface ToolResultProps {
  /** Tool name, shown in small monospace after the title. */
  tool: ReactNode;
  /** Heading in the header row, rolls to the new text when it changes. */
  title: ReactNode;
  children: ReactNode;
  /** Run state, sets the status badge and auto open or fold. Default: "running" */
  status?: ToolResultStatus;
  /** Picks the header icon when no `icon` is given. Default: "custom" */
  kind?: ToolResultKind;
  /** Short muted detail after the title, e.g. a duration or count. */
  meta?: ReactNode;
  /** Replaces the icon chosen by `kind`. */
  icon?: ReactNode;
  /** Whether the output panel is open, for controlled use. */
  open?: boolean;
  /** Whether the output panel starts open when uncontrolled. Default: true */
  defaultOpen?: boolean;
  /** Called with the new open state when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Folds the panel when the status leaves "running". Default: true */
  collapseOnComplete?: boolean;
  /** Maximum height of the scrolling output area, in px. Default: 220 */
  maxHeight?: number;
  /** Text the copy button writes to the clipboard. Shows the copy button. */
  copyText?: string;
  /** Runs instead of the clipboard write when copy is pressed. Shows the copy button. */
  onCopy?: () => void | Promise<void>;
  /** Called when the retry button is pressed. Shows the retry button. */
  onRetry?: () => void;
  /** Override any built-in string. */
  labels?: Partial<ToolResultMessages>;
  /** Classes merged onto the root element. */
  className?: string;
  /** Classes merged onto the padded box around the output. */
  contentClassName?: string;
}

export interface ToolResultOutputProps {
  children: string;
  /** Syntax highlighting language for the output. Default: "bash" */
  language?: AgentCodeLanguage;
  /** Classes merged onto the code element. */
  className?: string;
}

function getSwapKey(value: ReactNode, fallback: string) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function getStatusClass(status: ToolResultStatus) {
  if (status === "running") {
    return "text-blue-600 dark:text-blue-400";
  }
  if (status === "success") {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (status === "error") {
    return "text-rose-600 dark:text-rose-400";
  }
  return "text-muted-foreground";
}

function KindIcon({ kind }: { kind: ToolResultKind }) {
  if (kind === "terminal") return <SquareTerminal className="size-4" />;
  if (kind === "request") return <Braces className="size-4" />;
  return <Wrench className="size-4" />;
}

function StatusIcon({
  status,
  reduce,
}: {
  status: ToolResultStatus;
  reduce: boolean;
}) {
  if (status === "running") {
    return <LoaderCircle className={cn("size-3", !reduce && "animate-spin")} />;
  }
  if (status === "success") return <CircleCheck className="size-3" />;
  if (status === "error") return <CircleX className="size-3" />;
  return <Ban className="size-3" />;
}

function ToolResultAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <Tooltip content={label} side="top">
      <motion.button
        type="button"
        aria-label={label}
        onClick={onClick}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        transition={SPRING_PRESS}
        // A foreground tint: the output panel is already muted, so a muted
        // hover would not show.
        className="grid size-7 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </motion.button>
    </Tooltip>
  );
}

export function ToolResultOutput({
  children,
  language = "bash",
  className,
}: ToolResultOutputProps) {
  return (
    <AgentCode
      code={children}
      language={language}
      className={cn(
        "whitespace-pre-wrap break-words text-foreground/80",
        className,
      )}
    />
  );
}

export function ToolResult({
  tool,
  title,
  children,
  status = "running",
  kind = "custom",
  meta,
  icon,
  open,
  defaultOpen = true,
  onOpenChange,
  collapseOnComplete = true,
  maxHeight = 220,
  copyText,
  onCopy,
  onRetry,
  labels,
  className,
  contentClassName,
}: ToolResultProps) {
  const t = useMessages("toolResult", toolResultMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const { copied, copy: handleCopy } = useCopy({ text: copyText, onCopy });
  // Opens when the tool starts running; folds when it stops, if asked to.
  const [currentOpen, setOpen] = useStatusOpen({
    status,
    open,
    defaultOpen,
    onOpenChange,
    decide: (previous, next) => {
      if (previous !== "running" && next === "running") return true;
      if (previous === "running" && next !== "running" && collapseOnComplete) return false;
      return undefined;
    },
  });
  const running = status === "running";
  const canCopy = Boolean(copyText || onCopy);
  const titleKey = getSwapKey(title, status);
  const metaKey = getSwapKey(meta, `${status}-meta`);
  const toolKey = getSwapKey(tool, `${status}-tool`);
  const statusLabel = t(status);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !currentOpen || !running) return;

    const frame = requestAnimationFrame(() => {
      if (typeof viewport.scrollTo === "function") {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: reduce ? "auto" : "smooth",
        });
      } else {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(frame);
  });

  return (
    <div
      data-state={status}
      aria-busy={running}
      className={cn("w-full text-sm", className)}
    >
      <button
        id={triggerId}
        type="button"
        aria-expanded={currentOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!currentOpen)}
        className="group flex min-h-9 w-full items-center gap-2 rounded-full py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          aria-hidden="true"
          className="grid size-4 shrink-0 place-items-center text-muted-foreground"
        >
          {icon ?? <KindIcon kind={kind} />}
        </span>
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="min-w-0 truncate font-medium text-foreground/90">
            <ActionSwapRollText value={titleKey}>
              {title}
            </ActionSwapRollText>
          </span>
          {meta ? (
            <span className="shrink-0 text-xs text-muted-foreground/60">
              <ActionSwapRollText value={metaKey}>
                {meta}
              </ActionSwapRollText>
            </span>
          ) : null}
          <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/55">
            <ActionSwapRollText value={toolKey}>
              {tool}
            </ActionSwapRollText>
          </span>
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 text-[11px] font-medium",
            getStatusClass(status),
          )}
        >
          <IconSwap id={status}>
            <StatusIcon status={status} reduce={reduce} />
          </IconSwap>
          <ActionSwapRollText value={status}>{statusLabel}</ActionSwapRollText>
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: currentOpen ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
      </button>

      <AgentDisclosure
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        open={currentOpen}
      >
        <div className="pl-6 pt-1.5">
          <div className="overflow-hidden rounded-xl bg-muted/80">
          <div
            ref={viewportRef}
            role="log"
            aria-live="polite"
            className="scrollbar-hide overflow-y-auto"
            style={{ maxHeight }}
          >
            <div className={cn("p-3", contentClassName)}>{children}</div>
          </div>

            {canCopy || onRetry ? (
              <div className="flex items-center gap-0.5 px-2 pb-1.5">
              {canCopy ? (
                <ToolResultAction
                  label={copied ? t("copied") : t("copy")}
                  onClick={handleCopy}
                >
                  <IconSwap id={copied ? "copied" : "copy"}>
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </IconSwap>
                </ToolResultAction>
              ) : null}
              {onRetry ? (
                <ToolResultAction label={t("retry")} onClick={onRetry}>
                  <RotateCcw className="size-3.5" />
                </ToolResultAction>
              ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </AgentDisclosure>
    </div>
  );
}

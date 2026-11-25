"use client";

import {
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  LoaderCircle,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useLayoutEffect, useRef } from "react";
import {
  type AgentCodeLanguage,
  AgentCodeLine,
  useAgentCodeTokens,
} from "@/components/agents/agent-code";
import { AgentDisclosure } from "@/components/agents/agent-disclosure";
import { IconSwap } from "@/components/agents/icon-swap";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";

const DIFFSTAT_BLOCKS = 5;

// A streamed line settles quickly: lines can arrive many times a second.
const LINE_IN = { duration: 0.18, ease: EASE_OUT } as const;

import { useCopy } from "@/lib/hooks/use-copy";
import { useStatusOpen } from "@/lib/hooks/use-status-open";
import { formatNumber, useLocale, useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type FileDiffStatus = "streaming" | "complete";
export type FileDiffLineType = "added" | "removed" | "context";

export interface FileDiffLine {
  /** Stable key, so streamed lines keep their place. */
  id: string;
  /** Marks the line added (green, +), removed (red, −) or unchanged. Default: "context" */
  type?: FileDiffLineType;
  /** Line number in the old file, shown in the first gutter. Blank when not set. */
  oldLine?: number;
  /** Line number in the new file, shown in the second gutter. Blank when not set. */
  newLine?: number;
  /** The line's code, without the + or − marker. Syntax highlighted. */
  content: string;
}

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const fileDiffMessages = {
  applying: "Applying changes",
  applied: "Changes applied",
  changes: "File changes",
  copy: "Copy diff",
  copied: "Copied",
};

export type FileDiffMessages = typeof fileDiffMessages;

export interface FileDiffProps {
  /** File name or path shown in the header. */
  file: ReactNode;
  /** Diff lines, each added, removed or context, with optional line numbers. */
  lines: FileDiffLine[];
  /** "streaming" while lines arrive, "complete" once the edit lands. Default: "streaming" */
  status?: FileDiffStatus;
  /** Whether the diff is expanded, for controlled use. */
  open?: boolean;
  /** Whether the diff starts expanded when uncontrolled. Default: true */
  defaultOpen?: boolean;
  /** Called with the new state when the diff expands or collapses. */
  onOpenChange?: (open: boolean) => void;
  /** Fold the diff when status moves from streaming to complete. Default: true */
  collapseOnComplete?: boolean;
  /** Tallest the line viewport grows before it scrolls (px). Default: 220 */
  maxHeight?: number;
  /** Language used for syntax highlighting. Default: "typescript" */
  language?: AgentCodeLanguage;
  /** Text the copy button writes to the clipboard. Shows the button when set. */
  copyText?: string;
  /** Runs instead of the clipboard write when the copy button is pressed. */
  onCopy?: () => void | Promise<void>;
  /** Override any built-in string. */
  labels?: Partial<FileDiffMessages>;
  /** Classes merged onto the root element. */
  className?: string;
}

function ChangeCount({ value, type }: { value: number; type: "added" | "removed" }) {
  const { locale } = useLocale();
  if (!value) return null;
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        type === "added"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400",
      )}
    >
      {type === "added" ? "+" : "−"}
      {formatNumber(value, locale)}
    </span>
  );
}

/**
 * Five blocks split between additions and deletions, so the size and shape
 * of the change reads at a glance. The counts beside it carry the numbers.
 */
function DiffStat({ additions, deletions }: { additions: number; deletions: number }) {
  const total = additions + deletions;
  if (!total) return null;
  const added = Math.round((additions / total) * DIFFSTAT_BLOCKS);
  return (
    <span aria-hidden="true" className="flex shrink-0 gap-0.5">
      {Array.from({ length: DIFFSTAT_BLOCKS }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed blocks
          key={index}
          className={cn(
            "size-1.5 rounded-[2px] transition-colors duration-200",
            index < added ? "bg-emerald-500" : "bg-rose-500",
          )}
        />
      ))}
    </span>
  );
}

export function FileDiff({
  file,
  lines,
  status = "streaming",
  open,
  defaultOpen = true,
  onOpenChange,
  collapseOnComplete = true,
  maxHeight = 220,
  language = "typescript",
  copyText,
  onCopy,
  labels,
  className,
}: FileDiffProps) {
  const t = useMessages("fileDiff", fileDiffMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const { copied, copy: handleCopy } = useCopy({ text: copyText, onCopy });
  // Opens when streaming starts; folds when it completes, if asked to.
  const [currentOpen, setOpen] = useStatusOpen({
    status,
    open,
    defaultOpen,
    onOpenChange,
    decide: (previous, next) => {
      if (previous !== "streaming" && next === "streaming") return true;
      if (previous === "streaming" && next === "complete" && collapseOnComplete) return false;
      return undefined;
    },
  });
  const streaming = status === "streaming";
  const additions = lines.filter((line) => line.type === "added").length;
  const deletions = lines.filter((line) => line.type === "removed").length;
  const canCopy = Boolean(copyText || onCopy);
  const code = lines.map((line) => line.content).join("\n");
  const tokens = useAgentCodeTokens(code, language);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !currentOpen || !streaming) return;

    const frame = requestAnimationFrame(() => {
      if (viewport.scrollHeight <= viewport.clientHeight) return;
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
      aria-busy={streaming}
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
        <FileCode2
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/80">
          {file}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <ChangeCount value={additions} type="added" />
          <ChangeCount value={deletions} type="removed" />
          <DiffStat additions={additions} deletions={deletions} />
        </span>
        <span className="grid size-4 shrink-0 place-items-center text-muted-foreground/60">
          <IconSwap id={streaming ? "applying" : "applied"}>
            {streaming ? (
              <LoaderCircle
                aria-label={t("applying")}
                className={cn("size-3.5", !reduce && "animate-spin")}
              />
            ) : (
              <Check aria-label={t("applied")} className="size-3.5" />
            )}
          </IconSwap>
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: currentOpen ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="shrink-0 text-muted-foreground/45 transition-colors group-hover:text-muted-foreground"
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
          <div className="group/diff relative overflow-hidden rounded-xl bg-muted/80">
            <div
              ref={viewportRef}
              data-slot="file-diff-viewport"
              aria-live="polite"
              className="scrollbar-hide overflow-auto"
              style={{ maxHeight }}
            >
              <div className="font-mono text-xs leading-5">
                <span className="sr-only">{t("changes")}</span>
                {/* Lines that stream in fade in, opacity only: a moving line
                    fights the auto-scroll that follows the stream. Lines
                    already there when the diff mounts are simply shown. */}
                <AnimatePresence initial={false}>
                {lines.map((line, index) => {
                  const type = line.type ?? "context";
                  // A streamed line waits for its syntax colours before it
                  // shows: shown at once, it would flash as plain text and
                  // then recolour mid-fade. Before the highlighter has run at
                  // all (`tokens` null), lines show plain.
                  const ready = tokens === null || Boolean(tokens[index]);
                  return (
                    <motion.div
                      key={line.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: ready ? 1 : 0 }}
                      transition={LINE_IN}
                      className={cn(
                        "grid grid-cols-[2.25rem_2.25rem_1rem_minmax(0,1fr)]",
                        // A tint plus a 2px edge: the edge still marks the
                        // line where a faint tint melts into the panel.
                        type === "added" &&
                          "bg-emerald-500/10 shadow-[inset_2px_0_0_var(--color-emerald-500)]",
                        type === "removed" &&
                          "bg-rose-500/10 shadow-[inset_2px_0_0_var(--color-rose-500)]",
                      )}
                    >
                      <span className="select-none pr-2 text-right tabular-nums text-muted-foreground/40">
                        {line.oldLine}
                      </span>
                      <span className="select-none pr-2 text-right tabular-nums text-muted-foreground/40">
                        {line.newLine}
                      </span>
                      <span
                        className={cn(
                          "select-none text-center text-muted-foreground/45",
                          type === "added" &&
                            "text-emerald-600 dark:text-emerald-400",
                          type === "removed" &&
                            "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {type === "added"
                          ? "+"
                          : type === "removed"
                            ? "−"
                            : ""}
                      </span>
                      <AgentCodeLine
                        code={line.content}
                        tokens={tokens?.[index]}
                        className="min-w-0 whitespace-pre px-1.5"
                      />
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            </div>

            {canCopy ? (
              // Floats in the corner instead of taking a row of its own. It
              // shows on hover or focus where there is a pointer, always on
              // touch, and stays while "Copied" is showing.
              <div
                className={cn(
                  "absolute top-1.5 right-1.5 transition-opacity duration-150 group-focus-within/diff:opacity-100 group-hover/diff:opacity-100 [@media(hover:none)]:opacity-100",
                  copied ? "opacity-100" : "opacity-0",
                )}
              >
                <Tooltip content={copied ? t("copied") : t("copy")} side="top">
                  <motion.button
                    type="button"
                    aria-label={copied ? t("copied") : t("copy")}
                    onClick={handleCopy}
                    whileTap={reduce ? undefined : { scale: 0.95 }}
                    transition={SPRING_PRESS}
                    className="grid size-7 place-items-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <IconSwap id={copied ? "copied" : "copy"}>
                      {copied ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </IconSwap>
                  </motion.button>
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>
      </AgentDisclosure>
    </div>
  );
}

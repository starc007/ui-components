"use client";

import { Check, Copy, FileCode2, LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import {
  type AgentCodeLanguage,
  AgentCodeLine,
  useAgentCodeTokens,
} from "@/components/agents/agent-code";
import { IconSwap } from "@/components/agents/icon-swap";
import { ActionSwapRollText } from "@/components/motion/action-swap-roll";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_PRESS } from "@/lib/ease";
import { useCopy } from "@/lib/hooks/use-copy";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const codeBlockMessages = {
  writing: "Writing",
  ready: "Ready",
  copy: "Copy code",
  copied: "Copied",
};

export type CodeBlockMessages = typeof codeBlockMessages;

export type CodeBlockStatus = "streaming" | "complete";

/** One identity for the default, so the highlighted-line Set stays memoized. */
const NO_LINES: number[] = [];

export interface CodeBlockProps {
  /** The source code to show. May grow while `status` is "streaming". */
  code: string;
  /** Language for syntax highlighting, also shown in the header. Default: "typescript" */
  language?: AgentCodeLanguage;
  /** File name shown in the header. */
  filename?: ReactNode;
  /** "streaming" shows Writing and follows new lines, "complete" shows Ready. Default: "complete" */
  status?: CodeBlockStatus;
  /** Shows a line number gutter. Default: true */
  showLineNumbers?: boolean;
  /** 1-based line numbers to tint. */
  highlightLines?: number[];
  /** Height in px before the code scrolls. Default: 280 */
  maxHeight?: number;
  /** Wraps long lines instead of scrolling sideways. Default: false */
  wrap?: boolean;
  /** Shows the copy button. Default: true */
  copyable?: boolean;
  /** Runs in place of the clipboard write when copy is pressed. Shows the copy button. */
  onCopy?: () => void | Promise<void>;
  /** Classes merged onto the root element. */
  className?: string;
  /** Override any built-in string. */
  labels?: Partial<CodeBlockMessages>;
}

export function CodeBlock({
  code,
  language = "typescript",
  filename,
  status = "complete",
  showLineNumbers = true,
  highlightLines = NO_LINES,
  maxHeight = 280,
  wrap = false,
  copyable = true,
  onCopy,
  className,
  labels,
}: CodeBlockProps) {
  const t = useMessages("codeBlock", codeBlockMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const viewportRef = useRef<HTMLDivElement>(null);
  const { copied, copy: handleCopy } = useCopy({ text: code, onCopy });
  const streaming = status === "streaming";
  const tokens = useAgentCodeTokens(code, language);
  const highlighted = useMemo(
    () => new Set(highlightLines),
    [highlightLines],
  );
  let offset = 0;
  const lines = code.split("\n").map((content) => {
    const line = { content, offset };
    offset += content.length + 1;
    return line;
  });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !streaming) return;

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
      className={cn(
        "w-full overflow-hidden rounded-2xl bg-muted/80 text-sm",
        className,
      )}
    >
      <div className="flex h-10 items-center gap-2.5 px-3">
        <FileCode2
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground/70"
        />
        {filename ? (
          <span className="min-w-0 truncate font-mono text-xs text-foreground/80">
            {filename}
          </span>
        ) : null}
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/55">
          {language}
        </span>
        <span
          className={cn(
            "ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-medium",
            streaming
              ? "text-blue-600 dark:text-blue-400"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          <IconSwap id={streaming ? "writing" : "ready"}>
            {streaming ? (
              <LoaderCircle className={cn("size-3", !reduce && "animate-spin")} />
            ) : (
              <Check className="size-3" />
            )}
          </IconSwap>
          <ActionSwapRollText value={status}>
            {streaming ? t("writing") : t("ready")}
          </ActionSwapRollText>
        </span>
        {copyable || onCopy ? (
          <Tooltip content={copied ? t("copied") : t("copy")} side="top">
            <motion.button
              type="button"
              aria-label={copied ? t("copied") : t("copy")}
              onClick={handleCopy}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              transition={SPRING_PRESS}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
        ) : null}
      </div>

      <div
        ref={viewportRef}
        role={streaming ? "log" : undefined}
        aria-live={streaming ? "polite" : undefined}
        className="scrollbar-hide overflow-auto border-t border-foreground/[0.06] py-2"
        style={{ maxHeight }}
      >
        <pre className="m-0 min-w-max font-mono text-xs leading-5 text-foreground/85">
          <code>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              return (
                <span
                  key={line.offset}
                  className={cn(
                    "grid min-h-5",
                    showLineNumbers
                      ? "grid-cols-[2.75rem_minmax(0,1fr)]"
                      : "grid-cols-1",
                    // Tint plus a 2px edge, like changed lines in File Diff:
                    // a tint alone melts into the panel.
                    highlighted.has(lineNumber) &&
                      "bg-blue-500/10 shadow-[inset_2px_0_0_var(--color-blue-500)]",
                  )}
                >
                  {showLineNumbers ? (
                    <span className="select-none pr-3 text-right tabular-nums text-muted-foreground/35">
                      {lineNumber}
                    </span>
                  ) : null}
                  <AgentCodeLine
                    code={line.content}
                    tokens={tokens?.[index]}
                    className={cn(
                      "pr-4",
                      showLineNumbers ? "pl-1" : "pl-4",
                      wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
                    )}
                  />
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

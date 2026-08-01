"use client";

import { BookOpenText, ChevronDown, ExternalLink, Globe2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PANEL, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface SourceItem {
  id: string;
  title: ReactNode;
  domain?: ReactNode;
  description?: ReactNode;
  url?: string;
  icon?: ReactNode;
}

export interface SourcesProps {
  sources: SourceItem[];
  title?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  idPrefix?: string;
  className?: string;
}

export interface SourceCitationProps {
  sourceId: string;
  index: number;
  idPrefix?: string;
  className?: string;
}

function sourceTargetId(prefix: string, sourceId: string) {
  return `${prefix}-${sourceId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function SourceCitation({
  sourceId,
  index,
  idPrefix = "source",
  className,
}: SourceCitationProps) {
  return (
    <a
      href={`#${sourceTargetId(idPrefix, sourceId)}`}
      aria-label={`View source ${index}`}
      className={cn(
        "mx-0.5 inline-flex min-w-4 -translate-y-0.5 items-center justify-center rounded-md bg-muted px-1 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground no-underline outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {index}
    </a>
  );
}

function SourceRow({
  source,
  index,
  idPrefix,
}: {
  source: SourceItem;
  index: number;
  idPrefix: string;
}) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground"
      >
        {source.icon ?? <Globe2 className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-foreground/90">
            {index}. {source.title}
          </span>
          {source.domain ? (
            <span className="min-w-0 truncate text-xs text-muted-foreground/60">
              {source.domain}
            </span>
          ) : null}
        </span>
        {source.description ? (
          <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
            {source.description}
          </span>
        ) : null}
      </span>
      {source.url ? (
        <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground/50" />
      ) : null}
    </>
  );
  const className =
    "flex items-start gap-2.5 rounded-lg p-2 outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring";

  return source.url ? (
    <a
      id={sourceTargetId(idPrefix, source.id)}
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      {content}
    </a>
  ) : (
    <div id={sourceTargetId(idPrefix, source.id)} className={className}>
      {content}
    </div>
  );
}

export function Sources({
  sources,
  title = "Sources",
  open,
  defaultOpen = false,
  onOpenChange,
  idPrefix,
  className,
}: SourcesProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const contentId = `${baseId}-content`;
  const resolvedPrefix = idPrefix ?? "source";
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open],
  );

  return (
    <div className={cn("w-full text-sm", className)}>
      <button
        type="button"
        aria-expanded={currentOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!currentOpen)}
        className="group flex min-h-8 items-center gap-2 rounded-lg text-left text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BookOpenText className="size-4" />
        <span className="font-medium">{title}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
          {sources.length}
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: currentOpen ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="text-muted-foreground/60"
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
      </button>

      <motion.div
        id={contentId}
        aria-hidden={!currentOpen}
        inert={!currentOpen}
        initial={false}
        animate={{ height: currentOpen ? "auto" : 0 }}
        transition={reduce ? { duration: 0 } : SPRING_PANEL}
        className="overflow-hidden"
      >
        <div className="mt-2 space-y-0.5 border-l border-border pl-3">
          <AnimatePresence mode="popLayout">
            {sources.map((source, index) => (
              <motion.div
                layout="position"
                key={source.id}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.18, ease: EASE_OUT },
                        y: SPRING_LAYOUT,
                        layout: SPRING_LAYOUT,
                      }
                }
              >
                <SourceRow
                  source={source}
                  index={index + 1}
                  idPrefix={resolvedPrefix}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

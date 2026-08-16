"use client";

import { BookOpenText, ChevronDown, ExternalLink, Globe2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";
import { AgentDisclosure } from "@/components/agents/agent-disclosure";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { useFavicon } from "@/lib/hooks/use-favicon";
import { cn } from "@/lib/utils";

export interface CitationItem {
  id: string;
  title: ReactNode;
  domain?: ReactNode;
  url?: string;
}

export interface CitationsProps {
  citations: CitationItem[];
  title?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  idPrefix?: string;
  className?: string;
}

export interface CitationProps {
  citationId: string;
  index: number;
  /** Must match the related Citations idPrefix. */
  idPrefix: string;
  className?: string;
}

export interface CitationListProps {
  citations: CitationItem[];
  idPrefix?: string;
  className?: string;
}

export interface CitationStackProps {
  citations: CitationItem[];
  limit?: number;
  className?: string;
}

function citationTargetId(prefix: string, citationId: string) {
  return `${prefix}-${citationId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function Citation({
  citationId,
  index,
  idPrefix,
  className,
}: CitationProps) {
  return (
    <a
      href={`#${citationTargetId(idPrefix, citationId)}`}
      aria-label={`View citation ${index}`}
      className={cn(
        "mx-0.5 inline-flex min-w-4 -translate-y-0.5 items-center justify-center rounded-md bg-muted/60 px-1 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground no-underline outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {index}
    </a>
  );
}

export function CitationFavicon({
  url,
  className,
}: {
  url?: string;
  className?: string;
}) {
  const favicon = useFavicon(url);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-5 shrink-0 place-items-center text-muted-foreground",
        className,
      )}
    >
      {favicon.src ? (
        // biome-ignore lint/performance/noImgElement: Dynamic cross-site favicons keep this framework-agnostic registry component portable.
        <img
          ref={favicon.ref}
          src={favicon.src}
          alt=""
          width={16}
          height={16}
          referrerPolicy="no-referrer"
          className="size-4 rounded-sm object-contain"
        />
      ) : (
        <Globe2 className="size-3.5" />
      )}
    </span>
  );
}

export function CitationStack({
  citations,
  limit = 3,
  className,
}: CitationStackProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex -space-x-1.5", className)}
    >
      {citations.slice(0, limit).map((citation) => (
        <CitationFavicon
          key={citation.id}
          url={citation.url}
          className="size-6 rounded-full bg-background ring-2 ring-background"
        />
      ))}
    </span>
  );
}

function CitationRow({
  citation,
  index,
  idPrefix,
}: {
  citation: CitationItem;
  index: number;
  idPrefix: string;
}) {
  const content = (
    <>
      <CitationFavicon url={citation.url} />
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="truncate text-sm font-medium text-foreground/80 transition-colors group-hover/citation:text-foreground">
          {citation.title}
        </span>
        {citation.domain ? (
          <span className="min-w-0 truncate text-xs text-muted-foreground/60">
            {citation.domain}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span className="grid size-5 place-items-center rounded-md bg-foreground/[0.05] text-[10px] font-semibold tabular-nums text-muted-foreground">
          {index}
        </span>
        {citation.url ? (
          <ExternalLink className="size-3.5 text-muted-foreground/40 transition-colors group-hover/citation:text-muted-foreground" />
        ) : null}
      </span>
    </>
  );
  const className =
    "group/citation flex items-center gap-2 rounded-md px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const id = citationTargetId(idPrefix, citation.id);

  return citation.url ? (
    <a
      id={id}
      href={citation.url}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      {content}
    </a>
  ) : (
    <div id={id} className={className}>
      {content}
    </div>
  );
}

export function CitationList({
  citations,
  idPrefix,
  className,
}: CitationListProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const resolvedPrefix =
    idPrefix ?? `citation-list-${baseId.replace(/:/g, "")}`;

  return (
    <div className={cn("grid gap-0.5", className)}>
      <AnimatePresence mode="popLayout">
        {citations.map((citation, index) => (
          <motion.div
            layout="position"
            key={citation.id}
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
            <CitationRow
              citation={citation}
              index={index + 1}
              idPrefix={resolvedPrefix}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Citations({
  citations,
  title = "Sources",
  open,
  defaultOpen = false,
  onOpenChange,
  idPrefix,
  className,
}: CitationsProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const contentId = `${baseId}-content`;
  const resolvedPrefix =
    idPrefix ?? `citation-${baseId.replace(/:/g, "")}`;
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
        className="group -ml-1 flex min-h-8 items-center gap-2 rounded-lg px-1 text-left text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BookOpenText className="size-4" />
        <span className="font-medium">{title}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
          {citations.length}
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

      <AgentDisclosure
        id={contentId}
        open={currentOpen}
      >
        <CitationList
          citations={citations}
          idPrefix={resolvedPrefix}
          className="mt-1"
        />
      </AgentDisclosure>
    </div>
  );
}

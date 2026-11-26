"use client";

import { BookOpenText, ChevronDown, ExternalLink, Globe2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AgentDisclosure } from "@/components/agents/agent-disclosure";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { useFavicon } from "@/lib/hooks/use-favicon";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const citationsMessages = {
  title: "Sources",
  viewCitation: "View citation {index}",
};

export type CitationsMessages = typeof citationsMessages;

export interface CitationItem {
  /** Unique key for the source, matched by a `Citation` marker's `citationId`. */
  id: string;
  /** Source name shown as the row's main text. */
  title: ReactNode;
  /** Muted text after the title, such as the site's host. */
  domain?: ReactNode;
  /** Link opened in a new tab and the favicon source. Omit for a plain row. */
  url?: string;
  /**
   * Replaces the URL favicon, e.g. a document icon for non-web sources. An svg
   * child is sized to match the favicon; falsy values fall back to the favicon.
   */
  icon?: ReactNode;
}

export interface CitationsProps {
  /** Sources listed in order, numbered from 1. */
  citations: CitationItem[];
  /** Text of the toggle button. Default: "Sources" */
  title?: ReactNode;
  /** Whether the list is expanded, for controlled use. */
  open?: boolean;
  /** Whether the list starts expanded when uncontrolled. Default: false */
  defaultOpen?: boolean;
  /** Called with the new state when the list expands or collapses. */
  onOpenChange?: (open: boolean) => void;
  /** Prefix for row ids that `Citation` markers link to. Generated when omitted. */
  idPrefix?: string;
  /** Classes merged onto the root element. */
  className?: string;
  /** Override any built-in string. */
  labels?: Partial<CitationsMessages>;
}

export interface CitationProps {
  /** Id of the `CitationItem` this marker links to. */
  citationId: string;
  /** Number shown on the marker. */
  index: number;
  /** Must match the related Citations idPrefix. */
  idPrefix: string;
  /**
   * Accessible name for the marker. Defaults to `View citation {index}`. Include
   * the index so voice control users can say the number they see.
   */
  label?: string;
  /** Classes merged onto the marker link. */
  className?: string;
}

export interface CitationListProps {
  /** Sources listed in order, numbered from 1. */
  citations: CitationItem[];
  /** Prefix for row ids that `Citation` markers link to. Generated when omitted. */
  idPrefix?: string;
  /** The citation a marker just led to; its row is lit. */
  highlightedId?: string;
  /** Classes merged onto the root element. */
  className?: string;
}

export interface CitationStackProps {
  /** Sources whose favicons are stacked. */
  citations: CitationItem[];
  /** Most favicons to show. Default: 3 */
  limit?: number;
  /** Classes merged onto the root element. */
  className?: string;
}

function citationTargetId(prefix: string, citationId: string) {
  return `${prefix}-${citationId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function Citation({
  citationId,
  index,
  idPrefix,
  label,
  className,
}: CitationProps) {
  const t = useMessages("citations", citationsMessages);
  return (
    <a
      href={`#${citationTargetId(idPrefix, citationId)}`}
      aria-label={label ?? t("viewCitation", { index })}
      className={cn(
        // A foreground tint, not bg-muted: muted is the bubble colour, so a
        // muted marker would vanish inside a soft bubble.
        "mx-0.5 inline-flex min-w-4 -translate-y-0.5 items-center justify-center rounded-full bg-foreground/[0.07] px-1 py-0.5 text-[11px] font-medium leading-none text-muted-foreground no-underline outline-none transition-colors hover:bg-foreground/[0.12] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {index}
    </a>
  );
}

export function CitationFavicon({
  url,
  icon,
  className,
}: {
  /** Page whose site favicon is shown. A globe icon shows when absent or broken. */
  url?: string;
  /** Drawn instead of the favicon when truthy. */
  icon?: ReactNode;
  className?: string;
}) {
  const favicon = useFavicon(icon ? undefined : url);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-5 shrink-0 place-items-center text-muted-foreground [&>svg]:size-3.5",
        className,
      )}
    >
      {icon ? (
        icon
      ) : favicon.src ? (
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
          icon={citation.icon}
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
  highlighted,
}: {
  citation: CitationItem;
  index: number;
  idPrefix: string;
  highlighted: boolean;
}) {
  const content = (
    <>
      <CitationFavicon url={citation.url} icon={citation.icon} />
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
        <span className="grid size-5 place-items-center rounded-full bg-foreground/[0.05] text-[11px] font-medium tabular-nums text-muted-foreground">
          {index}
        </span>
        {citation.url ? (
          <ExternalLink className="size-3.5 text-muted-foreground/40 transition-colors group-hover/citation:text-muted-foreground" />
        ) : null}
      </span>
    </>
  );
  // The row a marker just led to is lit, so the reader sees which source they
  // landed on: `highlighted` from Citations, or `:target` after a plain jump.
  const className = cn(
    "group/citation flex scroll-my-3 items-center gap-2 rounded-lg px-1.5 py-1 outline-none transition-colors duration-200 hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring target:bg-foreground/[0.07]",
    highlighted && "bg-foreground/[0.07] hover:bg-foreground/[0.07]",
  );
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
  highlightedId,
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
              highlighted={citation.id === highlightedId}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Citations({
  citations,
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  idPrefix,
  className,
  labels,
}: CitationsProps) {
  const t = useMessages("citations", citationsMessages, labels);
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

  // A marker links to its source row. While the list is folded that row is
  // hidden, so the jump would land on nothing: open the list, then bring the
  // row into view once it is shown.
  const [highlightedId, setHighlightedId] = useState<string>();
  const latest = useRef({ currentOpen, setOpen, citations, reduce });
  useLayoutEffect(() => {
    latest.current = { currentOpen, setOpen, citations, reduce };
  });
  useEffect(() => {
    // Returns true when the hash names one of this list's sources.
    const reveal = (hash: string) => {
      const now = latest.current;
      const citation = now.citations.find(
        (item) => citationTargetId(resolvedPrefix, item.id) === hash,
      );
      if (!citation) return false;
      if (!now.currentOpen) now.setOpen(true);
      setHighlightedId(citation.id);
      // After the list has opened, bring the row just into view: no jump to
      // the top of the page, where a sticky header would cover it.
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({
          block: "nearest",
          behavior: now.reduce ? "auto" : "smooth",
        });
      }, 0);
      return true;
    };
    const onHash = () => reveal(decodeURIComponent(window.location.hash.slice(1)));
    // Marker clicks are handled here rather than as a plain jump, which
    // lands on nothing while the list is folded and pins the row under the
    // page header when it is open.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!link) return;
      if (reveal(decodeURIComponent(link.getAttribute("href")?.slice(1) ?? ""))) {
        event.preventDefault();
      }
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, [resolvedPrefix]);

  return (
    <div className={cn("w-full text-sm", className)}>
      <button
        type="button"
        aria-expanded={currentOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!currentOpen)}
        className="group -ml-1 flex min-h-8 items-center gap-2 rounded-full px-1 text-left text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BookOpenText className="size-4" />
        <span className="font-medium">{title ?? t("title")}</span>
        <span className="rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
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
          highlightedId={highlightedId}
          className="mt-1"
        />
      </AgentDisclosure>
    </div>
  );
}

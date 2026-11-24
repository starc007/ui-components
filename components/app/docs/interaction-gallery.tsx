"use client";

import { Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { Tooltip } from "@/components/motion/tooltip";
import { getPreview } from "@/components/previews";
import { AutoplayContext } from "@/components/previews/micro-interactions/autoplay";
import { componentPath } from "@/lib/component-paths";
import { EASE_OUT, EASE_OUT_CSS } from "@/lib/ease";
import { Link } from "@/lib/navigation";
import type { ComponentEntry } from "@/lib/registry";
import { cn } from "@/lib/utils";

const CATEGORY = "micro-interactions";

const FILTERS = ["all", "tap", "select", "feedback"] as const;
type Filter = (typeof FILTERS)[number];

/** How each interaction is used, and how tall its card is in the masonry. */
const CARDS: Record<string, { kind: Exclude<Filter, "all">; height: string }> = {
  "like-button": { kind: "tap", height: "h-56" },
  "bookmark-button": { kind: "tap", height: "h-48" },
  "upvote-button": { kind: "tap", height: "h-64" },
  "copy-button": { kind: "tap", height: "h-48" },
  "text-morph": { kind: "feedback", height: "h-64" },
  "follow-button": { kind: "tap", height: "h-48" },
  "star-rating": { kind: "select", height: "h-56" },
  "add-to-cart": { kind: "tap", height: "h-64" },
  "delete-button": { kind: "feedback", height: "h-56" },
  "download-button": { kind: "feedback", height: "h-48" },
  "send-button": { kind: "feedback", height: "h-56" },
  "refresh-button": { kind: "feedback", height: "h-48" },
  "message-status": { kind: "feedback", height: "h-48" },
  "notification-bell": { kind: "tap", height: "h-56" },
  "reaction-picker": { kind: "select", height: "h-64" },
  "share-button": { kind: "tap", height: "h-64" },
  "mute-toggle": { kind: "tap", height: "h-48" },
  "lock-toggle": { kind: "tap", height: "h-56" },
  "poll-vote": { kind: "select", height: "h-72" },
};

/**
 * Every micro interaction, live in its own card: try it right there, and
 * follow the name chip to its page. Pills filter by how it is used.
 */
export function InteractionGallery({ components }: { components: ComponentEntry[] }) {
  const t = useTranslations("Docs.category.micro-interactions");
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <section className="mt-8">
      <div className="flex justify-center">
        <Tabs value={filter} onValueChange={setFilter} variant="pill">
          <TabsList aria-label={t("filterLabel")}>
            {FILTERS.map((key) => (
              <TabsTrigger key={key} value={key}>
                {t(`filters.${key}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6 columns-1 gap-3 sm:columns-2 lg:columns-3">
        {/* Filtered-out cards hide rather than unmount, so a card keeps
            what you did in it and never reloads its preview. */}
        {components.map((component) => (
          <InteractionCard
            key={component.slug}
            component={component}
            hidden={filter !== "all" && CARDS[component.slug]?.kind !== filter}
          />
        ))}
      </div>
    </section>
  );
}

// Only devices that hover hide the controls until the card is hovered or focused.
const REVEAL =
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/card:opacity-100 [@media(hover:hover)]:group-hover/card:opacity-100";

function InteractionCard({ component, hidden }: { component: ComponentEntry; hidden: boolean }) {
  const t = useTranslations("Docs.category.micro-interactions");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px" });
  const reduce = useReducedMotion();
  const Preview = getPreview(CATEGORY, component.slug);
  // Cards start still; the play button runs the preview's demo loop.
  const [playing, setPlaying] = useState(false);
  const autoplay = useMemo(() => ({ playing }), [playing]);
  const playLabel = t(playing ? "pause" : "play", { name: component.name });

  return (
    <article
      ref={ref}
      hidden={hidden}
      className={cn(
        // Border only, no fill: the component is the only thing in the card.
        "group/card relative mb-3 flex break-inside-avoid items-center justify-center overflow-hidden rounded-3xl border border-border",
        CARDS[component.slug]?.height ?? "h-56",
        hidden && "hidden",
      )}
    >
      <AutoplayContext.Provider value={autoplay}>{inView && Preview ? <Preview /> : null}</AutoplayContext.Provider>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <Link
          href={componentPath(CATEGORY, component.slug)}
          prefetch={false}
          aria-label={t("open", { name: component.name })}
          className={cn(
            // A secondary pill: gray fill, no border, no icon.
            "inline-flex h-8 items-center rounded-full bg-muted px-3.5 text-xs font-medium text-foreground",
            "transition-[opacity,background-color] duration-200 hover:bg-muted/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            REVEAL,
          )}
          style={{ transitionTimingFunction: EASE_OUT_CSS }}
        >
          {component.name}
        </Link>
        {/* No demo loop with reduced motion, so no button for it. */}
        {reduce ? null : (
          <Tooltip content={playLabel} side="top">
            <button
              type="button"
              aria-label={playLabel}
              aria-pressed={playing}
              onClick={() => setPlaying((value) => !value)}
              className={cn(
                "relative inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground",
                "transition-[opacity,background-color] duration-200 hover:bg-muted/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                // Stays up while it plays, so it can always be paused.
                !playing && REVEAL,
              )}
              style={{ transitionTimingFunction: EASE_OUT_CSS }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={playing ? "pause" : "play"}
                  className="absolute inset-0 grid place-items-center"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.16, ease: EASE_OUT }}
                >
                  {playing ? (
                    <Pause aria-hidden="true" className="size-3.5 fill-current" strokeWidth={0} />
                  ) : (
                    <Play aria-hidden="true" className="ml-px size-3.5 fill-current" strokeWidth={0} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </Tooltip>
        )}
      </div>
    </article>
  );
}

"use client";

import { useInView } from "motion/react";
import { useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { getPreview } from "@/components/previews";
import { componentPath } from "@/lib/component-paths";
import { EASE_OUT_CSS } from "@/lib/ease";
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
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)} variant="pill">
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

function InteractionCard({ component, hidden }: { component: ComponentEntry; hidden: boolean }) {
  const t = useTranslations("Docs.category.micro-interactions");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px" });
  const Preview = getPreview(CATEGORY, component.slug);

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
      {inView && Preview ? <Preview /> : null}
      <Link
        href={componentPath(CATEGORY, component.slug)}
        prefetch={false}
        aria-label={t("open", { name: component.name })}
        className={cn(
          // A secondary pill: gray fill, no border, no icon.
          "absolute bottom-3 left-3 inline-flex h-8 items-center rounded-full bg-muted px-3.5 text-xs font-medium text-foreground",
          "transition-[opacity,background-color] duration-200 hover:bg-muted/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          // Only devices that hover hide it until the card is hovered or focused.
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/card:opacity-100 [@media(hover:hover)]:group-hover/card:opacity-100",
        )}
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      >
        {component.name}
      </Link>
    </article>
  );
}

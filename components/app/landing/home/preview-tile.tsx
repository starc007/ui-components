"use client";

import { ArrowUpRight } from "lucide-react";
import { useInView } from "motion/react";
import { useTranslations } from "use-intl";
import { useRef, useState } from "react";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { getPreview, previews } from "@/components/previews";
import { Link } from "@/lib/navigation";
import { componentPath } from "@/lib/component-paths";
import type { ComponentEntry } from "@/lib/registry";
import { cn } from "@/lib/utils";

/** The registry fields a tile reads, small enough to pass from a server page. */
export type TileComponent = Pick<ComponentEntry, "slug" | "name" | "badge" | "launchedAt"> & {
  examples?: { previewKey: string }[];
  /** The shadcn install name: the first variant's, or the slug. */
  installSlug: string;
};

/**
 * Compact gallery tile: a scaled live preview over a one-line caption. The
 * frame keeps its size before the preview mounts, so nothing shifts when it
 * scrolls into view.
 */
export function PreviewTile({
  component,
  category,
  className,
  maxScale = 0.78,
  caption = "inline",
  previewKey,
}: {
  component: TileComponent;
  category: string;
  className?: string;
  maxScale?: number;
  /** `inline` puts the name under the frame; `overlay` floats it in a corner. */
  caption?: "inline" | "overlay";
  /** A specific variant's preview, e.g. the newest one. */
  previewKey?: string;
}) {
  const t = useTranslations("Landing.card");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px 0px" });
  const [hover, setHover] = useState(false);
  const Preview = previewKey
    ? previews[previewKey]
    : getPreview(category, component.slug) ??
      (component.examples?.[0] ? previews[component.examples[0].previewKey] : undefined);

  return (
    <article
      ref={ref}
      className={cn("group/tile relative flex h-full min-h-0 flex-col", className)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Link
        href={componentPath(category, component.slug)}
        prefetch={false}
        aria-label={t("view", { name: component.name })}
        className="absolute inset-0 z-20 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-200 ease-out group-hover/tile:border-border-strong">
        {inView ? (
          <PreviewFit hover={hover} maxScale={maxScale}>
            {Preview ? <Preview /> : null}
          </PreviewFit>
        ) : (
          <div aria-hidden="true" className="m-2 mb-0 min-h-0 flex-1 rounded-xl bg-background" />
        )}
        {caption === "inline" ? (
          <div className="flex h-10 shrink-0 items-center justify-between gap-2 px-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-[13px] font-medium text-foreground">
                {component.name}
              </h3>
              {component.badge === "new" ? <NewBadge launchedAt={component.launchedAt} /> : null}
            </div>
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 ease-out group-hover/tile:opacity-100"
            />
          </div>
        ) : (
          <>
            <div aria-hidden="true" className="h-2 shrink-0" />
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-1.5">
              <span className="inline-flex h-6 items-center rounded-full border border-border bg-background/90 px-2.5 text-xs font-medium text-foreground backdrop-blur">
                {component.name}
              </span>
              {component.badge === "new" ? <NewBadge launchedAt={component.launchedAt} /> : null}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

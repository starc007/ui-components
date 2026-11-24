"use client";

import { useInView } from "motion/react";
import { useTranslations } from "use-intl";
import { useRef } from "react";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { previews } from "@/components/previews";
import { Link } from "@/lib/navigation";
import type { WallTile } from "./wall-picks";

/**
 * One wall tile: the real component, playable in place, with its name in a
 * pill that rises in on hover or focus. Touch screens have no hover, so the
 * pill stays visible there.
 */
export function LiveTile({ tile }: { tile: WallTile }) {
  const t = useTranslations("Landing.card");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px 0px" });
  const Preview = previews[tile.previewKey];

  return (
    <article
      ref={ref}
      className="group/tile relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-card"
    >
      {inView && Preview ? (
        <PreviewFit
          hover={false}
          interactive
          // Small controls render on a narrow stage and scale up to fill
          // more of the tile.
          stageWidth={tile.small ? 240 : undefined}
          maxScale={tile.small ? 1.35 : 0.9}
          className="m-0 rounded-none bg-transparent p-4"
        >
          <Preview />
        </PreviewFit>
      ) : (
        <div aria-hidden="true" className="min-h-0 flex-1" />
      )}
      {tile.isNew ? (
        <span className="pointer-events-none absolute top-3 left-3">
          <NewBadge launchedAt={tile.launchedAt ?? undefined} />
        </span>
      ) : null}
      <Link
        href={tile.href}
        prefetch={false}
        aria-label={t("view", { name: tile.name })}
        className="absolute bottom-3 left-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] translate-y-1 items-center rounded-full border border-border bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground opacity-0 outline-none backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out group-hover/tile:translate-y-0 group-hover/tile:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:translate-y-0 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
      >
        <span className="truncate">{tile.name}</span>
      </Link>
    </article>
  );
}

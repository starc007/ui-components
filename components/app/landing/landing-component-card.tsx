"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentEntry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { getPreview } from "@/components/previews";

export function LandingComponentCard({
  component,
  category = "motion",
}: {
  component: ComponentEntry;
  category?: string;
}) {
  const Preview = getPreview(category, component.slug);
  const [hover, setHover] = useState(false);

  return (
    <article
      className="group/card relative h-72"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Link
        href={`/components/${category}/${component.slug}`}
        aria-label={`View ${component.name}`}
        className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-card transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] contain-[paint]">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <h3 className="truncate font-pixel text-base font-medium text-foreground">
            {component.name}
          </h3>
          {component.badge === "new" ? <NewBadge /> : null}
        </div>

        <PreviewFit
          hover={hover}
          overlay={
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-transparent backdrop-blur-0 transition-[background-color,backdrop-filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:bg-card/55 group-hover/card:backdrop-blur-md group-focus-within/card:bg-card/55 group-focus-within/card:backdrop-blur-md">
              <div className="absolute inset-x-0 bottom-0 translate-y-full px-4 py-3 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-y-0 group-focus-within/card:translate-y-0">
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {component.description}
                </p>
              </div>
            </div>
          }
        >
          {Preview ? <Preview /> : null}
        </PreviewFit>
      </div>
    </article>
  );
}

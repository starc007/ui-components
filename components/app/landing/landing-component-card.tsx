"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "motion/react";
import { useRef, useState } from "react";
import type { ComponentEntry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { getPreview } from "@/components/previews";
import { EASE_OUT_CSS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "wide" | "feature";

const VARIANT_SPAN: Record<CardVariant, string> = {
  default: "",
  wide: "sm:col-span-2",
  feature: "sm:col-span-2 sm:row-span-2",
};

export function LandingComponentCard({
  component,
  category = "motion",
  variant = "default",
}: {
  component: ComponentEntry;
  category?: string;
  variant?: CardVariant;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const shouldRenderPreview = useInView(cardRef, {
    once: true,
    margin: "400px 0px",
  });
  const Preview = getPreview(category, component.slug);
  const [hover, setHover] = useState(false);
  const feature = variant === "feature";

  return (
    <article
      ref={cardRef}
      className={cn("group/card relative h-full", VARIANT_SPAN[variant])}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Link
        href={`/components/${category}/${component.slug}`}
        prefetch={false}
        aria-label={`View ${component.name}`}
        className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-300 contain-[paint] group-hover/card:border-border-strong"
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      >
        {shouldRenderPreview ? (
          <PreviewFit hover={hover} maxScale={feature ? 1 : 0.82}>
            {Preview ? <Preview /> : null}
          </PreviewFit>
        ) : (
          <div
            aria-hidden="true"
            className="relative m-2 mb-0 min-h-0 flex-1 rounded-[1.25rem] bg-background"
          />
        )}

        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "truncate font-display font-semibold tracking-tight text-foreground",
                  feature ? "text-lg" : "text-[0.95rem]",
                )}
              >
                {component.name}
              </h3>
              {component.badge === "new" ? <NewBadge /> : null}
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
              {component.description}
            </p>
          </div>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,transform] duration-300 group-hover/card:translate-x-0 group-hover/card:opacity-100"
            style={{ transitionTimingFunction: EASE_OUT_CSS }}
          />
        </div>
      </div>
    </article>
  );
}

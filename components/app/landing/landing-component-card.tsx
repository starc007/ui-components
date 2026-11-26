"use client";

import { componentPath } from "@/lib/component-paths";

import { useInView } from "motion/react";
import { useTranslations } from "use-intl";
import { useRef, useState } from "react";
import type { ComponentEntry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { PreviewFit } from "@/components/app/landing/preview-fit";
import { getPreview, previews } from "@/components/previews";
import { Link } from "@/lib/navigation";
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
  previewKey,
  id,
  href,
  name,
  badge,
  launchedAt,
}: {
  component: ComponentEntry;
  category?: string;
  variant?: CardVariant;
  previewKey?: string;
  /** Anchor id, so old `#variant` links land on the card. */
  id?: string;
  /** Overrides for a card that stands for one variant, not the whole page. */
  href?: string;
  name?: string;
  badge?: "new" | null;
  launchedAt?: string | null;
}) {
  const title = name ?? component.name;
  const isNew = (badge === undefined ? component.badge : badge) === "new";
  const newSince = (launchedAt === undefined ? component.launchedAt : launchedAt) ?? undefined;
  const t = useTranslations("Landing.card");
  const cardRef = useRef<HTMLElement>(null);
  const shouldRenderPreview = useInView(cardRef, {
    once: true,
    margin: "0px",
  });
  // Components documented only through variants have no page-level preview,
  // so they show their first variant.
  const Preview = previewKey
    ? previews[previewKey]
    : (getPreview(category, component.slug) ??
      (component.examples?.[0] ? previews[component.examples[0].previewKey] : undefined));
  const [hover, setHover] = useState(false);
  const feature = variant === "feature";

  return (
    <article
      ref={cardRef}
      id={id}
      className={cn("group/card relative h-full scroll-mt-24", VARIANT_SPAN[variant])}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Link
        href={href ?? componentPath(category, component.slug)}
        prefetch={false}
        aria-label={t("view", { name: title })}
        className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-card contain-[paint]">
        {shouldRenderPreview ? (
          <PreviewFit hover={hover} maxScale={feature ? 1 : 0.82}>
            {Preview ? <Preview /> : null}
          </PreviewFit>
        ) : (
          <div
            aria-hidden="true"
            className="relative m-2 mb-0 min-h-0 flex-1 rounded-2xl bg-background"
          />
        )}

        <div className="flex min-w-0 shrink-0 items-center gap-2 px-4 py-3.5">
          <h3
            className={cn(
              "truncate font-display font-medium tracking-tight text-foreground",
              feature ? "text-lg" : "text-base",
            )}
          >
            {title}
          </h3>
          {isNew ? <NewBadge launchedAt={newSince} /> : null}
        </div>
      </div>
    </article>
  );
}

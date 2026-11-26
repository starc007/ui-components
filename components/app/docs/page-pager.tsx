import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { Tooltip } from "@/components/motion/tooltip";
import { Link } from "@/lib/navigation";
import { componentPath } from "@/lib/component-paths";
import { sidebarOrder } from "@/lib/component-status";
import { findCategory } from "@/lib/registry";
import { cn } from "@/lib/utils";

const LINK_CLASS =
  "group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-border px-4 py-3 outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring";

type Neighbor = { name: string; href: string };

/** Previous and next components in the category, in the sidebar's order. */
function pagerNeighbors(
  category: string,
  slug: string,
): { prev?: Neighbor; next?: Neighbor } | null {
  const cat = findCategory(category);
  if (!cat) return null;
  const items = sidebarOrder(cat.components, (item) => item.name);
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const link = (item: (typeof items)[number] | undefined) =>
    item ? { name: item.name, href: componentPath(category, item.slug) } : undefined;
  const prev = link(items[index - 1]);
  const next = link(items[index + 1]);
  return prev || next ? { prev, next } : null;
}

/** Previous and next components as cards, at the foot of a component page. */
export function PagePager({ category, slug }: { category: string; slug: string }) {
  const t = useTranslations("Docs.pager");
  const neighbors = pagerNeighbors(category, slug);
  if (!neighbors) return null;
  const { prev, next } = neighbors;

  return (
    <nav aria-label={t("label")} className="mt-12 flex flex-col gap-3 sm:flex-row">
      {prev ? (
        <Link href={prev.href} className={LINK_CLASS}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft
              aria-hidden="true"
              className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            {t("previous")}
          </span>
          <span className="truncate text-sm font-medium text-foreground">{prev.name}</span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden flex-1 sm:block" />
      )}
      {next ? (
        <Link href={next.href} className={cn(LINK_CLASS, "sm:items-end sm:text-right")}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {t("next")}
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </span>
          <span className="max-w-full truncate text-sm font-medium text-foreground">{next.name}</span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden flex-1 sm:block" />
      )}
    </nav>
  );
}

// Matches Copy Page beside it: 32px tall, the same tinted fill, round.
const ARROW_CLASS =
  "inline-flex size-8 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground outline-none transition-colors hover:bg-foreground/[0.11] focus-visible:ring-2 focus-visible:ring-ring";
const ARROW_DISABLED =
  "inline-flex size-8 items-center justify-center rounded-full bg-foreground/[0.03] text-muted-foreground/50";

/**
 * The same previous and next components as round arrow buttons, for the
 * top of a component page beside Copy Page. At the first or last component
 * of a category the missing side stays in place, dimmed, so the other arrow
 * does not shift.
 */
export function PagePagerButtons({
  category,
  slug,
  className,
}: {
  category: string;
  slug: string;
  className?: string;
}) {
  const t = useTranslations("Docs.pager");
  const neighbors = pagerNeighbors(category, slug);
  if (!neighbors) return null;
  const { prev, next } = neighbors;

  // A plain group, not a second `nav`: the pager at the foot of the page is
  // the landmark, and two landmarks with one name would be ambiguous.
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      {prev ? (
        <Tooltip content={t("previousNamed", { name: prev.name })} side="bottom">
          <Link
            href={prev.href}
            aria-label={t("previousNamed", { name: prev.name })}
            className={ARROW_CLASS}
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
          </Link>
        </Tooltip>
      ) : (
        <span aria-hidden="true" className={ARROW_DISABLED}>
          <ArrowLeft className="size-3.5" />
        </span>
      )}
      {next ? (
        <Tooltip content={t("nextNamed", { name: next.name })} side="bottom">
          <Link
            href={next.href}
            aria-label={t("nextNamed", { name: next.name })}
            className={ARROW_CLASS}
          >
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </Tooltip>
      ) : (
        <span aria-hidden="true" className={ARROW_DISABLED}>
          <ArrowRight className="size-3.5" />
        </span>
      )}
    </div>
  );
}

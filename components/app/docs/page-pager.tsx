import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { componentPath } from "@/lib/component-paths";
import { moveNewItemsToTop } from "@/lib/component-status";
import { findCategory } from "@/lib/registry";
import { cn } from "@/lib/utils";

const LINK_CLASS =
  "group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-border px-4 py-3 outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring";

/** Previous and next components in the category, in the sidebar's order. */
export function PagePager({ category, slug }: { category: string; slug: string }) {
  const cat = findCategory(category);
  if (!cat) return null;
  const items = moveNewItemsToTop(cat.components);
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const prev = items[index - 1];
  const next = items[index + 1];
  if (!prev && !next) return null;

  return (
    <nav aria-label="Previous and next components" className="mt-12 flex flex-col gap-3 sm:flex-row">
      {prev ? (
        <Link href={componentPath(category, prev.slug)} className={LINK_CLASS}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft
              aria-hidden="true"
              className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            Previous
          </span>
          <span className="truncate text-sm font-medium text-foreground">{prev.name}</span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden flex-1 sm:block" />
      )}
      {next ? (
        <Link href={componentPath(category, next.slug)} className={cn(LINK_CLASS, "sm:items-end sm:text-right")}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Next
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

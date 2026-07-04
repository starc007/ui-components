import Link from "next/link";
import { NewBadge } from "@/components/app/docs/new-badge";

export function ComponentCard({
  categorySlug,
  slug,
  name,
  description,
  badge,
}: {
  categorySlug: string;
  slug: string;
  name: string;
  description: string;
  badge?: "new";
}) {
  return (
    <Link
      href={`/components/${categorySlug}/${slug}`}
      className="group/card relative flex h-40 flex-col overflow-hidden rounded-3xl bg-card transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] contain-[paint] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <h3 className="truncate font-pixel text-base font-medium text-foreground">
          {name}
        </h3>
        {badge === "new" ? <NewBadge /> : null}
      </div>

      <div className="mx-2 mb-2 flex min-h-0 flex-1 items-start overflow-hidden rounded-3xl bg-background px-4 py-4 transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:bg-background/80 group-focus-visible/card:bg-background/80">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

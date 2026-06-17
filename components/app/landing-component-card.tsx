import Link from "next/link";
import type { ComponentEntry } from "@/lib/registry";
import { NewBadge } from "@/components/app/new-badge";
import { getPreview } from "@/components/previews";

export function LandingComponentCard({
  component,
  category = "motion",
}: {
  component: ComponentEntry;
  category?: string;
}) {
  const Preview = getPreview(category, component.slug);

  return (
    <article className="group/card relative h-64">
      <Link
        href={`/components/${category}/${component.slug}`}
        aria-label={`View ${component.name}`}
        className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
      />
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-(--color-bg-elev) transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] contain-[paint]">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <h3 className="truncate font-pixel text-base font-medium text-(--color-fg)">
            {component.name}
          </h3>
          {component.badge === "new" ? <NewBadge /> : null}
        </div>

        <div className="relative mx-2 mb-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-(--color-bg) px-5 py-5 contain-[paint]">
          <div className="pointer-events-none flex w-full max-w-full origin-center scale-80 items-center justify-center overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] contain-[paint] group-hover/card:scale-[0.84] group-focus-within/card:scale-[0.84] [&_*]:!cursor-default">
            {Preview ? <Preview /> : null}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 rounded-b-3xl bg-(--color-bg-elev)/60 px-4 py-3 opacity-0 backdrop-blur-md transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100">
            <p className="line-clamp-2 text-xs leading-relaxed text-(--color-fg-muted)">
              {component.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

import { ArrowRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { Link } from "@/lib/navigation";
import { seoPagePath, seoPages } from "@/lib/seo-pages";
import type { SeoPageKind } from "@/lib/seo-pages/types";

/** The /guides and /alternatives lists: one card per landing page, newest first. */
export function SeoIndexPage({ kind }: { kind: SeoPageKind }) {
  const t = useTranslations(`Native.seoIndex.${kind}`);
  const pages = [...seoPages(kind)].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">{t("heading")}</h1>
        <p className="mt-3 text-muted-foreground">{t("intro")}</p>
      </header>
      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <li key={page.slug} className="flex">
            <Link
              href={seoPagePath(kind, page.slug)}
              className="group flex w-full flex-col rounded-2xl border border-border p-4 outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-start gap-2 text-sm font-medium text-foreground">
                <span className="min-w-0 flex-1">{page.heading}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </span>
              <span className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {page.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

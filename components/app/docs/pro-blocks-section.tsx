import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { proBlocksFor } from "@/lib/pro-blocks";

/**
 * Links from a free page to related beUI Pro blocks. Renders nothing when
 * `lib/pro-blocks.ts` has no entry for `pageKey`.
 */
export function ProBlocksSection({
  pageKey,
  heading = "usedIn",
  className,
}: {
  pageKey: string;
  heading?: "usedIn" | "builtWith" | "mobile";
  className?: string;
}) {
  const t = useTranslations("Docs.proBlocks");
  const blocks = proBlocksFor(pageKey);
  if (blocks.length === 0) return null;
  const id = `pro-blocks-${pageKey.replace(/\//g, "-")}`;
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="text-sm font-semibold text-foreground">
        {t(heading)}
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <li key={block.href}>
            <a
              href={block.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm outline-none transition-colors hover:border-(--color-border-strong) focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {block.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{t("pro")}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
              <span className="sr-only">{t("opensInNewTab")}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

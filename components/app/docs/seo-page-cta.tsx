import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { LandingButton } from "@/components/app/landing/home/landing-button";
import { Link } from "@/lib/navigation";
import { proLink } from "@/lib/pro-blocks";
import { cn } from "@/lib/utils";

/**
 * The way in from a guide or comparison page: free components first, beUI Pro
 * second. `inline` is a link row under the intro; `card` closes the page.
 * `campaign` tags the Pro link, e.g. `guide_ai_chat_animations_react`.
 */
export function SeoPageCta({
  layout,
  browseHref,
  campaign,
  className,
}: {
  layout: "inline" | "card";
  browseHref: string;
  campaign: string;
  className?: string;
}) {
  const t = useTranslations("Native.article");
  const proHref = proLink("/", `${campaign}_${layout === "card" ? "end" : "intro"}`);

  if (layout === "inline") {
    return (
      <p className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-sm", className)}>
        <Link
          href={browseHref}
          className="group inline-flex items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {t("browse")}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
        <a
          href={proHref}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
        >
          {t("explorePro")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
          <span className="sr-only">{t("opensInNewTab")}</span>
        </a>
      </p>
    );
  }

  return (
    <section
      aria-labelledby="seo-page-cta"
      className={cn("rounded-2xl border border-border p-5 sm:p-6", className)}
    >
      <h2 id="seo-page-cta" className="text-base font-medium text-foreground">
        {t("ctaHeading")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("ctaBody")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <LandingButton href={browseHref}>
          {t("browse")}
          <ArrowRight aria-hidden="true" />
        </LandingButton>
        <LandingButton
          href={proHref}
          target="_blank"
          rel="noreferrer noopener"
          variant="outline"
        >
          {t("explorePro")}
          <ArrowUpRight aria-hidden="true" />
          <span className="sr-only">{t("opensInNewTab")}</span>
        </LandingButton>
      </div>
    </section>
  );
}

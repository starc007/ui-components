import { ArrowRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { Link } from "@/i18n/navigation";

const SIDEBAR_SPONSORS = [
  {
    name: "Tracwell",
    tagline: "tracwell",
    domain: "tracwell.app",
    icon: "tracwell-icon",
  },
  {
    name: "Illos",
    tagline: "illos",
    domain: "illos.dev",
    icon: "illos-icon",
  },
] as const;

export function SponsorCard() {
  const t = useTranslations("Docs.sponsorCard");
  return (
    <section aria-label={t("title")} className="mt-4 rounded-2xl border border-border p-3">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        {t("title")}
      </h2>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("tier")}
      </p>
      <div className="mt-2 flex flex-col gap-3">
        {SIDEBAR_SPONSORS.map((sponsor) => (
          <a
            key={sponsor.domain}
            href={`https://${sponsor.domain}/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=right_sidebar`}
            target="_blank"
            rel="noreferrer noopener"
            className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div className="flex items-center gap-2">
              <img
                src={`/sponsors/${sponsor.icon}-light.svg`}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 dark:hidden"
              />
              <img
                src={`/sponsors/${sponsor.icon}-dark.svg`}
                alt=""
                width={40}
                height={40}
                className="hidden size-10 shrink-0 dark:block"
              />
              <div className="min-w-0">
                <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {sponsor.name}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(`taglines.${sponsor.tagline}`)}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      <Link
        href="/sponsors"
        className="mt-4 flex items-center justify-between gap-2 rounded-sm text-xs font-medium text-foreground decoration-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {t("become")}
        <ArrowRight aria-hidden="true" className="size-4 text-accent" />
      </Link>
    </section>
  );
}

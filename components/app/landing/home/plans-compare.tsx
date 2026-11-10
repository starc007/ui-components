import { ArrowRight, ArrowUpRight, Check, Minus } from "lucide-react";
import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";
import { PRO_URL } from "./landing-data";
import { SectionTitle } from "./section-title";

// Labels live in messages Landing.plans.rows.
const ROWS = [
  { id: "components", free: true },
  { id: "registry", free: true },
  { id: "native", free: true },
  { id: "license", free: true },
  { id: "blocks", free: false },
  { id: "mobile", free: false },
  { id: "templates", free: false },
  { id: "illustrations", free: false },
  { id: "agents", free: false },
  { id: "projects", free: false },
] as const;

function Mark({ on, pro, label }: { on: boolean; pro?: boolean; label: string }) {
  return on ? (
    <Check aria-label={label} className={cn("size-4", pro ? "text-primary" : "text-foreground")} />
  ) : (
    <Minus aria-label={label} className="size-4 text-muted-foreground/50" />
  );
}

/** Free and Pro as one comparison table instead of two marketing cards. */
export function PlansCompare({
  placement,
  className,
}: {
  placement: string;
  className?: string;
}) {
  const t = useTranslations("Landing.plans");
  const tHero = useTranslations("Landing.hero");
  const included = t("included");
  const notIncluded = t("notIncluded");
  return (
    <section aria-labelledby="landing-plans" className={cn("mx-auto max-w-6xl px-4", className)}>
      <SectionTitle id="landing-plans" label={t("label")} title={t("title")} />
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-[13px]">
          <caption className="sr-only">{t("caption")}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-3 font-normal text-muted-foreground">
                <span className="sr-only">{t("feature")}</span>
              </th>
              <th scope="col" className="w-24 px-4 py-3 font-medium sm:w-40">
                beUI
                <span className="block text-xs font-normal text-muted-foreground">{t("free")}</span>
              </th>
              <th scope="col" className="w-24 px-4 py-3 font-medium text-primary sm:w-40">
                beUI Pro
                <span className="block text-xs font-normal text-muted-foreground">{t("lifetime")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-2.5 font-normal text-foreground">
                  {t(`rows.${row.id}`)}
                </th>
                <td className="px-4 py-2.5">
                  <Mark on={row.free} label={row.free ? included : notIncluded} />
                </td>
                <td className="px-4 py-2.5">
                  <Mark on pro label={included} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="px-4 py-3" />
              <td className="px-4 py-3">
                <LandingButton href="/components/motion" variant="outline" className="px-3">
                  {t("browse")}
                  <ArrowRight aria-hidden="true" />
                </LandingButton>
              </td>
              <td className="px-4 py-3">
                <LandingButton
                  href={PRO_URL(placement)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3"
                >
                  {t("getPro")}
                  <ArrowUpRight aria-hidden="true" />
                  <span className="sr-only"> {tHero("opensInNewTab")}</span>
                </LandingButton>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

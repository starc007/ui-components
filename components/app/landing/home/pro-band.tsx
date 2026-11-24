"use client";

import { Check } from "lucide-react";
import { useTranslations } from "use-intl";
import { blackFridayProUrl, formatUsd, useBlackFridayLive } from "@/components/app/black-friday";
import { PRO_BUNDLE_PRICE_USD } from "@/components/app/docs/pro-card";
import { ProSalePrice } from "@/components/app/docs/pro-sale-price";
import { ProCta } from "@/components/app/pro-cta";
import { cn } from "@/lib/utils";
import { PRO_URL } from "./landing-data";
import { SectionHeading } from "./section-heading";

const FEATURES = ["blocks", "mobile", "templates", "illustrations"] as const;

/** beUI Pro in one slim card: a two-tone pitch, what's in it, the price and one button. */
export function ProBand({ placement, className }: { placement: string; className?: string }) {
  const t = useTranslations("Landing.pro");
  const tHero = useTranslations("Landing.hero");
  const onSale = useBlackFridayLive();

  return (
    <section aria-labelledby="landing-pro" className={cn("mx-auto max-w-6xl px-4", className)}>
      <div className="rounded-2xl bg-card p-6 sm:p-8">
        <SectionHeading
          id="landing-pro"
          title={t("title")}
          muted={t("titleMuted")}
          className="mb-0"
          action={
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <ProCta
                href={onSale ? blackFridayProUrl(placement) : PRO_URL(placement)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t("explore")}
                <span className="sr-only"> {tHero("opensInNewTab")}</span>
              </ProCta>
              {onSale ? (
                <ProSalePrice dollars={PRO_BUNDLE_PRICE_USD} />
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("price", { price: formatUsd(PRO_BUNDLE_PRICE_USD) })}
                </p>
              )}
            </div>
          }
        />
        <ul className="mt-6 flex flex-wrap gap-2">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs text-foreground"
            >
              <Check aria-hidden="true" className="size-3.5 text-muted-foreground" />
              {t(`features.${feature}`)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

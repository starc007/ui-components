"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  blackFriday,
  blackFridayProUrl,
  formatUsd,
  useBlackFridayLive,
} from "@/components/app/black-friday";
import { ProSalePrice } from "@/components/app/docs/pro-sale-price";
import { RainbowCta } from "@/components/app/rainbow-cta";

/** Web + Mobile lifetime on pro.beui.dev. */
const PRO_BUNDLE_PRICE_USD = 249;

const PRO_URL =
  "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=component_sidebar";

export function ProCard() {
  const t = useTranslations("Docs.proCard");
  const tSale = useTranslations("Docs.proSale");
  const onSale = useBlackFridayLive();

  return (
    <section
      aria-labelledby="beui-pro-card-title"
      className="rounded-3xl border border-border bg-background p-2"
    >
      <div className="flex h-24 items-center justify-center rounded-2xl bg-linear-to-br from-accent/30 via-accent/10 to-card">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
            beUI
          </span>
          <span className="rounded-md border border-accent/40 bg-background/60 px-2 py-0.5 text-base font-medium text-foreground">
            Pro
          </span>
        </div>
      </div>
      <div className="px-2 pt-3 pb-3">
        <h2
          id="beui-pro-card-title"
          className="text-lg font-semibold leading-tight tracking-tight text-foreground"
        >
          {onSale ? tSale("heading", { percent: blackFriday.percent }) : t("heading")}
        </h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {t("summary")}
        </p>
        {onSale ? (
          <ProSalePrice dollars={PRO_BUNDLE_PRICE_USD} />
        ) : (
          <p className="mt-3 text-xs leading-5 font-medium text-foreground">
            {t("price", { price: formatUsd(PRO_BUNDLE_PRICE_USD) })}
          </p>
        )}
      </div>
      <RainbowCta
        href={onSale ? blackFridayProUrl("component_sidebar") : PRO_URL}
        target="_blank"
        rel="noreferrer noopener"
        shape="pill"
        className="w-full"
        innerClassName="py-2"
      >
        {t("explore")}
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </RainbowCta>
    </section>
  );
}

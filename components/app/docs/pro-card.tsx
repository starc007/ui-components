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
      className="rounded-2xl border border-border bg-background p-2"
    >
      <div className="flex h-14 items-center justify-center rounded-lg bg-linear-to-br from-accent/30 via-accent/10 to-card">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            beUI
          </span>
          <span className="rounded-full border border-accent/40 bg-background/60 px-2 py-0.5 text-xs font-medium text-foreground">
            Pro
          </span>
        </div>
      </div>
      <div className="px-1.5 pt-2.5 pb-2.5">
        <h2
          id="beui-pro-card-title"
          className="text-sm font-medium leading-tight text-foreground"
        >
          {onSale ? tSale("heading", { percent: blackFriday.percent }) : t("heading")}
        </h2>
        <p className="mt-1 text-xs leading-4.5 text-muted-foreground">
          {t("summary")}
        </p>
        {onSale ? (
          <ProSalePrice dollars={PRO_BUNDLE_PRICE_USD} />
        ) : (
          <p className="mt-2 text-xs leading-5 font-medium text-foreground">
            {t("price", { price: formatUsd(PRO_BUNDLE_PRICE_USD) })}
          </p>
        )}
      </div>
      <RainbowCta
        href={onSale ? blackFridayProUrl("component_sidebar") : PRO_URL}
        target="_blank"
        rel="noreferrer noopener"
        shape="pill"
        className="min-h-9 w-full text-xs"
        innerClassName="py-1.5"
      >
        {t("explore")}
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </RainbowCta>
    </section>
  );
}

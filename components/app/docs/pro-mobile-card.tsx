"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { blackFriday, blackFridayProUrl, useBlackFridayLive } from "@/components/app/black-friday";
import { ProSalePrice } from "@/components/app/docs/pro-sale-price";
import { RainbowCta } from "@/components/app/rainbow-cta";

/** Mobile lifetime on pro.beui.dev. */
const PRO_MOBILE_PRICE_USD = 149;

const PRO_MOBILE_URL =
  "https://pro.beui.dev/mobile?utm_source=beui&utm_medium=referral&utm_campaign=mobile_launch&utm_content=native_sidebar";

/** Sidebar promo on React Native pages for beUI Pro for mobile. */
export function ProMobileCard() {
  const t = useTranslations("Docs.proMobileCard");
  const tSale = useTranslations("Docs.proSale");
  const onSale = useBlackFridayLive();

  return (
    <section
      aria-labelledby="beui-pro-mobile-card-title"
      className="rounded-2xl border border-border bg-background p-2"
    >
      <div className="flex h-14 items-center justify-center rounded-lg bg-linear-to-br from-accent/30 via-accent/10 to-card">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            beUI
          </span>
          <span className="rounded-full border border-accent/40 bg-background/60 px-2 py-0.5 text-xs font-medium text-foreground">
            Pro Mobile
          </span>
        </div>
      </div>
      <div className="px-1.5 pt-2.5 pb-2.5">
        <h2
          id="beui-pro-mobile-card-title"
          className="text-sm font-medium leading-tight text-foreground"
        >
          {onSale ? tSale("heading", { percent: blackFriday.percent }) : t("title")}
        </h2>
        <p className="mt-1 text-xs leading-4.5 text-muted-foreground">
          {t("description")}
        </p>
        {onSale ? <ProSalePrice dollars={PRO_MOBILE_PRICE_USD} /> : null}
      </div>
      <RainbowCta
        href={onSale ? blackFridayProUrl("native_sidebar", "/mobile") : PRO_MOBILE_URL}
        target="_blank"
        rel="noreferrer noopener"
        shape="pill"
        className="min-h-9 w-full text-xs"
        innerClassName="py-1.5"
      >
        {t("cta")}
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </RainbowCta>
    </section>
  );
}

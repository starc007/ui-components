import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { RainbowCta } from "@/components/app/rainbow-cta";

/** Sidebar promo on React Native pages for beUI Pro for mobile. */
export function ProMobileCard() {
  const t = useTranslations("Docs.proMobileCard");
  return (
    <section
      aria-labelledby="beui-pro-mobile-card-title"
      className="rounded-3xl border border-border bg-background p-2"
    >
      <div className="flex h-24 items-center justify-center rounded-2xl bg-linear-to-br from-accent/30 via-accent/10 to-card">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
            beUI
          </span>
          <span className="rounded-md border border-accent/40 bg-background/60 px-2 py-0.5 text-base font-medium text-foreground">
            Pro Mobile
          </span>
        </div>
      </div>
      <div className="px-2 pt-3 pb-3">
        <h2
          id="beui-pro-mobile-card-title"
          className="text-lg font-semibold leading-tight tracking-tight text-foreground"
        >
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <RainbowCta
        href="https://pro.beui.dev/mobile?utm_source=beui&utm_medium=referral&utm_campaign=mobile_launch&utm_content=native_sidebar"
        target="_blank"
        rel="noreferrer noopener"
        shape="pill"
        className="w-full"
        innerClassName="py-2"
      >
        {t("cta")}
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </RainbowCta>
    </section>
  );
}

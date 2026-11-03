import { useTranslations } from "next-intl";
import { PressLink } from "@/components/app/press-link";
import summary from "@/lib/native/summary.json";
import { INSTALLABLE_COUNT } from "@/lib/registry";
import { HeroEyebrow } from "./hero-eyebrow";
import styles from "./landing.module.css";

// The CTA glow's powder blue and peach; on dark, translucent tints of them.
const react =
  "[--mark-bg:#d4eaf4] [--mark-fg:#0d3a50] dark:[--mark-bg:rgb(126_192_222/0.2)] dark:[--mark-fg:#cdebf7]";
const reactNative =
  "[--mark-bg:#f8dcc4] [--mark-fg:#4a2310] dark:[--mark-bg:rgb(244_178_124/0.2)] dark:[--mark-fg:#fbdcc3]";

export function Hero() {
  const t = useTranslations("Landing.hero");
  return (
    <div className="mx-auto max-w-3xl text-center">
      <HeroEyebrow count={INSTALLABLE_COUNT} nativeCount={summary.variants} />

      <h1 className="mt-5 text-balance text-5xl font-medium tracking-tight md:text-6xl">
        {t("headlineLine1")}
        <br />
        {t.rich("headlineLine2Native", {
          react: (chunks) => (
            <mark className={`${styles.mark} ${react}`}>{chunks}</mark>
          ),
          native: (chunks) => (
            <mark
              className={`${styles.mark} ${styles.markNative} ${reactNative}`}
            >
              {chunks}
            </mark>
          ),
        })}
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
        {t("subtitleNative")}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <PressLink
          href="https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=hero"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.primaryLink}
        >
          {t("explorePro")}
          <span className="sr-only"> {t("opensInNewTab")}</span>
        </PressLink>
        <PressLink href="/components/motion" className={styles.secondaryLink}>
          {t("browseComponents")}
        </PressLink>
      </div>
    </div>
  );
}

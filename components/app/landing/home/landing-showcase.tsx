import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { InstallCommand } from "@/components/app/docs/install-command";
import { HeroEyebrow } from "@/components/app/landing/hero-eyebrow";
import styles from "@/components/app/landing/landing.module.css";
import { registry } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { CategoryExplorer } from "./category-explorer";
import { ContactStrip } from "./contact-strip";
import { FaqList } from "./faq-list";
import { LandingButton } from "./landing-button";
import {
  landingCategories,
  NATIVE_COUNT,
  newEntries,
  PRO_URL,
  resolveEntries,
  WEB_COUNT,
} from "./landing-data";
import { NativeBand } from "./native-band";
import { PlansCompare } from "./plans-compare";
import { PreviewTile } from "./preview-tile";
import { SectionTitle } from "./section-title";
import { SponsorRow } from "./sponsor-row";
import { TestimonialRows } from "./testimonial-rows";

const react =
  "[--mark-bg:#d4eaf4] [--mark-fg:#0d3a50] dark:[--mark-bg:rgb(126_192_222/0.2)] dark:[--mark-fg:#cdebf7]";
const reactNative =
  "[--mark-bg:#f8dcc4] [--mark-fg:#4a2310] dark:[--mark-bg:rgb(244_178_124/0.2)] dark:[--mark-fg:#fbdcc3]";

// Bento order and spans for a four-column, three-row board. The first tile
// takes a 2x2 block so the board leads with one rich interaction.
const BENTO = [
  "blocks/command-palette",
  "blocks/dynamic-island",
  "motion/tabs",
  "motion/switch",
  "motion/animated-toast-stack",
  "motion/action-swap",
  "blocks/otp-input",
];
const SPANS = [
  "sm:col-span-2 lg:row-span-2",
  "sm:col-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "",
];

/**
 * The home page, gallery first. A compact centered hero, then a bento
 * board of live components right under the fold, the numbers, and a tabbed
 * explorer across every section.
 */
export function LandingShowcase() {
  const t = useTranslations("Landing");
  const bento = resolveEntries(registry, BENTO);
  const categories = landingCategories(registry);
  const fresh = newEntries(registry);
  const stats = [
    { value: String(WEB_COUNT), label: t("home.stats.web") },
    { value: String(NATIVE_COUNT), label: t("home.stats.native") },
    { value: String(categories.length), label: t("home.stats.sections") },
    { value: "MIT", label: t("home.stats.license") },
  ];
  const mark = {
    react: (chunks: ReactNode) => <mark className={cn(styles.mark, react)}>{chunks}</mark>,
    native: (chunks: ReactNode) => (
      <mark className={cn(styles.mark, styles.markNative, reactNative)}>{chunks}</mark>
    ),
  };

  return (
    <div className="relative">
      <section className="mx-auto max-w-2xl px-4 pt-14 pb-10 text-center sm:pt-20">
        <HeroEyebrow count={WEB_COUNT} nativeCount={NATIVE_COUNT} />
        <h1 className="mt-5 text-balance text-[2.25rem] font-medium leading-[1.08] tracking-tight sm:text-5xl">
          {t.rich("hero.headline", mark)}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
          {t("hero.subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <LandingButton href="/components/motion">
            {t("hero.browseComponents")}
            <ArrowRight aria-hidden="true" />
          </LandingButton>
          <LandingButton
            href={PRO_URL("hero")}
            target="_blank"
            rel="noreferrer noopener"
            variant="outline"
          >
            {t("hero.explorePro")}
            <span className="sr-only"> {t("hero.opensInNewTab")}</span>
          </LandingButton>
        </div>
      </section>

      <section aria-label={t("home.featured")} className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-3 [grid-auto-rows:14rem] sm:grid-cols-2 lg:grid-cols-4">
          {bento.map(({ category, component }, index) => (
            <PreviewTile
              key={component.slug}
              category={category}
              component={component}
              caption="overlay"
              maxScale={index === 0 ? 1 : 0.8}
              className={SPANS[index]}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 px-4">
        <p className="text-[13px] text-muted-foreground">{t("home.installHint")}</p>
        <InstallCommand className="w-full" />
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-4">
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-1 border-border p-5",
                index % 2 === 1 && "border-l",
                index >= 2 && "border-t lg:border-t-0",
                index === 2 && "lg:border-l",
              )}
            >
              <dt className="order-2 text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 text-2xl font-medium tracking-tight tabular-nums text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <SponsorRow placement="landing_hero" className="mt-6 justify-center" />
      </div>

      {fresh.length ? (
        <section aria-labelledby="landing-new" className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
          <SectionTitle
            id="landing-new"
            label={t("home.newLabel")}
            title={t("home.newTitle")}
            link={{ href: "/changelog", label: t("home.changelog") }}
          />
          <div className="grid grid-cols-1 gap-3 [grid-auto-rows:15rem] sm:grid-cols-2 lg:grid-cols-4">
            {fresh.slice(0, 8).map(({ category, component, previewKey }) => (
              <PreviewTile
                key={`${category}-${component.slug}`}
                category={category}
                component={component}
                previewKey={previewKey}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="landing-explore" className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
        <SectionTitle
          id="landing-explore"
          label={t("home.exploreLabel")}
          title={t("home.exploreTitle")}
          align="center"
        />
        <CategoryExplorer categories={categories} />
      </section>

      <TestimonialRows className="pt-16 sm:pt-24" />
      <NativeBand className="pt-16 sm:pt-24" />
      <PlansCompare placement="landing_comparison" className="pt-16 sm:pt-24" />
      <FaqList className="pt-16 sm:pt-24" />
      <ContactStrip className="py-16 sm:py-24" />
      <SiteFooter />
    </div>
  );
}

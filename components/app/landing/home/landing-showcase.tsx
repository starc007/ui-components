import { ArrowRight } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useTranslations } from "use-intl";
import { ClaudeIcon, OpenAIIcon, ShadcnIcon, V0Icon } from "@/components/app/brand-icons";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { HeroEyebrow } from "@/components/app/landing/hero-eyebrow";
import styles from "@/components/app/landing/landing.module.css";
import type { NativePhone } from "@/components/app/landing/native-phones";
import { registry } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { AgentsBento } from "./agents-bento";
import { ContactStrip } from "./contact-strip";
import { FaqList } from "./faq-list";
import { LandingButton } from "./landing-button";
import { NATIVE_COUNT, PRO_URL, WEB_COUNT } from "./landing-data";
import { LiveWall } from "./live-wall";
import { NativeBand } from "./native-band";
import { ProBand } from "./pro-band";
import { SponsorRow } from "./sponsor-row";
import { TestimonialRows } from "./testimonial-rows";
import { wallTiles } from "./wall-picks";

const react =
  "[--mark-bg:#d4eaf4] [--mark-fg:#0d3a50] dark:[--mark-bg:rgb(126_192_222/0.2)] dark:[--mark-fg:#cdebf7]";
const reactNative =
  "[--mark-bg:#f8dcc4] [--mark-fg:#4a2310] dark:[--mark-bg:rgb(244_178_124/0.2)] dark:[--mark-fg:#fbdcc3]";

/** Tools beUI installs into: the shadcn CLI and the agents that read its registry. */
const WORKS_WITH: { name: string; icon: ComponentType<SVGProps<SVGSVGElement>>; className?: string }[] = [
  { name: "shadcn", icon: ShadcnIcon },
  { name: "Claude Code", icon: ClaudeIcon },
  { name: "Codex", icon: OpenAIIcon },
  { name: "v0", icon: V0Icon, className: "w-5" },
];

/**
 * The home page. A compact centered hero with the install command, then a
 * wall of live components to play with, filtered by interaction.
 */
export function LandingShowcase({ phones }: { phones: NativePhone[] }) {
  const t = useTranslations("Landing");
  const tiles = wallTiles(registry);
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
        <h1 className="mt-3 text-balance text-[2.25rem] font-medium leading-[1.08] tracking-tight sm:text-5xl">
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

      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>{t("home.worksWith")}</span>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {WORKS_WITH.map(({ name, icon: Icon, className }) => (
              <li key={name} className="inline-flex items-center gap-1.5 text-foreground">
                <Icon className={cn("size-3.5", className)} />
                {name}
              </li>
            ))}
          </ul>
        </div>
        <SponsorRow placement="landing_hero" className="mt-6 justify-center" />
      </div>

      <LiveWall tiles={tiles} className="pt-16 sm:pt-20" />
      <AgentsBento className="pt-16 sm:pt-24" />
      <NativeBand phones={phones} className="pt-16 sm:pt-24" />
      <TestimonialRows className="pt-16 sm:pt-24" />
      <ProBand placement="landing_pro_band" className="pt-16 sm:pt-24" />
      <FaqList className="pt-16 sm:pt-24" />
      <ContactStrip className="py-16 sm:py-24" />
      <SiteFooter />
    </div>
  );
}

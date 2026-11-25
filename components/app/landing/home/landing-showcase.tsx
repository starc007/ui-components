import {
  ArrowRight,
  AudioLines,
  Bot,
  ChartLine,
  Layers,
  LayoutGrid,
  type LucideIcon,
  MousePointerClick,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslations } from "use-intl";
import { ClaudeIcon, OpenAIIcon, ShadcnIcon, V0Icon } from "@/components/app/brand-icons";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { HeroEyebrow } from "@/components/app/landing/hero-eyebrow";
import type { NativePhone } from "@/components/app/landing/native-phones";
import { categoryPath } from "@/lib/component-paths";
import { Link } from "@/lib/navigation";
import { findCategory, registry } from "@/lib/registry";
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

/** The category chips under the headline. */
const HERO_CATEGORIES: { slug: string; icon: LucideIcon }[] = [
  { slug: "motion", icon: Layers },
  { slug: "agents", icon: Bot },
  { slug: "blocks", icon: LayoutGrid },
  { slug: "charts", icon: ChartLine },
  { slug: "micro-interactions", icon: MousePointerClick },
  { slug: "sounds", icon: AudioLines },
];

/** Tools beUI installs into: the shadcn CLI and the agents that read its registry. */
const WORKS_WITH: { name: string; icon: ComponentType<SVGProps<SVGSVGElement>>; className?: string }[] = [
  { name: "shadcn", icon: ShadcnIcon },
  { name: "Claude Code", icon: ClaudeIcon },
  { name: "Codex", icon: OpenAIIcon },
  { name: "v0", icon: V0Icon, className: "w-5" },
];

/**
 * The home page. A left-aligned hero, then a wall of live components to play
 * with, filtered by interaction.
 */
export function LandingShowcase({ phones }: { phones: NativePhone[] }) {
  const t = useTranslations("Landing");
  const tiles = wallTiles(registry);

  return (
    <div className="relative">
      {/* Left-aligned on the wall's container, so the hero and the wall
          share one left edge. The headline and the pitch split the row. */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:pt-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:gap-10">
          <div className="min-w-0">
            <HeroEyebrow count={WEB_COUNT} nativeCount={NATIVE_COUNT} />
            <h1 className="mt-4 max-w-2xl text-balance text-[2.25rem] font-medium leading-[1.08] tracking-tight sm:text-5xl">
              {t("hero.headline")}
            </h1>
            <nav aria-label={t("hero.categoriesLabel")} className="mt-5">
              <ul className="flex flex-wrap gap-1">
                {HERO_CATEGORIES.map(({ slug, icon: Icon }) => (
                  <li key={slug}>
                    <Link
                      href={categoryPath(slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <Icon aria-hidden="true" className="size-3.5" />
                      {findCategory(slug)?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="min-w-0">
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              {t("hero.subtitle")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
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
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span>{t("home.worksWith")}</span>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {WORKS_WITH.map(({ name, icon: Icon, className }) => (
                  <li key={name} className="inline-flex items-center gap-1.5 text-foreground">
                    <Icon className={cn("size-3.5", className)} />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <SponsorRow placement="landing_hero" className="mt-10" />
      </section>

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

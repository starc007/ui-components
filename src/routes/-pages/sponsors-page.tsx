import { useHydrated } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, Check, CircleCheck, Gem, Medal, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { SiteFooter } from "@/components/app/chrome/site-footer";
import { CopyButton } from "@/components/app/docs/copy-button";
import { PressLink } from "@/components/app/press-link";
import {
  OpenSponsorSlot,
  type OpenSponsorSlotSize,
} from "@/components/app/sponsors/open-sponsor-slot";
import { SponsorPlanBeam } from "@/components/app/sponsors/sponsor-plan-beam";
import { LOCALE } from "@/i18n/messages";
import { getTranslations } from "@/i18n/server";
import type { Metadata } from "@/lib/head";
import { useSearchParams } from "@/lib/navigation";
import { DEFAULT_OG_IMAGE } from "@/lib/og-paths";
import {
  SPONSOR_CHECKOUT_URLS,
  SPONSOR_EVM_ADDRESS,
  SPONSOR_SOL_ADDRESS,
} from "@/lib/sponsors-config";
import { cn } from "@/lib/utils";

const PAGE_PATH = "/sponsors";

type PagesT = ReturnType<typeof useTranslations<"Pages.sponsors">>;

export const getSponsorsPage = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const t = getTranslations("Pages.sponsors.meta");
    const metadata: Metadata = {
      title: t("title"),
      description: t("description"),
      alternates: { canonical: PAGE_PATH },
      openGraph: {
        title: `${t("title")} · beUI`,
        description: t("description"),
        url: PAGE_PATH,
        locale: "en_US",
        type: "website",
        siteName: "beUI",
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title: `${t("title")} · beUI`,
        images: [DEFAULT_OG_IMAGE],
      },
    };
    return { metadata };
  });

const GITHUB_SPONSORS_URL = "https://github.com/sponsors/starc007";
const CONTACT_URL = "mailto:hello@beui.dev?subject=beUI%20sponsorship";

const PLAN_STYLES = {
  diamond: {
    card: "border-border bg-card shadow-[0_24px_80px_-48px_rgba(255,255,255,0.75)]",
    icon: "border border-border bg-muted text-foreground",
    Icon: Gem,
    chip: "border-accent/30 bg-accent/10",
    // On phones a filled card takes the full row and open slots pair up.
    grid: "grid-cols-2 md:grid-cols-3",
    filled: "col-span-2 md:col-span-1",
    slot: "lg",
  },
  platinum: {
    card: "border-border bg-card",
    icon: "border border-border bg-muted text-foreground",
    Icon: Trophy,
    chip: "border-border bg-muted",
    grid: "grid-cols-2",
    filled: "",
    slot: "sm",
  },
  silver: {
    card: "border-border bg-card",
    icon: "border border-border bg-muted text-foreground",
    Icon: Medal,
    chip: "border-border bg-muted",
    grid: "grid-cols-2",
    filled: "",
    slot: "sm",
  },
} satisfies Record<
  string,
  {
    card: string;
    icon: string;
    Icon: LucideIcon;
    chip: string;
    grid: string;
    filled: string;
    slot: OpenSponsorSlotSize;
  }
>;

type SponsorTone = keyof typeof PLAN_STYLES;

type DiamondSponsor = {
  name: string;
  /** Key under Pages.sponsors.sponsorTaglines. */
  tagline: "tracwell" | "illos";
  domain: string;
  /** Icon basename in /public/sponsors, with -light and -dark variants. */
  icon: string;
};

const DIAMOND_SPONSORS: DiamondSponsor[] = [
  {
    name: "Tracwell",
    tagline: "tracwell",
    domain: "tracwell.app",
    icon: "tracwell-icon",
  },
  {
    name: "Illos",
    tagline: "illos",
    domain: "illos.dev",
    icon: "illos-icon",
  },
];

function DiamondSponsorCard({
  name,
  tagline,
  domain,
  icon,
  t,
}: DiamondSponsor & { t: PagesT }) {
  return (
    <a
      href={`https://${domain}/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=diamond_sponsor`}
      target="_blank"
      rel="noreferrer noopener"
      className="block h-full min-w-0 rounded-3xl border border-border bg-background p-2 transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-border bg-linear-to-t from-accent/10 to-card px-4 py-6">
        <img
          src={`/sponsors/${icon}-light.svg`}
          alt=""
          width={56}
          height={56}
          className="size-14 shrink-0 dark:hidden"
        />
        <img
          src={`/sponsors/${icon}-dark.svg`}
          alt=""
          width={56}
          height={56}
          className="hidden size-14 shrink-0 dark:block"
        />
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {name}
          </h3>
          <p className="mt-1 max-w-44 text-xs leading-relaxed text-muted-foreground">
            {t(`sponsorTaglines.${tagline}`)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 px-3 py-4">
        <span className="text-sm font-medium text-foreground">{domain}</span>
        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      </div>
    </a>
  );
}

// Filled slots per tier. Adding a sponsor here closes one open slot.
const CURRENT_SPONSORS: Record<
  SponsorTone,
  { id: string; card: (t: PagesT) => ReactNode }[]
> = {
  diamond: DIAMOND_SPONSORS.map((sponsor) => ({
    id: sponsor.domain,
    card: (t: PagesT) => <DiamondSponsorCard {...sponsor} t={t} />,
  })),
  platinum: [],
  silver: [],
};

function planTargetId(tone: SponsorTone) {
  return `sponsor-plan-${tone}`;
}

function openSlotCount(tone: SponsorTone, slots: number) {
  return Math.max(0, slots - CURRENT_SPONSORS[tone].length);
}

function SponsorTier({
  name,
  price,
  tone,
  slots,
  t,
}: {
  name: string;
  price: string;
  tone: SponsorTone;
  slots: number;
  t: PagesT;
}) {
  const styles = PLAN_STYLES[tone];
  const Icon = styles.Icon;
  const sponsors = CURRENT_SPONSORS[tone];
  const open = openSlotCount(tone, slots);
  const headingId = `${tone}-sponsors`;

  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <div className="flex flex-wrap items-center gap-3">
        <h2
          id={headingId}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-medium text-foreground",
            styles.chip,
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          {name}
        </h2>
        <p className="text-xs text-muted-foreground">
          {open > 0 ? t("slotsOpen", { open, slots }) : t("allSlotsTaken")}
        </p>
      </div>
      <div className={cn("mt-4 grid gap-4", styles.grid)}>
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className={styles.filled}>
            {sponsor.card(t)}
          </div>
        ))}
        {Array.from({ length: open }, (_, index) => (
          <OpenSponsorSlot
            // Open slots are interchangeable placeholders with no identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            key={index}
            tier={name}
            price={price}
            targetId={planTargetId(tone)}
            size={styles.slot}
          />
        ))}
      </div>
    </section>
  );
}

// Updated by hand from the Tracwell dashboard. Values are rounded down and
// shown as "at least", so the page never overstates traffic.
const TRAFFIC_UPDATED_AT = new Date("2026-11-08T00:00:00Z");
const TRAFFIC_STATS = [
  { days: 30, visitors: 59_500, pageViews: 800_000 },
  { days: 90, visitors: 178_000, pageViews: 2_450_000 },
];

function TrafficStat({
  label,
  value,
  t,
}: {
  label: string;
  value: number;
  t: PagesT;
}) {
  const compactNumber = new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    // Two fraction digits so 2.45M doesn't round up to 2.5M.
    maximumFractionDigits: 2,
  });
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground"
        title={t("audience.moreThan", { value: value.toLocaleString(LOCALE) })}
      >
        {compactNumber.format(value)}+
      </dd>
    </div>
  );
}

function truncateAddress(address: string) {
  return address.length > 14
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : address;
}

function AddressRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border px-4 py-3">
      <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <p className="min-w-0 truncate whitespace-nowrap font-mono text-sm text-foreground">
        {truncateAddress(address)}
      </p>
      <CopyButton text={address} eventName="copy_sponsor_address" eventLabel={label} />
    </div>
  );
}

function SponsorPlanCard({
  name,
  price,
  description,
  benefits,
  paymentUrl,
  featured = false,
  tone,
  slots,
  t,
}: {
  name: string;
  price: string;
  description: string;
  benefits: string[];
  paymentUrl?: string;
  featured?: boolean;
  tone: SponsorTone;
  slots: number;
  t: PagesT;
}) {
  const styles = PLAN_STYLES[tone];
  const Icon = styles.Icon;
  const href = paymentUrl || CONTACT_URL;
  const open = openSlotCount(tone, slots);

  return (
    <SponsorPlanBeam enabled={featured} className="h-full">
      <div
        id={planTargetId(tone)}
        tabIndex={-1}
        className={cn(
          "relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-3xl border p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
          styles.card,
        )}
      >
        {featured ? (
          <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-foreground px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-background">
            {t("planCard.highestImpact")}
          </span>
        ) : null}
        <div className="flex items-start justify-between gap-4 pr-24">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl",
              styles.icon,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {name}
          </h2>
          <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mt-6 flex items-baseline gap-2 border-t border-border pt-5">
          <span className="text-4xl font-semibold tracking-tight text-foreground">
            {price}
          </span>
          <span className="text-sm text-muted-foreground">
            {t("planCard.perMonth")}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {open > 0 ? t("slotsOpen", { open, slots }) : t("planCard.full")}
          </span>
        </div>
        <ul className="mb-6 mt-6 min-h-32 space-y-3 text-sm text-foreground">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <PressLink
          href={href}
          target={paymentUrl ? "_blank" : undefined}
          rel={paymentUrl ? "noreferrer noopener" : undefined}
          className={cn(
            "group mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors",
            featured
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border bg-background text-foreground hover:border-border-strong",
          )}
        >
          {paymentUrl
            ? t("planCard.sponsorAs", { name })
            : t("planCard.requestLink")}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </PressLink>
      </div>
    </SponsorPlanBeam>
  );
}

export function SponsorsPage() {
  const t = useTranslations("Pages.sponsors");
  // The page is prerendered without a query, so the checkout banner waits for
  // hydration to read ?success=true and keeps the first render matching.
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const checkoutSucceeded = hydrated && searchParams.get("success") === "true";
  const evmAddress = SPONSOR_EVM_ADDRESS;
  const solAddress = SPONSOR_SOL_ADDRESS;
  const sponsorPlans = [
    {
      name: t("plans.diamond.name"),
      price: "$199",
      description: t("plans.diamond.description"),
      benefits: [
        t("plans.diamond.benefits.homePage"),
        t("plans.diamond.benefits.sponsorsPage"),
        t("plans.diamond.benefits.docsSidebar"),
        t("plans.diamond.benefits.readme"),
        t("plans.diamond.benefits.shoutout"),
        t("plans.diamond.benefits.priorityFeedback"),
      ],
      paymentUrl: SPONSOR_CHECKOUT_URLS.diamond,
      featured: true,
      tone: "diamond" as const,
      slots: 3,
    },
    {
      name: t("plans.platinum.name"),
      price: "$99",
      description: t("plans.platinum.description"),
      benefits: [
        t("plans.platinum.benefits.sponsorsPage"),
        t("plans.platinum.benefits.docsSidebar"),
        t("plans.platinum.benefits.readme"),
        t("plans.platinum.benefits.shoutout"),
      ],
      paymentUrl: SPONSOR_CHECKOUT_URLS.platinum,
      tone: "platinum" as const,
      slots: 2,
    },
    {
      name: t("plans.silver.name"),
      price: "$49",
      description: t("plans.silver.description"),
      benefits: [
        t("plans.silver.benefits.sponsorsPage"),
        t("plans.silver.benefits.docsSidebar"),
        t("plans.silver.benefits.readme"),
        t("plans.silver.benefits.publicListing"),
      ],
      paymentUrl: SPONSOR_CHECKOUT_URLS.silver,
      tone: "silver" as const,
      slots: 2,
    },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16">
        {checkoutSucceeded ? (
          <div className="mx-auto mb-8 flex max-w-xl gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                {t("checkout.title")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-900/75 dark:text-emerald-100/75">
                {t("checkout.body")}
              </p>
            </div>
          </div>
        ) : null}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
            {t("hero.title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("hero.body")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <PressLink
              href={GITHUB_SPONSORS_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-border-strong"
            >
              {t("hero.githubCta")}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </PressLink>
          </div>
        </div>

        <section aria-labelledby="traffic-stats" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="traffic-stats"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {t("audience.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("audience.updated", {
                date: new Intl.DateTimeFormat(LOCALE, {
                  dateStyle: "medium",
                  timeZone: "UTC",
                }).format(TRAFFIC_UPDATED_AT),
              })}
            </p>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {TRAFFIC_STATS.map((stat) => (
              <div
                key={stat.days}
                className="rounded-3xl border border-border bg-card p-2"
              >
                <h3 className="px-3 pb-2 pt-2 text-sm font-medium text-foreground">
                  {t("audience.lastDays", { days: stat.days })}
                </h3>
                <dl className="grid grid-cols-2 gap-2">
                  <TrafficStat
                    label={t("audience.visitors")}
                    value={stat.visitors}
                    t={t}
                  />
                  <TrafficStat
                    label={t("audience.pageViews")}
                    value={stat.pageViews}
                    t={t}
                  />
                </dl>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 space-y-10">
          {sponsorPlans
            .filter((plan) => plan.tone === "diamond")
            .map((plan) => (
              <SponsorTier key={plan.tone} {...plan} t={t} />
            ))}
          {/* Platinum and Silver share a row; the 3:2 split keeps each
              Platinum slot wider than a Silver one. */}
          <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:gap-4">
            {sponsorPlans
              .filter((plan) => plan.tone !== "diamond")
              .map((plan) => (
                <SponsorTier key={plan.tone} {...plan} t={t} />
              ))}
          </div>
        </div>

        <section
          id="sponsor-plans"
          aria-label={t("plansLabel")}
          className="mt-12 scroll-mt-24"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {sponsorPlans.map((plan) => (
              <SponsorPlanCard key={plan.tone} {...plan} t={t} />
            ))}
          </div>
        </section>

        {evmAddress || solAddress ? (
          <div className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("crypto")}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {evmAddress ? <AddressRow label="EVM" address={evmAddress} /> : null}
              {solAddress ? (
                <AddressRow label="Solana" address={solAddress} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <SiteFooter />
    </>
  );
}

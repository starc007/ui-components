import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Check, CircleCheck, Gem, Medal, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { CopyButton } from "@/components/app/docs/copy-button";
import { PressLink } from "@/components/app/press-link";
import { SponsorPlanBeam } from "@/components/app/sponsors/sponsor-plan-beam";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Support beUI's development with monthly sponsor stages through Dodo Payments, GitHub Sponsors, or crypto.",
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Sponsors · beUI",
    description:
      "Support beUI's development with monthly sponsor stages through Dodo Payments, GitHub Sponsors, or crypto.",
    url: "/sponsors",
    type: "website",
    siteName: "beUI",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsors · beUI",
    images: ["/api/og"],
  },
};

const GITHUB_SPONSORS_URL = "https://github.com/sponsors/starc007";
const CONTACT_URL = "mailto:hello@beui.dev?subject=beUI%20sponsorship";

const PLAN_STYLES = {
  diamond: {
    card: "border-border bg-card shadow-[0_24px_80px_-48px_rgba(255,255,255,0.75)]",
    icon: "border border-border bg-muted text-foreground",
    Icon: Gem,
  },
  platinum: {
    card: "border-border bg-card",
    icon: "border border-border bg-muted text-foreground",
    Icon: Trophy,
  },
  silver: {
    card: "border-border bg-card",
    icon: "border border-border bg-muted text-foreground",
    Icon: Medal,
  },
} satisfies Record<
  string,
  { card: string; icon: string; Icon: LucideIcon }
>;

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
}: {
  name: string;
  price: string;
  description: string;
  benefits: string[];
  paymentUrl?: string;
  featured?: boolean;
  tone: keyof typeof PLAN_STYLES;
}) {
  const styles = PLAN_STYLES[tone];
  const Icon = styles.Icon;
  const href = paymentUrl || CONTACT_URL;

  return (
    <SponsorPlanBeam enabled={featured} className="h-full">
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-3xl border p-5",
          styles.card,
        )}
      >
        {featured ? (
          <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-foreground px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-background">
            Highest impact
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
        <div className="mt-6 border-t border-border pt-5">
          <span className="text-4xl font-semibold tracking-tight text-foreground">
            {price}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">/mo</span>
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
          {paymentUrl ? `Sponsor as ${name}` : "Request payment link"}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </PressLink>
      </div>
    </SponsorPlanBeam>
  );
}

export default async function SponsorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const checkoutSucceeded = resolvedSearchParams?.success === "true";
  const evmAddress = process.env.SPONSOR_EVM_ADDRESS;
  const solAddress = process.env.SPONSOR_SOL_ADDRESS;
  const sponsorPlans = [
    {
      name: "Diamond",
      price: "$399",
      description:
        "Maximum visibility for teams that want their logo in the highest-signal sponsor slot.",
      benefits: [
        "Largest logo placement on the sponsors page",
        "Largest logo placement in the docs sidebar",
        "Largest logo placement in the README",
        "Shoutout on X after sponsorship",
        "Priority feedback channel for requests",
      ],
      paymentUrl:
        process.env.DODO_SPONSOR_DIAMOND_SUBSCRIPTION_URL ??
        process.env.DODO_SPONSOR_DIAMOND_URL,
      featured: true,
      tone: "diamond" as const,
    },
    {
      name: "Platinum",
      price: "$199",
      description:
        "Prominent placement for product teams supporting polished open-source UI.",
      benefits: [
        "Larger logo placement on the sponsors page",
        "Large logo placement in the docs sidebar",
        "Larger logo placement in the README",
        "Shoutout on X after sponsorship",
      ],
      paymentUrl:
        process.env.DODO_SPONSOR_PLATINUM_SUBSCRIPTION_URL ??
        process.env.DODO_SPONSOR_PLATINUM_URL,
      tone: "platinum" as const,
    },
    {
      name: "Silver",
      price: "$99",
      description:
        "A simple way to support ongoing component work and be listed publicly.",
      benefits: [
        "Logo on the sponsors page",
        "Logo placement in the docs sidebar",
        "Logo in the README",
        "Public sponsor listing",
      ],
      paymentUrl:
        process.env.DODO_SPONSOR_SILVER_SUBSCRIPTION_URL ??
        process.env.DODO_SPONSOR_SILVER_URL,
      tone: "silver" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {checkoutSucceeded ? (
        <div className="mx-auto mb-8 flex max-w-xl gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
              Sponsorship checkout complete
            </p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-900/75 dark:text-emerald-100/75">
              Thanks for sponsoring beUI. I’ll follow up for logo assets and
              placement details.
            </p>
          </div>
        </div>
      ) : null}
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sponsors
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          Support beUI
        </h1>
        <p className="mt-3 text-muted-foreground">
          beUI is free and open source. Sponsor a monthly stage to reach
          developers actively browsing motion components, blocks, and registry
          installs.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <PressLink
            href={GITHUB_SPONSORS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-border-strong"
          >
            Sponsor on GitHub
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </PressLink>
        </div>
      </div>

      <section id="sponsor-plans" className="mt-12">
        <div className="grid gap-4 md:grid-cols-3">
          {sponsorPlans.map((plan) => (
            <SponsorPlanCard key={plan.name} {...plan} />
          ))}
        </div>
      </section>

      {evmAddress || solAddress ? (
        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Crypto
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
  );
}

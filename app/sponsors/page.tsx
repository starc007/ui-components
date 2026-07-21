import type { Metadata } from "next";
import { ArrowUpRight, Check, Gem } from "lucide-react";
import { CopyButton } from "@/components/app/docs/copy-button";
import { PressLink } from "@/components/app/press-link";
import { SponsorPlanBeam } from "@/components/app/sponsors/sponsor-plan-beam";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Support beUI's development with one-time sponsor stages through Dodo Payments, GitHub Sponsors, or crypto.",
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Sponsors · beUI",
    description:
      "Support beUI's development with one-time sponsor stages through Dodo Payments, GitHub Sponsors, or crypto.",
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
    card: "border-border bg-card",
    icon: "bg-foreground text-background",
  },
  platinum: {
    card: "border-border bg-card",
    icon: "bg-foreground text-background",
  },
  silver: {
    card: "border-border bg-card",
    icon: "bg-muted text-foreground",
  },
} as const;

function truncateAddress(address: string) {
  return address.length > 14
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : address;
}

function AddressRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate font-mono text-sm text-foreground">
          {truncateAddress(address)}
        </p>
      </div>
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
  const href = paymentUrl || CONTACT_URL;

  return (
    <SponsorPlanBeam enabled={featured} className="h-full">
      <div
        className={cn(
          "relative flex h-full flex-col rounded-2xl border p-5",
          styles.card,
        )}
      >
        {featured ? (
          <span className="absolute right-4 top-4 rounded-full bg-foreground px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-background">
            Highest impact
          </span>
        ) : null}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            styles.icon,
          )}
        >
          <Gem className="h-4 w-4" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
          {name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-5">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {price}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">one-time</span>
        </div>
        <ul className="mt-6 space-y-3 text-sm text-foreground">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <PressLink
          href={href}
          target={paymentUrl ? "_blank" : undefined}
          rel={paymentUrl ? "noreferrer noopener" : undefined}
          className={cn(
            "group mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors",
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

export default function SponsorsPage() {
  const evmAddress = process.env.SPONSOR_EVM_ADDRESS;
  const solAddress = process.env.SPONSOR_SOL_ADDRESS;
  const sponsorPlans = [
    {
      name: "Diamond",
      price: "$500",
      description:
        "Maximum visibility for teams that want to back beUI where developers discover components.",
      benefits: [
        "Largest logo placement on the sponsors page",
        "Largest logo placement in the README",
        "Shoutout on X after sponsorship",
        "Priority feedback channel for requests",
      ],
      paymentUrl: process.env.DODO_SPONSOR_DIAMOND_URL,
      featured: true,
      tone: "diamond" as const,
    },
    {
      name: "Platinum",
      price: "$250",
      description:
        "Prominent placement for product teams supporting polished open-source UI.",
      benefits: [
        "Larger logo placement on the sponsors page",
        "Larger logo placement in the README",
        "Shoutout on X after sponsorship",
      ],
      paymentUrl: process.env.DODO_SPONSOR_PLATINUM_URL,
      tone: "platinum" as const,
    },
    {
      name: "Silver",
      price: "$100",
      description:
        "A simple way to support ongoing component work and be listed publicly.",
      benefits: [
        "Logo on the sponsors page",
        "Logo in the README",
        "Public sponsor listing",
      ],
      paymentUrl: process.env.DODO_SPONSOR_SILVER_URL,
      tone: "silver" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sponsors
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          Support beUI
        </h1>
        <p className="mt-3 text-muted-foreground">
          beUI is free and open source. Sponsor a one-time stage to help fund
          new components, registry maintenance, and better docs for everyone.
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
        <div className="mt-14 max-w-xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Crypto
          </p>
          {evmAddress ? <AddressRow label="EVM" address={evmAddress} /> : null}
          {solAddress ? <AddressRow label="Solana" address={solAddress} /> : null}
        </div>
      ) : null}
    </div>
  );
}

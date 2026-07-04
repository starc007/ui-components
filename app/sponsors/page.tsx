import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { CopyButton } from "@/components/app/docs/copy-button";
import { PressLink } from "@/components/app/press-link";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Support beUI's development through GitHub Sponsors or directly with crypto.",
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: "Sponsors · beUI",
    description:
      "Support beUI's development through GitHub Sponsors or directly with crypto.",
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

export default function SponsorsPage() {
  const evmAddress = process.env.SPONSOR_EVM_ADDRESS;
  const solAddress = process.env.SPONSOR_SOL_ADDRESS;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sponsors
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        Support beUI
      </h1>
      <p className="mt-3 text-muted-foreground">
        beUI is free and open source. If it's saved you time, consider
        supporting its development.
      </p>

      <PressLink
        href={GITHUB_SPONSORS_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sponsor on GitHub
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </PressLink>

      {evmAddress || solAddress ? (
        <div className="mt-10 space-y-3">
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

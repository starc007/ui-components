import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Site announcement; kept outside the installable component registry. */
export function PulseStrip() {
  return (
    <aside aria-label="Pulse for Mac announcement" className="relative isolate h-11 overflow-hidden border-b border-border bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(110deg,#dbeafe,#d1fae5_30%,#fef3c7_60%,#fce7f3)] opacity-40 dark:opacity-10" />
      <svg aria-hidden="true" viewBox="0 0 1440 44" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 -z-10 h-full w-full fill-background/40">
        <path d="M0 16 Q180 44 360 16 T720 16 T1080 16 T1440 16 V0 H0Z" />
      </svg>
      <Link
        href="https://pulsemac.app/?utm_source=beui&utm_medium=referral&utm_campaign=pulse_launch&utm_content=top_strip"
        target="_blank"
        rel="noreferrer noopener"
        className="flex h-full items-center justify-center gap-2 px-3 text-xs text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:gap-3"
      >
        <Image src="/pulse-icon.png" alt="" width={18} height={18} className="size-[18px] shrink-0" />
        <span className="font-medium">Meet Pulse</span>
        <span className="hidden text-muted-foreground sm:inline">A simple Mac activity monitor.</span>
        <span className="text-muted-foreground sm:hidden">Mac activity monitor.</span>
        <span className="hidden font-medium underline decoration-foreground/30 underline-offset-4 sm:inline">Explore Pulse</span>
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>
    </aside>
  );
}

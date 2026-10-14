"use client";

import type { MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SIZES = {
  lg: {
    root: "min-h-40 rounded-3xl p-6",
    title: "text-base",
  },
  sm: {
    root: "min-h-32 rounded-2xl p-4",
    title: "text-sm",
  },
};

export type OpenSponsorSlotSize = keyof typeof SIZES;

export function OpenSponsorSlot({
  tier,
  price,
  targetId,
  size = "lg",
}: {
  tier: string;
  price: string;
  targetId: string;
  size?: OpenSponsorSlotSize;
}) {
  const styles = SIZES[size];

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent("click_open_sponsor_slot", { label: tier });
    const target = document.getElementById(targetId);
    if (!target) return;
    // The hash link already works without JS; take over only to scroll
    // smoothly and move focus so keyboard users continue from the plan.
    event.preventDefault();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    target.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${targetId}`);
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "group flex h-full min-w-0 flex-col items-center justify-center border border-dashed border-border-strong bg-card/40 text-center transition-colors hover:border-foreground/25 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        styles.root,
      )}
    >
      <span className="min-w-0">
        <span
          className={cn(
            "block font-medium text-foreground",
            styles.title,
          )}
        >
          Your logo here
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {tier} · {price}/mo
        </span>
        <span className="sr-only">View plan</span>
      </span>
    </a>
  );
}

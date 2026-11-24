"use client";

import type { ComponentProps, ReactNode } from "react";
import { PressLink } from "@/components/app/press-link";
import { cn } from "@/lib/utils";

export interface ProCtaProps extends Omit<ComponentProps<typeof PressLink>, "children"> {
  children: ReactNode;
}

// Graphite: the primary fill lit softly from above. Dark mode mirrors it on
// the light primary.
const BASE =
  "group relative isolate inline-flex min-h-10 items-stretch overflow-hidden rounded-full bg-primary bg-linear-to-b from-neutral-700 to-primary text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:from-white dark:to-neutral-300";

const LABEL = "relative flex flex-1 items-center justify-center gap-2 px-4";

const BAND =
  "pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-primary-foreground/25 to-transparent motion-reduce:hidden";

/**
 * The Pro call to action: a graphite primary pill with a soft light band that
 * sweeps across it every few seconds and once more on hover. Reduced motion
 * keeps the pill and drops the band.
 */
export function ProCta({ children, className, ...props }: ProCtaProps) {
  return (
    <PressLink className={cn(BASE, className)} {...props}>
      {/* Idle sweep, every few seconds. It steps aside while the hover sweep runs. */}
      <span aria-hidden="true" className={cn(BAND, "z-10 animate-shine-sweep group-hover:opacity-0")} />
      {/* Hover sweep. It snaps back with no duration once the pointer leaves,
          while it is still outside the pill, so it never runs in reverse. */}
      <span
        aria-hidden="true"
        className={cn(
          BAND,
          "z-10 -translate-x-full -skew-x-12 transition-transform duration-0 group-hover:translate-x-[200%] group-hover:duration-700 group-hover:ease-out",
        )}
      />
      <span className={LABEL}>{children}</span>
    </PressLink>
  );
}

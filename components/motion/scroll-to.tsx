"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import {
  type ScrollTarget,
  type ScrollToOptions,
  useSmoothScroll,
} from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

export interface ScrollToProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** Where to scroll: px offset, selector string or element. */
  to: ScrollTarget;
  /** Extra px offset from the target (e.g. to clear a sticky header). */
  offset?: number;
  /** Override the ease duration in seconds. */
  duration?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Button that smooth-scrolls to a target via the active SmoothScroll provider
 * (or native scroll as a fallback). Respects reduced motion — jumps instantly.
 */
export function ScrollTo({
  to,
  offset,
  duration,
  children,
  className,
  ...rest
}: ScrollToProps) {
  const { scrollTo } = useSmoothScroll();
  const options: ScrollToOptions = { offset, duration };
  return (
    <button
      type="button"
      onClick={() => scrollTo(to, options)}
      className={cn(className)}
      {...rest}
    >
      {children}
    </button>
  );
}
